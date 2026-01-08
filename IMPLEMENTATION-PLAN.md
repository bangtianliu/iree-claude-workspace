# IREE/MLIR Workspace Implementation Plan

**STATUS: COMPLETE** - All phases implemented successfully.

## Configuration
- **Workspace path**: `/home/mdawkins/claude-sandbox/iree-claude-workspace`
- **Repos**: `iree`, `llvm-project` (with instructions for adding more)
- **Branch naming**: `users/Max191/<description>`
- **Python venv**: Optional, support if present

## Implementation Checklist

### Phase 1: Directory Structure
- [x] Create base directories
- [x] Create .claude/, tasks/, scripts/, workflows/, docs/, vscode-plugins/

### Phase 2: Core Configuration Files
- [x] CLAUDE.md - Main Claude instructions
- [x] README.md - Human overview
- [x] directory-map.md - Repo aliases with placeholders
- [x] ACTIVE-TASKS.md - Task tracker (empty template)
- [x] STYLE-GUIDE.md - Placeholder with structure
- [x] .gitignore
- [x] .claude/settings.json

### Phase 3: Task Management
- [x] tasks/active/example-task.md - Template
- [x] .claude/active-task - Empty file

### Phase 4: Slash Commands (.claude/commands/)
- [x] stage-review.md
- [x] process-review.md
- [x] vscode-diff.md
- [x] prep-pr.md
- [x] squash-prep.md
- [x] task.md
- [x] wip.md
- [x] vscode-mode.md
- [x] nuke-vscode.md

### Phase 5: Custom Agents (.claude/agents/)
- [x] mlir-expert.md - Placeholder
- [x] iree-build.md - Placeholder
- [x] review-reader.md

### Phase 6: Scripts
- [x] scripts/review.py - Copy from rocm workspace
- [x] scripts/sync-status.sh - Adapt with placeholders
- [x] scripts/goto.sh - Adapt with placeholders
- [x] scripts/vscode-watcher.sh - Copy unchanged
- [x] scripts/nuke-vscode.sh - Copy unchanged
- [x] scripts/claude.sh - Adapt for optional venv

### Phase 7: Documentation
- [x] workflows/build-pipeline.md - IREE placeholder
- [x] workflows/debugging-tips.md - MLIR/IREE placeholder
- [x] workflows/adding-workflows.md - Guide for extending workspace
- [x] docs/technical-guides/README.md - Placeholder index

### Phase 8: VSCode Integration
- [x] Copy vscode-plugins/stella-ide-mcp/ directory entirely
- [x] Create .state/ directory

### Phase 9: Final Steps
- [x] Review all files for consistency
- [ ] Delete this IMPLEMENTATION-PLAN.md (optional - keep for reference)

## File Dependencies

```
CLAUDE.md
  └── references: directory-map.md, STYLE-GUIDE.md, workflows/*

directory-map.md
  └── used by: scripts/review.py, /task command

.claude/commands/*
  └── use: scripts/review.py, mcp__vscode__* tools

scripts/review.py
  └── parses: directory-map.md
  └── reads: .claude/active-task, tasks/active/*.md
```

## Notes
- Default to remote VSCode mode (user's preference)
- Keep all slash commands generic (they work for any project)
- Agents are placeholders - will flesh out later
- Technical guides are placeholders - user will add over time

---

**You can delete this file once you've reviewed the workspace, or keep it for reference.**
