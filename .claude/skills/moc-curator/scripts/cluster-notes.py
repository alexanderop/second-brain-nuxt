#!/usr/bin/env python3
"""
Cluster notes for MOC curation using semantic embeddings.

Uses embeddings from adding-notes skill to:
1. Find notes missing from existing MOCs (moc-gaps)
2. Discover clusters of orphan notes that could form new MOCs (new-clusters)
3. Suggest MOC placement for a specific note (for-note)

Usage:
    cluster-notes.py --mode=full
    cluster-notes.py --mode=moc-gaps
    cluster-notes.py --mode=new-clusters
    cluster-notes.py --mode=for-note --note=my-note-slug
"""

import argparse
import json
import pickle
import re
import sys
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

import numpy as np


# ============================================================================
# Configuration
# ============================================================================

CONTENT_DIR = Path(__file__).parent.parent.parent.parent.parent / "content"
CACHE_PATH = Path(__file__).parent.parent.parent / "adding-notes" / "embeddings.pkl"
MODEL_NAME = "all-MiniLM-L6-v2"

DEFAULT_THRESHOLD = 0.7  # Strict threshold for high confidence
DEFAULT_MIN_CLUSTER_SIZE = 3
DBSCAN_EPS = 0.3  # Distance threshold for DBSCAN (1 - similarity)


# ============================================================================
# Data Classes (from find-related-notes.py)
# ============================================================================

@dataclass
class Note:
    slug: str
    path: Path
    title: str
    type: str = "note"
    tags: list = field(default_factory=list)
    authors: list = field(default_factory=list)
    summary: str = ""
    mtime: float = 0.0

    def get_text_for_embedding(self) -> str:
        """Combine title and summary for embedding."""
        parts = [self.title]
        if self.summary:
            parts.append(self.summary)
        return " ".join(parts)


# ============================================================================
# Frontmatter Parsing (from find-related-notes.py)
# ============================================================================

def parse_frontmatter(filepath: Path) -> Optional[Note]:
    """Parse YAML frontmatter from a markdown file."""
    try:
        content = filepath.read_text(encoding="utf-8")
    except Exception as e:
        print(f"Warning: Could not read {filepath}: {e}", file=sys.stderr)
        return None

    match = re.match(r"^---\s*\n(.*?)\n---\s*\n", content, re.DOTALL)
    if not match:
        return None

    frontmatter = match.group(1)
    data = {}
    current_key = None
    current_list = None

    for line in frontmatter.split("\n"):
        if line.strip().startswith("- ") and current_key:
            if current_list is None:
                current_list = []
                data[current_key] = current_list
            item = line.strip()[2:].strip().strip('"').strip("'")
            current_list.append(item)
        elif ":" in line and not line.startswith(" "):
            current_list = None
            key, _, value = line.partition(":")
            current_key = key.strip()
            value = value.strip().strip('"').strip("'")
            if value:
                data[current_key] = value

    if filepath.parent.name == "authors":
        return None

    slug = filepath.stem
    return Note(
        slug=slug,
        path=filepath,
        title=data.get("title", slug),
        type=data.get("type", "note"),
        tags=data.get("tags", []) if isinstance(data.get("tags"), list) else [],
        authors=data.get("authors", []) if isinstance(data.get("authors"), list) else [],
        summary=data.get("summary", ""),
        mtime=filepath.stat().st_mtime
    )


def get_all_notes() -> list[Note]:
    """Scan content directory for all notes."""
    notes = []
    for md_file in CONTENT_DIR.glob("*.md"):
        note = parse_frontmatter(md_file)
        if note:
            notes.append(note)
    return notes


# ============================================================================
# Embedding Manager (from find-related-notes.py)
# ============================================================================

