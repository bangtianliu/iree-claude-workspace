#!/bin/bash
# VSCode command watcher
# Run this in VSCode's integrated terminal to enable Claude to open files/diffs
#
# Usage: ./scripts/vscode-watcher.sh
#
# Commands (written to .state/vscode-commands):
#   openChangedFiles <repo_path> <from_ref> <to_ref> [new_window]
#   openDiff <file_path> [ref]
#   openFile <file_path> [line]

WORKSPACE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
STATE_DIR="$WORKSPACE_DIR/.state"
COMMANDS_FILE="$STATE_DIR/vscode-commands"
MCP_PORT="${MCP_PORT:-3742}"
MCP_URL="http://127.0.0.1:$MCP_PORT"

mkdir -p "$STATE_DIR"
touch "$COMMANDS_FILE"

echo "VSCode watcher started"
echo "  Watching: $COMMANDS_FILE"
echo "  MCP server: $MCP_URL"
echo "  Press Ctrl+C to stop"
echo ""

# Check for inotifywait
if ! command -v inotifywait &> /dev/null; then
    echo "ERROR: inotifywait not found. Install with: sudo apt install inotify-tools"
    exit 1
fi

# Check MCP server is running
if ! curl -s "$MCP_URL/health" > /dev/null 2>&1; then
    echo "WARNING: MCP server not reachable at $MCP_URL"
    echo "Make sure the stella-ide-mcp extension is active in VSCode"
    echo ""
fi

# Call MCP tool via HTTP
call_mcp_tool() {
    local tool_name="$1"
    local args_json="$2"

    # Get SSE session
    local session_response
    session_response=$(curl -s -N "$MCP_URL/sse" 2>/dev/null &
        sleep 0.3
        kill %1 2>/dev/null
    )

    # Simpler approach: just POST directly and let the server handle it
    # The extension listens on /message but needs a session from /sse first
    # For simplicity, we'll use a workaround - create temp session

    # Start SSE connection in background and capture session ID
    local tmpfile=$(mktemp)
    curl -s -N "$MCP_URL/sse" > "$tmpfile" 2>/dev/null &
    local curl_pid=$!
    sleep 0.5

    # Parse session ID from the endpoint event
    local session_id=$(grep -o 'sessionId=[^"]*' "$tmpfile" | head -1 | cut -d= -f2)

    if [[ -z "$session_id" ]]; then
        echo "  ERROR: Could not get MCP session"
        kill $curl_pid 2>/dev/null
        rm -f "$tmpfile"
        return 1
    fi

    # Call the tool
    local request="{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"$tool_name\",\"arguments\":$args_json}}"

    curl -s -X POST "$MCP_URL/message?sessionId=$session_id" \
        -H "Content-Type: application/json" \
        -d "$request" > /dev/null

    # Give time for SSE response
    sleep 0.5

    # Check result from SSE stream
    if grep -q '"success":true' "$tmpfile" 2>/dev/null; then
        echo "  OK"
    elif grep -q '"error"' "$tmpfile" 2>/dev/null; then
        echo "  ERROR: $(grep -o '"error":"[^"]*"' "$tmpfile")"
    fi

    kill $curl_pid 2>/dev/null
    rm -f "$tmpfile"
}

# Parse and execute a command
execute_command() {
    local cmd="$1"
    local parts=($cmd)
    local tool="${parts[0]}"

    case "$tool" in
        openChangedFiles)
            local repo="${parts[1]}"
            local from_ref="${parts[2]:-HEAD~1}"
            local to_ref="${parts[3]:-HEAD}"
            local isolated="${parts[4]:-true}"
            echo "  Opening changed files: $repo ($from_ref..$to_ref) isolated=$isolated"
            call_mcp_tool "openChangedFiles" "{\"repoPath\":\"$repo\",\"fromRef\":\"$from_ref\",\"toRef\":\"$to_ref\",\"isolated\":$isolated}"
            ;;
        openDiff)
            local file="${parts[1]}"
            local ref="${parts[2]:-HEAD}"
            echo "  Opening diff: $file (vs $ref)"
            call_mcp_tool "openDiff" "{\"path\":\"$file\",\"ref\":\"$ref\"}"
            ;;
        openFile)
            local file="${parts[1]}"
            local line="${parts[2]}"
            if [[ -n "$line" ]]; then
                echo "  Opening file: $file:$line"
                call_mcp_tool "openFile" "{\"path\":\"$file\",\"line\":$line}"
            else
                echo "  Opening file: $file"
                call_mcp_tool "openFile" "{\"path\":\"$file\"}"
            fi
            ;;
        *)
            echo "  Unknown command: $tool"
            echo "  Supported: openChangedFiles, openDiff, openFile"
            ;;
    esac
}

# Function to process pending commands
process_commands() {
    if [[ -s "$COMMANDS_FILE" ]]; then
        echo "--- Processing commands ---"
        while IFS= read -r cmd; do
            [[ -z "$cmd" || "$cmd" =~ ^# ]] && continue
            echo "> $cmd"
            execute_command "$cmd"
        done < "$COMMANDS_FILE"

        # Clear the file after execution
        > "$COMMANDS_FILE"
        echo "--- Done ---"
        echo ""
    fi
}

# Process any pending commands first
process_commands

# Watch for changes and execute commands
while true; do
    inotifywait -q -e modify "$COMMANDS_FILE" > /dev/null 2>&1
    process_commands
done
