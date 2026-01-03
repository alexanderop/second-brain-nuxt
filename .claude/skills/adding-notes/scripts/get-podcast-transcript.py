#!/usr/bin/env python3
"""
Multi-source podcast transcript fetcher with timestamps.

Priority order:
1. YouTube version (if episode exists on YouTube)
2. Podcast website show notes (timestamps + chapter info)
3. Spotify native transcript (if JSON file provided)
4. Description-only fallback

Usage:
    python3 get-podcast-transcript.py --spotify-url "URL" --show-name "Show" --episode-title "Title"
    python3 get-podcast-transcript.py --spotify-json transcript.json
    python3 get-podcast-transcript.py --show-notes-url "https://podcast.com/episode-123/"

Output: JSON with timestamps and segments
"""
import argparse
import json
import re
import sys
from pathlib import Path
from typing import Optional


def ms_to_timestamp(ms: int) -> str:
    """Convert milliseconds to HH:MM:SS or MM:SS format."""
    seconds = ms // 1000
    hours, remainder = divmod(seconds, 3600)
    minutes, secs = divmod(remainder, 60)
    if hours:
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"
    return f"{minutes:02d}:{secs:02d}"


def timestamp_to_ms(timestamp: str) -> int:
    """Convert HH:MM:SS or MM:SS timestamp to milliseconds."""
    parts = timestamp.split(':')
    if len(parts) == 3:
        hours, minutes, seconds = map(int, parts)
        return (hours * 3600 + minutes * 60 + seconds) * 1000
    elif len(parts) == 2:
        minutes, seconds = map(int, parts)
        return (minutes * 60 + seconds) * 1000
    return 0


def parse_spotify_json(json_path: str) -> dict:
    """
    Parse downloaded Spotify transcript JSON with timestamps.

    Expected format from Spotify Transcript Extractor Chrome extension:
    {
        "episodeName": "Episode Title",
        "section": [
            {
                "startMs": 15000,
                "title": {"title": "Chapter Title"},
                "text": {"sentence": {"text": "Transcript text..."}}
            }
        ]
    }
    """
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    segments = []
    for section in data.get('section', []):
        start_ms = section.get('startMs', 0)
        segments.append({
            'timestamp_ms': start_ms,
            'timestamp': ms_to_timestamp(start_ms),
            'title': section.get('title', {}).get('title', ''),
            'text': section.get('text', {}).get('sentence', {}).get('text', '')
        })

    return {
        'source': 'spotify_native',
        'has_timestamps': True,
        'episode_name': data.get('episodeName', ''),
        'segments': segments,
        'full_text': ' '.join(s['text'] for s in segments if s['text'])
    }


def parse_show_notes_timestamps(content: str) -> list[dict]:
    """
    Parse timestamps from show notes content.

    Handles formats:
    - 00:00:00 – Topic Name
    - 00:00 - Topic Name
    - [00:00] Topic Name
    - 00:00 Topic Name
    """
    patterns = [
        r'(\d{1,2}:\d{2}:\d{2})\s*[–\-—]\s*(.+?)(?:\n|$)',  # HH:MM:SS – Topic
        r'(\d{1,2}:\d{2})\s*[–\-—]\s*(.+?)(?:\n|$)',        # MM:SS – Topic
        r'\[(\d{1,2}:\d{2}:\d{2})\]\s*(.+?)(?:\n|$)',       # [HH:MM:SS] Topic
        r'\[(\d{1,2}:\d{2})\]\s*(.+?)(?:\n|$)',             # [MM:SS] Topic
        r'^(\d{1,2}:\d{2}:\d{2})\s+(.+?)(?:\n|$)',          # HH:MM:SS Topic
        r'^(\d{1,2}:\d{2})\s+(.+?)(?:\n|$)',                # MM:SS Topic
    ]

    segments = []
    seen_timestamps = set()

    for pattern in patterns:
        for match in re.finditer(pattern, content, re.MULTILINE):
            timestamp = match.group(1)
            topic = match.group(2).strip()

            # Normalize timestamp to always have seconds
            if timestamp.count(':') == 1:
                timestamp = f"00:{timestamp}"

            if timestamp not in seen_timestamps:
                seen_timestamps.add(timestamp)
                segments.append({
                    'timestamp': timestamp.lstrip('0').lstrip(':') or '0:00',
                    'timestamp_ms': timestamp_to_ms(timestamp),
                    'title': topic,
                    'text': ''  # Show notes typically don't have full text
                })

    # Sort by timestamp
    segments.sort(key=lambda x: x['timestamp_ms'])
    return segments