class EmbeddingManager:
    """Manages embedding generation and caching."""

    def __init__(self, cache_path: Path = CACHE_PATH):
        self.cache_path = cache_path
        self.model = None
        self.cache = {}

        if self.cache_path.exists():
            try:
                with open(self.cache_path, "rb") as f:
                    self.cache = pickle.load(f)
            except Exception as e:
                print(f"Warning: Could not load cache: {e}", file=sys.stderr)

    def _save_cache(self):
        """Save embedding cache to disk."""
        try:
            self.cache_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self.cache_path, "wb") as f:
                pickle.dump(self.cache, f)
        except Exception as e:
            print(f"Warning: Could not save cache: {e}", file=sys.stderr)

    def get_model(self):
        """Lazy-load the sentence transformer model."""
        if self.model is None:
            try:
                from sentence_transformers import SentenceTransformer
                print(f"Loading embedding model ({MODEL_NAME})...", file=sys.stderr)
                try:
                    self.model = SentenceTransformer(MODEL_NAME, backend="onnx")
                except Exception:
                    self.model = SentenceTransformer(MODEL_NAME)
            except ImportError:
                print("Error: sentence-transformers not installed.", file=sys.stderr)
                sys.exit(1)
        return self.model

    def ensure_all_embeddings(self, notes: list[Note]) -> dict:
        """Ensure all notes have embeddings, return {slug: embedding}."""
        embeddings = {}
        needs_update = []

        for note in notes:
            cache_entry = self.cache.get(note.slug)
            if cache_entry and cache_entry.get("mtime", 0) >= note.mtime:
                embeddings[note.slug] = cache_entry["embedding"]
            else:
                needs_update.append(note)

        if needs_update:
            if len(needs_update) > 5:
                print(f"Generating embeddings for {len(needs_update)} notes...", file=sys.stderr)

            model = self.get_model()
            texts = [n.get_text_for_embedding() for n in needs_update]
            new_embeddings = model.encode(texts, normalize_embeddings=True, show_progress_bar=len(texts) > 10)

            for note, emb in zip(needs_update, new_embeddings):
                self.cache[note.slug] = {"embedding": emb, "mtime": note.mtime}
                embeddings[note.slug] = emb

            self._save_cache()

        return embeddings


# ============================================================================
# MOC Analysis
# ============================================================================

def extract_wiki_links(filepath: Path) -> list[str]:
    """Extract all wiki-links [[slug]] from a markdown file."""
    try:
        content = filepath.read_text(encoding="utf-8")
    except Exception:
        return []

    # Find all [[slug]] patterns
    matches = re.findall(r'\[\[([^\]]+)\]\]', content)
    return list(set(matches))


def get_moc_members(moc: Note) -> list[str]:
    """Get slugs of notes linked from a MOC."""
    return extract_wiki_links(moc.path)


def compute_centroid(embeddings: list) -> np.ndarray:
    """Compute normalized centroid of embeddings."""
    if not embeddings:
        return None
    centroid = np.mean(embeddings, axis=0)
    # Normalize for cosine similarity
    norm = np.linalg.norm(centroid)
    if norm > 0:
        centroid = centroid / norm
    return centroid


def find_moc_gaps(
    mocs: list[Note],
    all_notes: list[Note],
    embeddings: dict,
    threshold: float = DEFAULT_THRESHOLD
) -> list[dict]:
    """Find notes that should be in MOCs but aren't linked."""
    results = []
    note_by_slug = {n.slug: n for n in all_notes}

    for moc in mocs:
        member_slugs = get_moc_members(moc)

        # Get embeddings of current members
        member_embeddings = []
        for slug in member_slugs:
            if slug in embeddings:
                member_embeddings.append(embeddings[slug])

        if not member_embeddings:
            continue

        # Compute MOC centroid
        centroid = compute_centroid(member_embeddings)
        if centroid is None:
            continue

        # Find non-members with high similarity to centroid
        missing_notes = []
        for note in all_notes:
            # Skip if already a member, is a MOC itself, or is the MOC
            if note.slug in member_slugs or note.type == "map" or note.slug == moc.slug:
                continue

            if note.slug not in embeddings:
                continue

            # Compute similarity to MOC centroid
            similarity = float(np.dot(centroid, embeddings[note.slug]))

            if similarity >= threshold:
                # Find shared tags for explanation
                moc_tags = set(moc.tags)
                shared_tags = list(set(note.tags) & moc_tags)

                missing_notes.append({
                    "slug": note.slug,
                    "title": note.title,
                    "score": round(similarity, 3),
                    "shared_tags": shared_tags,
                    "type": note.type
                })

        if missing_notes:
            # Sort by score descending
            missing_notes.sort(key=lambda x: x["score"], reverse=True)
            results.append({
                "moc": moc.slug,
                "moc_title": moc.title,
                "current_members": len(member_slugs),
                "missing_notes": missing_notes
            })

    return results


