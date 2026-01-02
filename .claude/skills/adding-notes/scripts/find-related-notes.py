#!/usr/bin/env python3
"""
Find related notes using local AI embeddings.

Uses sentence-transformers with ONNX backend for fast semantic similarity.
Combines vector embeddings with tag/author matching for hybrid scoring.

Usage:
    find-related-notes.py content/my-note.md
    find-related-notes.py content/my-note.md --limit 5 --min-score 10
    find-related-notes.py content/my-note.md --no-mentions
"""

import argparse
import json
import math
import os
import pickle
import re
import sys
import urllib.request
import urllib.parse
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional


# ============================================================================
# Configuration
# ============================================================================

CONTENT_DIR = Path(__file__).parent.parent.parent.parent.parent / "content"
CACHE_PATH = Path(__file__).parent.parent / "embeddings.pkl"
MODEL_NAME = "all-MiniLM-L6-v2"
MENTIONS_API = "http://localhost:3000/api/mentions"


# ============================================================================
# Data Classes
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


@dataclass
class ScoredNote:
    note: Note
    score: float
    breakdown: list = field(default_factory=list)


# ============================================================================
# Frontmatter Parsing
# ============================================================================

def parse_frontmatter(filepath: Path) -> Optional[Note]:
    """Parse YAML frontmatter from a markdown file."""
    try:
        content = filepath.read_text(encoding="utf-8")
    except Exception as e:
        print(f"Warning: Could not read {filepath}: {e}", file=sys.stderr)
        return None

    # Extract frontmatter between --- markers
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n", content, re.DOTALL)
    if not match:
        return None

    frontmatter = match.group(1)

    # Simple YAML parsing (handles common cases)
    data = {}
    current_key = None
    current_list = None

    for line in frontmatter.split("\n"):
        # List item
        if line.strip().startswith("- ") and current_key:
            if current_list is None:
                current_list = []
                data[current_key] = current_list
            item = line.strip()[2:].strip().strip('"').strip("'")
            current_list.append(item)
        # Key-value pair
        elif ":" in line and not line.startswith(" "):
            current_list = None
            key, _, value = line.partition(":")
            current_key = key.strip()
            value = value.strip().strip('"').strip("'")
            if value:
                data[current_key] = value

    # Skip author files
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
# Embedding Manager
# ============================================================================

class EmbeddingManager:
    """Manages embedding generation and caching."""

    def __init__(self, cache_path: Path = CACHE_PATH):
        self.cache_path = cache_path
        self.model = None
        self.cache = {}  # {slug: {"embedding": np.array, "mtime": float}}
        self._load_cache()

    def _load_cache(self):
        """Load embedding cache from disk."""
        if self.cache_path.exists():
            try:
                with open(self.cache_path, "rb") as f:
                    self.cache = pickle.load(f)
            except Exception as e:
                print(f"Warning: Could not load cache: {e}", file=sys.stderr)
                self.cache = {}

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
                # Try ONNX backend first for speed, fallback to PyTorch
                try:
                    self.model = SentenceTransformer(MODEL_NAME, backend="onnx")
                except Exception:
                    print("ONNX not available, using PyTorch backend...", file=sys.stderr)
                    self.model = SentenceTransformer(MODEL_NAME)
            except ImportError:
                print("Error: sentence-transformers not installed.", file=sys.stderr)
                print("Run: pip install sentence-transformers", file=sys.stderr)
                sys.exit(1)
        return self.model

    def get_embedding(self, note: Note, force: bool = False):
        """Get embedding for a note, using cache if available."""
        import numpy as np

        cache_entry = self.cache.get(note.slug)

        # Check if cached and still valid
        if not force and cache_entry and cache_entry.get("mtime", 0) >= note.mtime:
            return cache_entry["embedding"]

        # Generate new embedding
        model = self.get_model()
        text = note.get_text_for_embedding()
        embedding = model.encode(text, normalize_embeddings=True)

        # Cache it
        self.cache[note.slug] = {
            "embedding": embedding,
            "mtime": note.mtime
        }

        return embedding

    def ensure_all_embeddings(self, notes: list[Note]) -> dict:
        """Ensure all notes have embeddings, return {slug: embedding}."""
        import numpy as np

        embeddings = {}
        needs_update = []

        # Check which notes need embedding updates
        for note in notes:
            cache_entry = self.cache.get(note.slug)
            if cache_entry and cache_entry.get("mtime", 0) >= note.mtime:
                embeddings[note.slug] = cache_entry["embedding"]
            else:
                needs_update.append(note)

        # Batch generate missing embeddings
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
# Scoring
# ============================================================================

def compute_tag_frequencies(notes: list[Note]) -> dict[str, int]:
    """Compute how often each tag appears across all notes."""
    freq = {}
    for note in notes:
        for tag in note.tags:
            freq[tag] = freq.get(tag, 0) + 1
    return freq