def parse_show_notes_links(content: str) -> list[dict]:
    """Extract links mentioned in show notes."""
    # Match markdown links and plain URLs
    links = []

    # Markdown links: [text](url)
    for match in re.finditer(r'\[([^\]]+)\]\(([^)]+)\)', content):
        links.append({
            'text': match.group(1),
            'url': match.group(2)
        })

    # Plain URLs with description: description – url or description - url
    for match in re.finditer(r'([^–\-\n]+?)\s*[–\-]\s*(https?://\S+)', content):
        text = match.group(1).strip()
        url = match.group(2).strip()
        if not any(l['url'] == url for l in links):
            links.append({'text': text, 'url': url})

    return links


def create_show_notes_result(
    timestamps: list[dict],
    links: list[dict],
    description: str = ''
) -> dict:
    """Create result object from parsed show notes."""
    return {
        'source': 'show_notes',
        'has_timestamps': len(timestamps) > 0,
        'segments': timestamps,
        'links': links,
        'description': description,
        'full_text': ''  # No full transcript from show notes
    }


def search_youtube_version(episode_title: str, show_name: str) -> Optional[str]:
    """
    Search for YouTube version of podcast episode.
    Returns YouTube URL if found, None otherwise.

    Note: This function is a placeholder. In practice, you would:
    1. Use WebSearch to find the episode
    2. Return the YouTube URL if found
    """
    # This would be implemented by the calling agent using WebSearch
    return None


def create_description_fallback(description: str, url: str) -> dict:
    """Create fallback result when no transcript is available."""
    return {
        'source': 'description_only',
        'has_timestamps': False,
        'segments': [],
        'links': [],
        'description': description,
        'full_text': '',
        'warning': 'No transcript available. Content based on episode description only.'
    }


def main():
    parser = argparse.ArgumentParser(
        description='Multi-source podcast transcript fetcher'
    )
    parser.add_argument(
        '--spotify-json',
        help='Path to Spotify transcript JSON file'
    )
    parser.add_argument(
        '--show-notes',
        help='Raw show notes content with timestamps'
    )
    parser.add_argument(
        '--parse-timestamps',
        action='store_true',
        help='Parse timestamps from stdin input'
    )
    parser.add_argument(
        '--format',
        choices=['json', 'markdown', 'timestamps'],
        default='json',
        help='Output format'
    )

    args = parser.parse_args()

    result = None

    if args.spotify_json:
        # Parse Spotify native transcript
        result = parse_spotify_json(args.spotify_json)

    elif args.show_notes:
        # Parse show notes from argument
        timestamps = parse_show_notes_timestamps(args.show_notes)
        links = parse_show_notes_links(args.show_notes)
        result = create_show_notes_result(timestamps, links, args.show_notes)

    elif args.parse_timestamps:
        # Read from stdin
        content = sys.stdin.read()
        timestamps = parse_show_notes_timestamps(content)
        links = parse_show_notes_links(content)
        result = create_show_notes_result(timestamps, links, content)

    else:
        parser.print_help()
        sys.exit(1)

    # Output based on format
    if args.format == 'json':
        print(json.dumps(result, indent=2, ensure_ascii=False))

    elif args.format == 'timestamps':
        for seg in result.get('segments', []):
            print(f"{seg['timestamp']} - {seg['title']}")

    elif args.format == 'markdown':
        print("## Timestamps\n")
        print("| Time | Topic |")
        print("|------|-------|")
        for seg in result.get('segments', []):
            print(f"| {seg['timestamp']} | {seg['title']} |")

        if result.get('links'):
            print("\n## Resources Mentioned\n")
            for link in result['links']:
                print(f"- [{link['text']}]({link['url']})")


if __name__ == "__main__":
    main()