# ============================================================================
# Orphan Clustering
# ============================================================================

def get_orphan_notes(all_notes: list[Note], mocs: list[Note]) -> list[Note]:
    """Find notes not linked from any MOC."""
    # Collect all notes linked from MOCs
    linked_slugs = set()
    for moc in mocs:
        linked_slugs.update(get_moc_members(moc))

    # Find orphans (excluding MOCs themselves)
    orphans = [
        n for n in all_notes
        if n.slug not in linked_slugs and n.type != "map"
    ]
    return orphans


def cluster_orphans(
    orphan_notes: list[Note],
    embeddings: dict,
    eps: float = DBSCAN_EPS,
    min_samples: int = DEFAULT_MIN_CLUSTER_SIZE
) -> list[dict]:
    """Cluster orphan notes using DBSCAN."""
    try:
        from sklearn.cluster import DBSCAN
    except ImportError:
        print("Warning: sklearn not installed. Install with: pip install scikit-learn", file=sys.stderr)
        return []

    if len(orphan_notes) < min_samples:
        return []

    # Build embedding matrix for orphans
    valid_notes = [n for n in orphan_notes if n.slug in embeddings]
    if len(valid_notes) < min_samples:
        return []

    embedding_matrix = np.array([embeddings[n.slug] for n in valid_notes])

    # DBSCAN uses distance, so convert similarity threshold to distance
    # Since embeddings are normalized, distance = 1 - cosine_similarity
    clustering = DBSCAN(eps=eps, min_samples=min_samples, metric='cosine').fit(embedding_matrix)

    # Group notes by cluster label (-1 is noise)
    clusters = {}
    for idx, label in enumerate(clustering.labels_):
        if label == -1:
            continue
        if label not in clusters:
            clusters[label] = []
        clusters[label].append(valid_notes[idx])

    # Build cluster results
    results = []
    for label, notes in clusters.items():
        # Find common tags across cluster
        tag_counts = Counter()
        for note in notes:
            tag_counts.update(note.tags)

        # Get tags that appear in majority of cluster notes
        common_tags = [
            tag for tag, count in tag_counts.most_common(5)
            if count >= len(notes) * 0.4  # At least 40% of notes have this tag
        ]

        # Infer theme from titles and common tags
        theme = infer_theme(notes, common_tags)

        results.append({
            "cluster_id": int(label),
            "theme": theme,
            "common_tags": common_tags,
            "notes": [
                {"slug": n.slug, "title": n.title, "type": n.type}
                for n in notes
            ],
            "size": len(notes)
        })

    # Sort by cluster size descending
    results.sort(key=lambda x: x["size"], reverse=True)
    return results