def compute_score(
    target: Note,
    candidate: Note,
    target_embedding,
    candidate_embedding,
    tag_freq: dict[str, int]
) -> tuple[float, list[str]]:
    """Compute hybrid similarity score between two notes."""
    import numpy as np

    score = 0.0
    breakdown = []

    # 1. Semantic similarity (cosine = dot product for normalized vectors)
    similarity = float(np.dot(target_embedding, candidate_embedding))
    semantic_score = similarity * 50  # Scale to 0-50 points
    score += semantic_score
    breakdown.append(f"+{semantic_score:.0f}  Semantic similarity ({similarity:.2%})")

    # 2. Tag overlap (weighted by rarity)
    shared_tags = set(target.tags) & set(candidate.tags)
    if shared_tags:
        tag_score = 0
        tag_details = []
        for tag in shared_tags:
            freq = tag_freq.get(tag, 1)
            # Rare tags worth more: 10 / log(1 + freq)
            weight = 10 / math.log(1 + freq)
            tag_score += weight
            rarity = "rare" if freq <= 3 else "common" if freq >= 10 else ""
            tag_details.append(f"{tag}" + (f" ({rarity})" if rarity else ""))
        score += tag_score
        breakdown.append(f"+{tag_score:.0f}  Shared tags: {', '.join(tag_details)}")

    # 3. Same author
    shared_authors = set(target.authors) & set(candidate.authors)
    if shared_authors:
        score += 15
        breakdown.append(f"+15  Same author: {', '.join(shared_authors)}")

    # 4. Same type bonus (smaller)
    if target.type == candidate.type and target.type not in ("note", "evergreen"):
        score += 3
        breakdown.append(f"+3   Same type: {target.type}")

    return score, breakdown


# ============================================================================
# Mentions API
# ============================================================================

def fetch_mentions(title: str, slug: str) -> list[dict]:
    """Fetch unlinked mentions from the dev server API."""
    if len(title) < 3:
        return []

    try:
        url = f"{MENTIONS_API}?slug={urllib.parse.quote(slug)}&title={urllib.parse.quote(title)}"
        with urllib.request.urlopen(url, timeout=2) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception:
        return []


# ============================================================================
# Output Formatting
# ============================================================================

def print_results(
    target: Note,
    scored_notes: list[ScoredNote],
    mentions: list[dict],
    limit: int
):
    """Print formatted results."""
    print()
    print("=" * 60)
    print(f" RELATED NOTES for: {target.slug}")
    print("=" * 60)
    print()

    if not scored_notes:
        print("No related notes found above the score threshold.")
        print()
        return

    print(f"Found {len(scored_notes)} related notes (sorted by relevance):")
    print()

    for i, scored in enumerate(scored_notes[:limit], 1):
        note = scored.note
        print("-" * 60)
        print(f"{i}. [[{note.slug}]] - score: {scored.score:.0f}")
        print("-" * 60)
        print(f"   Type: {note.type} | Authors: {', '.join(note.authors) or 'none'}")
        print(f"   Tags: {', '.join(note.tags) or 'none'}")
        print()
        print("   Score breakdown:")
        for line in scored.breakdown:
            print(f"     {line}")
        print()

    # Mentions section
    if mentions:
        print()
        print("-" * 60)
        print(f"MENTIONS (unlinked references to \"{target.title}\"):")
        print("-" * 60)
        for mention in mentions[:5]:
            snippet = mention.get("snippet", "")[:60]
            print(f"  [[{mention['slug']}]] - \"{snippet}...\"")
        print()

    print("=" * 60)
    print()


# ============================================================================
# Main
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Find related notes using AI embeddings",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument("file", type=Path, help="Path to the note file")
    parser.add_argument("--limit", "-l", type=int, default=10, help="Max suggestions (default: 10)")
    parser.add_argument("--min-score", "-m", type=float, default=5, help="Minimum score threshold (default: 5)")
    parser.add_argument("--no-mentions", action="store_true", help="Skip mentions API")
    parser.add_argument("--rebuild-cache", action="store_true", help="Force rebuild embedding cache")
    args = parser.parse_args()

    # Validate input file
    if not args.file.exists():
        print(f"Error: File not found: {args.file}", file=sys.stderr)
        sys.exit(1)

    # Parse target note
    target = parse_frontmatter(args.file)
    if not target:
        print(f"Error: Could not parse frontmatter from {args.file}", file=sys.stderr)
        sys.exit(1)

    # Get all notes
    all_notes = get_all_notes()
    if not all_notes:
        print("Error: No notes found in content directory", file=sys.stderr)
        sys.exit(1)

    # Filter out the target note
    candidate_notes = [n for n in all_notes if n.slug != target.slug]

    # Initialize embedding manager
    manager = EmbeddingManager()

    # Ensure all notes have embeddings
    all_notes_for_embedding = [target] + candidate_notes
    embeddings = manager.ensure_all_embeddings(all_notes_for_embedding)

    # Compute tag frequencies for weighting
    tag_freq = compute_tag_frequencies(all_notes)

    # Score all candidates
    scored = []
    target_emb = embeddings[target.slug]

    for candidate in candidate_notes:
        candidate_emb = embeddings[candidate.slug]
        score, breakdown = compute_score(target, candidate, target_emb, candidate_emb, tag_freq)
        if score >= args.min_score:
            scored.append(ScoredNote(note=candidate, score=score, breakdown=breakdown))

    # Sort by score descending
    scored.sort(key=lambda x: x.score, reverse=True)

    # Fetch mentions
    mentions = []
    if not args.no_mentions:
        mentions = fetch_mentions(target.title, target.slug)

    # Print results
    print_results(target, scored, mentions, args.limit)


if __name__ == "__main__":
    main()
