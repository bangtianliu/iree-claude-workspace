# IREE/MLIR Claude Code Workspace

This is a dedicated workspace for using Claude Code to work on IREE and MLIR projects.

## Purpose

As a developer working on IREE/MLIR, my workflow involves:
- Multiple source repositories (IREE, llvm-project, etc.)
- Multiple build directories
- Complex compiler development workflows

Rather than making the IREE project hierarchy itself the Claude Code workspace, this separate meta-repository serves as a "control center" that:
- Provides centralized context and documentation for Claude Code
- Maps out where all the various directories live
- Contains workflows, notes, and helper scripts
- Stays version-controlled without polluting the actual project repositories

## Setup

1. Clone/create this repository
2. Update `directory-map.md` with your actual directory paths
3. Update `CLAUDE.md` with any project-specific context
4. (Optional) Symlink your Python venv as `venv/` in this workspace
5. Run Claude Code from this directory
6. Reference actual source/build directories using absolute paths or aliases

## Usage Pattern

```bash
cd /path/to/iree-claude-workspace

# Launch Claude Code (optionally with venv)
./scripts/claude.sh
# Or just: claude

# Claude can read/edit files anywhere via absolute paths
```

## Structure

- `CLAUDE.md` - Overall project context for Claude Code
- `directory-map.md` - Map of all related directories on your system
- `ACTIVE-TASKS.md` - Track current and background tasks
- `STYLE-GUIDE.md` - Coding conventions and standards
- `tasks/` - Task-specific notes and context
  - `tasks/active/` - Currently active tasks
  - `tasks/completed/` - Archived completed tasks
- `workflows/` - Common workflows and procedures
- `docs/` - Technical documentation and guides
- `scripts/` - Helper scripts
- `vscode-plugins/` - VSCode MCP extension for integration

## Task Management

This workspace supports juggling multiple tasks simultaneously:

### Starting a New Task

1. Create a new file: `tasks/active/your-task-name.md`
2. Use `tasks/active/example-task.md` as a template
3. Add your task to `ACTIVE-TASKS.md`
4. Switch to the task: Tell Claude "I'm working on your-task-name" or use `/task your-task-name`

### Working with Tasks

- **Switch tasks verbally:** "Let's work on the dialect-refactor task now"
- **Use the slash command:** `/task dialect-refactor`
- **Check active tasks:** Ask Claude to read `ACTIVE-TASKS.md`

### Completing Tasks

```bash
# Move to completed directory
mv tasks/active/task-name.md tasks/completed/

# Update ACTIVE-TASKS.md to remove it from the list
```

## VSCode Integration (Remote Development)

For remote development with VSCode:

1. Install the `stella-ide-mcp` extension (symlink to `~/.vscode-server/extensions/`)
2. Add MCP server to Claude: `claude mcp add --transport sse vscode http://127.0.0.1:3742/sse`
3. Run `./scripts/vscode-watcher.sh` in VSCode's integrated terminal
4. Use `/vscode-mode remote` (default)

Claude can then open files and diffs directly in your VSCode window.

## Extending This Workspace

See `workflows/adding-workflows.md` for a guide on:
- Adding new slash commands
- Creating custom agents
- Adding new workflows and documentation