def infer_theme(notes: list[Note], common_tags: list[str]) -> str:
    """Infer a theme name from notes and tags."""
    if common_tags:
        # Use most common tag as base
        theme = common_tags[0].replace("-", " ").title()
        if len(common_tags) > 1:
            theme += f" & {common_tags[1].replace('-', ' ').title()}"
        return theme

    # Fall back to looking for common words in titles
    words = Counter()
    stop_words = {"the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "of", "with", "is", "are"}
    for note in notes:
        for word in note.title.lower().split():
            word = re.sub(r'[^\w]', '', word)
            if len(word) > 3 and word not in stop_words:
                words[word] += 1

    if words:
        top_words = [w for w, _ in words.most_common(2)]
        return " ".join(top_words).title()

    return "Untitled Cluster"


# ============================================================================
# Single Note Suggestions
# ============================================================================

def suggest_for_note(
    note_slug: str,
    mocs: list[Note],
    all_notes: list[Note],
    embeddings: dict,
    threshold: float = DEFAULT_THRESHOLD
) -> list[dict]:
    """Suggest which MOCs a specific note should join."""
    if note_slug not in embeddings:
        return []

    note_embedding = embeddings[note_slug]
    note = next((n for n in all_notes if n.slug == note_slug), None)
    if not note:
        return []

    suggestions = []

    for moc in mocs:
        member_slugs = get_moc_members(moc)

        # Skip if already a member
        if note_slug in member_slugs:
            continue

        # Get member embeddings
        member_embeddings = [
            embeddings[slug] for slug in member_slugs
            if slug in embeddings
        ]

        if not member_embeddings:
            continue

        # Compute similarity to MOC centroid
        centroid = compute_centroid(member_embeddings)
        if centroid is None:
            continue

        similarity = float(np.dot(centroid, note_embedding))

        if similarity >= threshold:
            # Build reason string
            shared_tags = list(set(note.tags) & set(moc.tags))
            reasons = []
            if shared_tags:
                reasons.append(f"shares tags: {', '.join(shared_tags[:3])}")
            reasons.append(f"semantic similarity: {similarity:.0%}")

            suggestions.append({
                "moc": moc.slug,
                "moc_title": moc.title,
                "score": round(similarity, 3),
                "reason": "; ".join(reasons)
            })

    # Sort by score descending
    suggestions.sort(key=lambda x: x["score"], reverse=True)
    return suggestions


# ============================================================================
# Main
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Cluster notes for MOC curation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        "--mode", "-m",
        choices=["moc-gaps", "new-clusters", "full", "for-note"],
        default="full",
        help="Analysis mode (default: full)"
    )
    parser.add_argument(
        "--note", "-n",
        help="Note slug for --mode=for-note"
    )
    parser.add_argument(
        "--threshold", "-t",
        type=float,
        default=DEFAULT_THRESHOLD,
        help=f"Similarity threshold (default: {DEFAULT_THRESHOLD})"
    )
    parser.add_argument(
        "--min-cluster-size",
        type=int,
        default=DEFAULT_MIN_CLUSTER_SIZE,
        help=f"Minimum cluster size (default: {DEFAULT_MIN_CLUSTER_SIZE})"
    )
    args = parser.parse_args()

    # Validate for-note mode
    if args.mode == "for-note" and not args.note:
        print("Error: --note is required for --mode=for-note", file=sys.stderr)
        sys.exit(1)

    # Load all notes
    all_notes = get_all_notes()
    if not all_notes:
        print("Error: No notes found", file=sys.stderr)
        sys.exit(1)

    # Separate MOCs from content notes
    mocs = [n for n in all_notes if n.type == "map"]

    # Ensure all embeddings are up to date
    manager = EmbeddingManager()
    embeddings = manager.ensure_all_embeddings(all_notes)

    # Build output
    output = {}

    if args.mode in ("moc-gaps", "full"):
        output["moc_updates"] = find_moc_gaps(mocs, all_notes, embeddings, args.threshold)

    if args.mode in ("new-clusters", "full"):
        orphans = get_orphan_notes(all_notes, mocs)
        output["new_clusters"] = cluster_orphans(
            orphans, embeddings,
            min_samples=args.min_cluster_size
        )

    if args.mode == "for-note":
        output["for_note"] = suggest_for_note(
            args.note, mocs, all_notes, embeddings, args.threshold
        )

    # Output JSON
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
