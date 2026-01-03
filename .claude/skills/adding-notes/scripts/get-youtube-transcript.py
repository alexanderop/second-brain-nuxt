#!/usr/bin/env python3
"""Fetch YouTube video transcript with automatic language detection."""
import sys
import re
import argparse
from youtube_transcript_api import YouTubeTranscriptApi

# Priority order for languages (manual transcripts preferred over auto-generated)
LANGUAGE_PRIORITY = ['en', 'de', 'fr', 'es', 'pt', 'it', 'nl', 'ja', 'ko', 'zh']


def extract_video_id(url):
    """Extract video ID from various YouTube URL formats."""
    patterns = [
        r'(?:v=|/v/|youtu\.be/)([^&?\s]+)',
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def find_best_transcript(transcript_list, preferred_lang=None):
    """Find the best available transcript based on language priority."""
    available = list(transcript_list)

    if not available:
        return None

    # Separate manual and auto-generated transcripts
    manual = [t for t in available if not t.is_generated]
    generated = [t for t in available if t.is_generated]

    # Build priority list: preferred language first, then standard priority
    priority = LANGUAGE_PRIORITY.copy()
    if preferred_lang and preferred_lang not in priority:
        priority.insert(0, preferred_lang)
    elif preferred_lang:
        priority.remove(preferred_lang)
        priority.insert(0, preferred_lang)

    # Try manual transcripts first (higher quality)
    for lang in priority:
        for t in manual:
            if t.language_code == lang:
                return t

    # Then auto-generated transcripts
    for lang in priority:
        for t in generated:
            if t.language_code == lang:
                return t

    # Fall back to any manual transcript
    if manual:
        return manual[0]

    # Fall back to any generated transcript
    if generated:
        return generated[0]

    return None


def main():
    parser = argparse.ArgumentParser(description='Fetch YouTube transcript')
    parser.add_argument('url', help='YouTube video URL')
    parser.add_argument('--lang', '-l', help='Preferred language code (e.g., de, en, fr)')
    parser.add_argument('--list', '-L', action='store_true', help='List available transcripts')
    args = parser.parse_args()

    video_id = extract_video_id(args.url)
    if not video_id:
        print(f"Could not extract video ID from: {args.url}", file=sys.stderr)
        sys.exit(1)

    try:
        api = YouTubeTranscriptApi()
        transcript_list = api.list(video_id)

        # List mode: show available transcripts and exit
        if args.list:
            print("Available transcripts:")
            for t in transcript_list:
                kind = "manual" if not t.is_generated else "auto"
                print(f"  {t.language_code}: {t.language} ({kind})")
            sys.exit(0)

        # Find best transcript
        best = find_best_transcript(transcript_list, args.lang)

        if not best:
            print("No transcripts available for this video", file=sys.stderr)
            sys.exit(1)

        kind = "manual" if not best.is_generated else "auto-generated"
        print(f"Using {best.language} ({best.language_code}, {kind}) transcript", file=sys.stderr)

        transcript = best.fetch()
        full_text = ' '.join([snippet.text for snippet in transcript])
        print(full_text)

    except Exception as e:
        print(f"Error fetching transcript: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
