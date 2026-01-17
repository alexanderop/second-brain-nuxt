#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$SCRIPT_DIR/e2e-progress.txt"

cd "$PROJECT_ROOT"

MAX_ITERATIONS=${1:-10}

echo "Starting E2E fix automation with max $MAX_ITERATIONS iterations"
echo "=== E2E Fix Session Started: $(date) ===" >> "$LOG_FILE"

for ((i=1; i<=$MAX_ITERATIONS; i++)); do
    echo "========== Iteration $i of $MAX_ITERATIONS =========="

    # Run E2E tests and capture output
    set +e
    test_output=$(pnpm test:e2e 2>&1)
    test_exit_code=$?
    set -e

    # Success - all tests pass
    if [ $test_exit_code -eq 0 ]; then
        echo "All E2E tests pass!"
        echo "=== All tests passing after $i iteration(s) - $(date) ===" >> "$LOG_FILE"
        exit 0
    fi

    echo "Tests failed (exit code: $test_exit_code). Calling Claude to fix..."

    # Extract relevant error info (last 200 lines to stay within context)
    error_context=$(echo "$test_output" | tail -200)

    # Call Claude to fix the errors
    set +e
    claude --dangerously-skip-permissions -p "
The following E2E test(s) failed. Fix the failing test(s) or the application code.

ERROR OUTPUT:
$error_context

INSTRUCTIONS:
1. Analyze the error - determine if it's a test issue or app code issue
2. Fix the root cause (prefer fixing app code over making tests pass artificially)
3. Run pnpm lint:fix && pnpm typecheck after changes
4. Append a brief summary of what you fixed to ralph/e2e-progress.txt
5. Make a git commit with the fix

Focus on ONE failure at a time. Be surgical - minimal changes to fix the issue.
"
    claude_exit_code=$?
    set -e

    if [ $claude_exit_code -ne 0 ]; then
        echo "Warning: Claude exited with code $claude_exit_code"
    fi

    echo "Iteration $i finished"
done

echo "Max iterations ($MAX_ITERATIONS) reached. Some tests may still be failing."
echo "=== Max iterations reached - $(date) ===" >> "$LOG_FILE"
exit 1
