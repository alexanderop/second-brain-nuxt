#!/usr/bin/env python3
"""Fetch YouTube video transcript using youtube-transcript-api."""
import sys
import re
from youtube_transcript_api import YouTubeTranscriptApi


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


def main():
    if len(sys.argv) < 2:
        print("Usage: get-youtube-transcript.py <youtube-url>", file=sys.stderr)
        sys.exit(1)

    url = sys.argv[1]
    video_id = extract_video_id(url)

    if not video_id:
        print(f"Could not extract video ID from: {url}", file=sys.stderr)
        sys.exit(1)

    try:
        api = YouTubeTranscriptApi()
        transcript = api.fetch(video_id)
        full_text = ' '.join([snippet.text for snippet in transcript])
        print(full_text)
    except Exception as e:
        print(f"Error fetching transcript: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
