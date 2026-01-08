#!/usr/bin/env bash
# Quick navigation helper for IREE/MLIR directories
# Source this script or create aliases based on it

# Update these paths to match your directory-map.md
export IREE_ROOT="/path/to/iree"
export IREE_BUILD="/path/to/iree-build"
export LLVM_ROOT="/path/to/llvm-project"
export LLVM_BUILD="/path/to/llvm-project/build"
export MLIR_ROOT="/path/to/llvm-project/mlir"

# Usage: goto <location>
goto() {
    case "$1" in
        iree|i)
            cd "$IREE_ROOT" || return 1
            ;;
        iree-build|ib)
            cd "$IREE_BUILD" || return 1
            ;;
        llvm|l)
            cd "$LLVM_ROOT" || return 1
            ;;
        llvm-build|lb)
            cd "$LLVM_BUILD" || return 1
            ;;
        mlir|m)
            cd "$MLIR_ROOT" || return 1
            ;;
        workspace|ws)
            cd "$(dirname "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")")" || return 1
            ;;
        *)
            echo "Usage: goto <location>"
            echo ""
            echo "Available locations:"
            echo "  iree, i           - IREE repository"
            echo "  iree-build, ib    - IREE build directory"
            echo "  llvm, l           - LLVM project repository"
            echo "  llvm-build, lb    - LLVM build directory"
            echo "  mlir, m           - MLIR directory (in llvm-project)"
            echo "  workspace, ws     - This workspace"
            return 1
            ;;
    esac
    pwd
}

# Create quick aliases
alias iree-cd="cd $IREE_ROOT"
alias llvm-cd="cd $LLVM_ROOT"
alias mlir-cd="cd $MLIR_ROOT"
alias ws-cd="cd \$(dirname \$(dirname \$(readlink -f \${BASH_SOURCE[0]})))"

echo "IREE/MLIR navigation helpers loaded"
echo "Usage: goto <location>"
echo "Type 'goto' with no arguments to see available locations"
