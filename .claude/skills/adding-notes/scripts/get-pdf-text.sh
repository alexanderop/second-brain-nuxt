#!/usr/bin/env bash
# Extract text from a PDF URL. Requires: curl, pdftotext (poppler)
# Usage: get-pdf-text.sh <URL> [output-file]
# If output-file omitted, writes to /tmp/<filename>.txt

set -euo pipefail

URL="${1:?Usage: get-pdf-text.sh <URL> [output-file]}"
FILENAME=$(basename "$URL" | sed 's/[?#].*//')
TMP_PDF="/tmp/${FILENAME}"

# Check dependency
if ! command -v pdftotext &>/dev/null; then
  echo "ERROR: pdftotext not found. Install with: brew install poppler" >&2
  exit 1
fi

# Download
echo "Downloading: $URL" >&2
curl -sL "$URL" -o "$TMP_PDF"

if [[ ! -s "$TMP_PDF" ]]; then
  echo "ERROR: Download failed or file is empty" >&2
  exit 1
fi

# Extract text
OUTPUT="${2:-/tmp/${FILENAME%.pdf}.txt}"
pdftotext "$TMP_PDF" "$OUTPUT"

LINES=$(wc -l < "$OUTPUT")
echo "Extracted $LINES lines to: $OUTPUT" >&2
echo "$OUTPUT"
