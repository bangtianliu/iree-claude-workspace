# Directory Map

This document maps out where all IREE/MLIR-related directories live on this system.

**Update the paths below to match your actual setup.**

## Repository Aliases

These aliases are used by `/stage-review` and other commands to resolve short names to paths.

| Alias | Path | Notes |
|-------|------|-------|
| iree | /home/mdawkins/worktrees/iree-transpose-load/iree | Main IREE repository |
| llvm-project | /home/mdawkins/worktrees/iree-transpose-load/iree/third_party/llvm-project | LLVM/MLIR monorepo |
| workspace | /home/mdawkins/worktrees/iree-transpose-load/iree-claude-workspace | This meta-workspace |
| iree-build | /home/mdawkins/worktrees/iree-transpose-load/iree-build | IREE build directory |

### Adding New Repositories

To add a new repository alias:

1. Add a row to the table above with:
   - **Alias**: Short name (no spaces, lowercase recommended)
   - **Path**: Absolute path to the repository
   - **Notes**: Brief description

2. The alias will automatically be available to:
   - `/stage-review <alias>`
   - `/process-review <alias>`
   - `/vscode-diff <alias>`
   - `/prep-pr <alias>`
   - `/task` command (via task frontmatter)

3. Optionally, add the path to `scripts/goto.sh` for shell navigation

**Example:**
```
| my-fork | /home/user/dev/iree-fork | Personal IREE fork |
```

## Build Trees

### Active Builds

**IREE Build (example - update with your actual paths):**
- **Path:** `/path/to/iree-build`
- **Configuration:** RelWithDebInfo
- **CMake flags:** (document your typical flags)

**LLVM Build (if separate):**
- **Path:** `/path/to/llvm-project/build`
- **Configuration:** (your config)

## Environment Setup

**Python Environment:**
- If you have a venv, symlink it: `ln -s /path/to/your/venv ./venv`
- The `scripts/claude.sh` launcher will activate it automatically

**Common Environment Variables:**
```bash
# Add any env vars you typically need
export IREE_BUILD_DIR=/path/to/iree-build
export LLVM_BUILD_DIR=/path/to/llvm-project/build
```

## Notes

[Add environment-specific notes here]
