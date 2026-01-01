#!/usr/bin/env python3
"""Fetch Reddit thread data via JSON API.

Usage:
    python3 get-reddit-thread.py "URL" [--comments N] [--min-score N]

Examples:
    python3 get-reddit-thread.py "https://www.reddit.com/r/ClaudeCode/comments/1q193fr/awesome_list/"
    python3 get-reddit-thread.py "https://redd.it/1q193fr" --comments 5
"""

import sys
import re
import json
import argparse
from html import unescape
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError


USER_AGENT = "SecondBrain/1.0 (personal note-taking app)"


def normalize_url(url: str) -> tuple[str, str]:
    """Extract post ID and construct API URL.

    Returns (api_url, canonical_url).
    """
    url = url.strip()

    # Handle redd.it shortlinks
    redd_it_match = re.search(r'redd\.it/(\w+)', url)
    if redd_it_match:
        post_id = redd_it_match.group(1)
        # Fetch the redirect to get the full URL
        api_url = f"https://www.reddit.com/comments/{post_id}.json"
        canonical_url = f"https://www.reddit.com/comments/{post_id}"
        return api_url, canonical_url

    # Handle standard Reddit URLs
    # Patterns: /r/sub/comments/ID/title/ or /user/name/comments/ID/title/
    comment_match = re.search(r'(?:reddit\.com)(?:/r/\w+|/user/\w+)?/comments/(\w+)', url)
    if comment_match:
        post_id = comment_match.group(1)
        # Extract subreddit if present
        sub_match = re.search(r'/r/(\w+)/comments/', url)
        if sub_match:
            subreddit = sub_match.group(1)
            api_url = f"https://www.reddit.com/r/{subreddit}/comments/{post_id}.json?sort=top&limit=100"
            canonical_url = f"https://www.reddit.com/r/{subreddit}/comments/{post_id}"
        else:
            api_url = f"https://www.reddit.com/comments/{post_id}.json?sort=top&limit=100"
            canonical_url = f"https://www.reddit.com/comments/{post_id}"
        return api_url, canonical_url

    raise ValueError(f"Could not parse Reddit URL: {url}")


def fetch_json(url: str) -> dict:
    """Fetch JSON from Reddit API."""
    request = Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urlopen(request, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as e:
        if e.code == 429:
            raise RuntimeError("Rate limited by Reddit. Wait 60 seconds and retry.")
        elif e.code == 404:
            raise RuntimeError("Thread not found. It may be deleted or private.")
        elif e.code == 403:
            raise RuntimeError("Access forbidden. Thread may be in a quarantined subreddit.")
        else:
            raise RuntimeError(f"HTTP error {e.code}: {e.reason}")
    except URLError as e:
        raise RuntimeError(f"Network error: {e.reason}")


def clean_text(text: str) -> str:
    """Clean up Reddit text content."""
    if not text:
        return ""
    # Decode HTML entities
    text = unescape(text)
    # Remove excessive whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def truncate(text: str, max_length: int = 500) -> str:
    """Truncate text with ellipsis if too long."""
    if len(text) <= max_length:
        return text
    return text[:max_length].rsplit(' ', 1)[0] + "..."


def extract_thread_data(data: list, num_comments: int = 10, min_score: int = 0) -> dict:
    """Extract relevant data from Reddit JSON response."""
    # Reddit returns an array: [post_data, comments_data]
    if len(data) < 2:
        raise RuntimeError("Unexpected Reddit API response format")

    post_data = data[0]["data"]["children"][0]["data"]
    comments_listing = data[1]["data"]["children"]

    # Extract post info
    result = {
        "title": clean_text(post_data.get("title", "")),
        "author": post_data.get("author", "[deleted]"),
        "subreddit": post_data.get("subreddit", ""),
        "score": post_data.get("score", 0),
        "upvote_ratio": post_data.get("upvote_ratio", 0),
        "selftext": clean_text(post_data.get("selftext", "")),
        "url": post_data.get("url", ""),
        "is_self": post_data.get("is_self", True),
        "permalink": f"https://www.reddit.com{post_data.get('permalink', '')}",
        "comments": []
    }

    # Extract comments
    for item in comments_listing:
        if item.get("kind") != "t1":  # t1 = comment
            continue

        comment = item["data"]
        author = comment.get("author", "[deleted]")
        body = clean_text(comment.get("body", ""))
        score = comment.get("score", 0)

        # Skip deleted, removed, or AutoModerator comments
        if author in ("[deleted]", "AutoModerator") or not body or body == "[removed]":
            continue

        # Skip low-score comments
        if score < min_score:
            continue

        result["comments"].append({
            "author": author,
            "body": body,
            "score": score
        })

    # Sort by score and limit
    result["comments"] = sorted(result["comments"], key=lambda c: c["score"], reverse=True)[:num_comments]

    return result


def format_output(data: dict) -> str:
    """Format thread data for output."""
    lines = []

    # Header info
    lines.append(f"Title: {data['title']}")
    lines.append(f"Author: u/{data['author']}")
    lines.append(f"Subreddit: r/{data['subreddit']}")
    lines.append(f"Score: {data['score']} ({int(data['upvote_ratio'] * 100)}% upvoted)")
    lines.append(f"URL: {data['permalink']}")
    lines.append("")

    # Post content
    if data["selftext"]:
        lines.append("## Post Content")
        lines.append("")
        lines.append(data["selftext"])
        lines.append("")
    elif not data["is_self"]:
        lines.append("## Link Post")
        lines.append(f"Links to: {data['url']}")
        lines.append("")

    # Comments
    if data["comments"]:
        lines.append("## Top Comments")
        lines.append("")
        for i, comment in enumerate(data["comments"], 1):
            body = truncate(comment["body"], 500)
            lines.append(f"### {i}. u/{comment['author']} ({comment['score']} points)")
            lines.append("")
            lines.append(body)
            lines.append("")
    else:
        lines.append("## Comments")
        lines.append("No comments meet the criteria.")
        lines.append("")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Fetch Reddit thread data")
    parser.add_argument("url", help="Reddit thread URL")
    parser.add_argument("--comments", type=int, default=10, help="Number of top comments to fetch (default: 10)")
    parser.add_argument("--min-score", type=int, default=0, help="Minimum comment score to include (default: 0)")

    args = parser.parse_args()

    try:
        api_url, canonical_url = normalize_url(args.url)
        data = fetch_json(api_url)
        thread_data = extract_thread_data(data, args.comments, args.min_score)
        print(format_output(thread_data))
    except (ValueError, RuntimeError) as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
