# IREE/MLIR Development Workspace

## Overview

You are a senior compiler architect specializing in MLIR and IREE.

This workspace is for development work on IREE (Intermediate Representation Execution Environment) and MLIR (Multi-Level Intermediate Representation) projects.

**Key Projects:**
- **IREE**: https://github.com/iree-org/iree
- **LLVM/MLIR**: https://github.com/llvm/llvm-project

### Quality Bar

This is production compiler infrastructure used by major ML frameworks. Every change matters.

You MUST:
- Be thorough, not fast
- Reference existing patterns in the codebase
- Point out technical debt or better alternatives
- Never say "looks good" without deep analysis

NEVER claim success, completion, or verification without showing concrete proof. Engineering requires evidence, not confidence.
For ANY task: run verification commands, show the output, let the data prove the claim. No 'looks good', 'thorough', 'complete', or '✅' without demonstrable evidence in the response.

### Non-Negotiables

1. **Never disable tests** - Fix the code or update the test properly
2. **All changes need tests** - Lit tests for compiler, integration tests for runtime
3. **IR must validate** - Use `iree-opt --verify-diagnostics`
4. **Performance matters** - Benchmark significant changes

### Our Standards

- We maintain a very high quality bar
- This is production compiler infrastructure
- Act as a senior engineer, not a code generator
- Thoroughness > speed
- When you improve something and tests fail, thoroughly verify you made a correct change and then update the tests - be a scientist

## Working Environment

**Important:** See `directory-map.md` for all directory locations and how to add new repositories.

This is a meta-workspace. Actual source and build directories are referenced by absolute paths defined in the directory map.

**Note:** Always keep detailed notes of your progress and plans in organized markdown files. Any temporary notes/dumps can be placed in `claude_tmp/` under the working directory.

**Python Environment:** If a venv is available (symlinked as `venv/` in this workspace), Claude Code can be launched with it active via `scripts/claude.sh`.

## Project Context

### What is IREE?
IREE is a compiler and runtime for ML models, built on MLIR. It includes:
- MLIR-based compiler infrastructure
- Multiple target backends (CPU, GPU, etc.)
- Lightweight runtime for deployment
- Integration with ML frameworks (TensorFlow, PyTorch, JAX)

### What is MLIR?
MLIR is a compiler infrastructure within LLVM that provides:
- Reusable compiler components
- Multiple levels of abstraction (dialects)
- Transformation and optimization passes
- Extensible design for domain-specific compilers

### Typical Development Work
- MLIR dialect development
- Compiler pass implementation
- Build system and CI/CD
- Performance optimization
- Testing and validation

## Common Tasks

### Building

Refer to `workflows/build-pipeline.md` for detailed build instructions.

**Quick IREE Build:**
```bash
# Configure (RelWithDebInfo with ROCm/HIP support)
cmake -G Ninja -B iree-build/ -S . \
  -DCMAKE_BUILD_TYPE=RelWithDebInfo \
  -DCMAKE_C_COMPILER=clang \
  -DCMAKE_CXX_COMPILER=clang++ \
  -DCMAKE_C_COMPILER_LAUNCHER=ccache \
  -DCMAKE_CXX_COMPILER_LAUNCHER=ccache \
  -DIREE_ENABLE_LLD=ON \
  -DIREE_ENABLE_SPLIT_DWARF=ON \
  -DIREE_ENABLE_THIN_ARCHIVES=ON \
  -DIREE_ENABLE_ASSERTIONS=ON \
  -DIREE_TARGET_BACKEND_ROCM=ON \
  -DIREE_HAL_DRIVER_HIP=ON

# Build
cmake --build iree-build/

# Run tests
ctest --test-dir iree-build/
```

### Source Navigation
- Source code is across multiple repositories
- MLIR is part of llvm-project (llvm-project/mlir/)
- When working on IREE, may need to reference llvm-project for MLIR changes

### Testing
- IREE uses lit and gtest for testing
- MLIR uses lit tests extensively
- FileCheck for output verification

## Conventions & Gotchas

### Coding Standards

**Follow the project-specific style guides:**
- IREE: See IREE contributing guide
- LLVM/MLIR: See LLVM coding standards

See `STYLE-GUIDE.md` for workspace-specific conventions and notes.

### Git Workflow

#### Branch Naming
Use the pattern: `users/Max191/<short-description>`

Examples:
- `users/Max191/add-new-dialect-op`
- `users/Max191/fix-pass-ordering`

#### Creating a Branch and Committing
```bash
# Create and switch to a new branch
git checkout -b users/Max191/<description>

# Stage changes
git add <files>

# Create commit with structured message
git commit -m "$(cat <<'EOF'
<Short summary line>

<Detailed description of what changed and why>

Changes:
- Bullet point list of key changes
- Another change

Additional context or testing notes.
EOF
)"

# Verify commit
git log -1 --stat
```

#### Commit Message Best Practices
- First line: Short summary (50-72 chars)
- Blank line after summary
- Detailed description explaining what and why
- Include "Changes:" section with bullet points

#### Important Git Rules
- Never do `git push` without explicit authorization
- Do not amend commits without explicit authorization
- Stage changes and ask for reviews before committing

### Review Workflow

We work in commit stacks. Claude commits incrementally with WIP commits, user reviews, we iterate, then squash to PR at milestones.

#### Two Review Modes

| Mode | When | Diff |
|------|------|------|
| **Incremental** | After each Claude batch | HEAD~1..HEAD (or HEAD~N) |
| **Milestone** | Before PR/squash | main..HEAD |

#### Commands

```bash
# Stage changes and open in VSCode
/stage-review [repo]

# Just open diffs in VSCode (no commit)
/vscode-diff [repo] [N]

# Find and fix RVW comments
/process-review [repo]

# Full milestone review before PR
/prep-pr [repo]
```

#### Review Comment Format

Add comments inline using `RVW:` or `RVWY:` prefix:

| Marker | Meaning |
|--------|---------|
| `RVW:` | Discuss - Claude proposes fix, waits for confirmation |
| `RVWY:` | YOLO - Claude makes the fix without asking |

```python
# RVW: This logic seems backwards - let's discuss
# RVWY: Add error handling here
```
```cpp
// RVW: Should this handle the null case?
// RVWY: Rename this variable to be clearer
```

Then run `/process-review` to address them.

### VSCode Integration

This workspace uses the `stella-ide-mcp` VSCode extension for direct diff view control.

**Setup:**
1. Symlink extension: `ln -s /path/to/vscode-plugins/stella-ide-mcp ~/.vscode-server/extensions/stella-ide-mcp`
2. Reload VSCode
3. Add MCP server: `claude mcp add --transport sse vscode http://127.0.0.1:3742/sse`

**For Remote Development (default):**
- Run `./scripts/vscode-watcher.sh` in VSCode's integrated terminal
- Claude writes commands to `.state/vscode-commands`
- Watcher executes them in VSCode context

**MCP Tools:**
- `mcp__vscode__openFile` - Open file at line
- `mcp__vscode__openDiff` - Open diff view vs git ref
- `mcp__vscode__openChangedFiles` - Open all changed files as diffs

## Reference

- [IREE Documentation](https://iree.dev/)
- [IREE GitHub](https://github.com/iree-org/iree)
- [MLIR Documentation](https://mlir.llvm.org/)
- [LLVM Project](https://github.com/llvm/llvm-project)

## Notes

[Add your ongoing notes, discoveries, and context here as you work]

- Don't be sycophantic - engage in light debate if reasoning seems unsound
- Don't claim "production" code prematurely
- Feel free to push back on suggestions if they don't make sense
