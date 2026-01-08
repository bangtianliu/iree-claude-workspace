#!/bin/bash
# Launcher for Claude Code in the IREE/MLIR workspace.
# Activates the Python venv if available before launching.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="$(dirname "$SCRIPT_DIR")"

# Deactivate any active Python venv
if [[ -n "$VIRTUAL_ENV" ]]; then
    deactivate 2>/dev/null || true
fi

# Activate the workspace venv if it exists
if [[ -f "$WORKSPACE_DIR/venv/bin/activate" ]]; then
    source "$WORKSPACE_DIR/venv/bin/activate"
    echo "Activated venv: $WORKSPACE_DIR/venv"
else
    echo "No venv found at $WORKSPACE_DIR/venv (continuing without venv)"
fi

# Add any additional environment setup here
# For example:
# export IREE_BUILD_DIR=/path/to/iree-build
# export LLVM_BUILD_DIR=/path/to/llvm-project/build

# Launch Claude in the workspace directory
cd "$WORKSPACE_DIR"
exec claude "$@"
