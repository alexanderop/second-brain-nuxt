#!/usr/bin/env python3
"""
Scrape tweet content from nitter instances or prompt for manual entry.

Usage:
    python3 scrape-tweet.py "https://x.com/naval/status/1234567890"

Output (JSON):
    {
        "tweetId": "1234567890",
        "authorHandle": "naval",
        "authorName": "Naval Ravikant",
        "tweetText": "Tweet content...",
        "tweetedAt": "2024-01-15"
    }
"""

import sys
import re
import json
from urllib.parse import urlparse
from datetime import datetime

# Nitter instances to try (privacy-friendly Twitter frontends)
NITTER_INSTANCES = [
    "nitter.net",
    "nitter.privacydev.net",
    "nitter.poast.org",
    "nitter.lucabased.xyz",
]


def extract_tweet_info(url: str) -> dict:
    """Extract tweet ID and author handle from Twitter/X URL."""
    # Patterns: x.com/user/status/id or twitter.com/user/status/id
    pattern = r"(?:x\.com|twitter\.com)/([^/]+)/status/(\d+)"
    match = re.search(pattern, url)

    if not match:
        raise ValueError(f"Invalid Twitter/X URL: {url}")

    return {
        "authorHandle": match.group(1),
        "tweetId": match.group(2),
    }


def try_nitter_scrape(tweet_id: str, author_handle: str) -> dict | None:
    """Attempt to scrape tweet from nitter instances."""
    try:
        import requests
        from bs4 import BeautifulSoup
    except ImportError:
        # Dependencies not available
        return None

    for instance in NITTER_INSTANCES:
        try:
            url = f"https://{instance}/{author_handle}/status/{tweet_id}"
            response = requests.get(url, timeout=10, headers={
                "User-Agent": "Mozilla/5.0 (compatible; SecondBrain/1.0)"
            })

            if response.status_code != 200:
                continue

            soup = BeautifulSoup(response.text, "html.parser")

            # Extract tweet text
            tweet_content = soup.select_one(".tweet-content")
            if not tweet_content:
                continue
            tweet_text = tweet_content.get_text(strip=True)

            # Extract author name
            author_name_el = soup.select_one(".fullname")
            author_name = author_name_el.get_text(strip=True) if author_name_el else author_handle

            # Extract date
            date_el = soup.select_one(".tweet-date a")
            tweeted_at = None
            if date_el and date_el.get("title"):
                try:
                    dt = datetime.strptime(date_el["title"], "%b %d, %Y · %I:%M %p %Z")
                    tweeted_at = dt.strftime("%Y-%m-%d")
                except ValueError:
                    pass

            return {
                "tweetText": tweet_text,
                "authorName": author_name,
                "tweetedAt": tweeted_at or datetime.now().strftime("%Y-%m-%d"),
            }

        except Exception:
            continue

    return None


def prompt_manual_entry(tweet_id: str, author_handle: str) -> dict:
    """Prompt user for manual tweet entry."""
    print(f"\nCould not scrape tweet {tweet_id} automatically.", file=sys.stderr)
    print("Please provide the following information:\n", file=sys.stderr)

    tweet_text = input("Tweet text: ").strip()
    if not tweet_text:
        raise ValueError("Tweet text is required")

    author_name = input(f"Author display name [{author_handle}]: ").strip()
    if not author_name:
        author_name = author_handle

    date_str = input("Posted date (YYYY-MM-DD): ").strip()
    try:
        datetime.strptime(date_str, "%Y-%m-%d")
        tweeted_at = date_str
    except ValueError:
        tweeted_at = datetime.now().strftime("%Y-%m-%d")
        print(f"Invalid date, using today: {tweeted_at}", file=sys.stderr)

    return {
        "tweetText": tweet_text,
        "authorName": author_name,
        "tweetedAt": tweeted_at,
    }


def main():
    if len(sys.argv) < 2:
        print("Usage: scrape-tweet.py <tweet-url>", file=sys.stderr)
        sys.exit(1)

    url = sys.argv[1]

    try:
        info = extract_tweet_info(url)
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    # Try nitter scraping first
    scraped = try_nitter_scrape(info["tweetId"], info["authorHandle"])

    if scraped:
        result = {**info, **scraped}
    else:
        # Fallback to manual entry
        manual = prompt_manual_entry(info["tweetId"], info["authorHandle"])
        result = {**info, **manual}

    # Output JSON
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
