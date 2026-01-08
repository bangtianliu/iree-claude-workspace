# Guide: Extending This Workspace

This guide explains how to add new slash commands, custom agents, and workflows to your workspace.

## Table of Contents
- [Adding Slash Commands](#adding-slash-commands)
- [Creating Custom Agents](#creating-custom-agents)
- [Adding Workflow Documentation](#adding-workflow-documentation)
- [Updating the Directory Map](#updating-the-directory-map)
- [Script Integration](#script-integration)

---

## Adding Slash Commands

Slash commands are defined as markdown files in `.claude/commands/`.

### Command File Structure

Create a new file: `.claude/commands/<command-name>.md`

```markdown
---
description: Short description shown in /help
allowed-tools: Comma-separated list of tools the command can use
argument-hint: Optional hint shown for arguments (e.g., "[repo] [branch]")
---

Instructions for Claude to follow when the command is invoked.

The argument is available as `{{arg1}}`, `{{arg2}}`, etc.
```

### Available Tools for Commands

Common tool patterns:
- `Read` - Read files
- `Write` - Write files
- `Edit` - Edit files
- `Bash(git:*)` - Run git commands
- `Bash(python:*)` - Run python scripts
- `Bash(command:*)` - Run specific command
- `Glob` - Search for files
- `Grep` - Search file contents
- `mcp__vscode__openFile` - Open file in VSCode (requires MCP)
- `mcp__vscode__openChangedFiles` - Open diffs in VSCode
- `mcp__vscode__openDiff` - Open single file diff

### Example: Simple Command

`.claude/commands/build.md`:
```markdown
---
description: Build IREE with common configuration
allowed-tools: Bash(cmake:*), Bash(ninja:*)
argument-hint: [target]
---

Build IREE. Argument: `{{arg1}}` (optional target, default: all)

1. Navigate to build directory
2. Run: `ninja {{arg1 or ""}}`
3. Report success or failure with relevant output
```

### Example: Command with Script Integration

`.claude/commands/test-dialect.md`:
```markdown
---
description: Run tests for a specific MLIR dialect
allowed-tools: Bash(python:*), Bash(lit:*), Read
---

Run tests for dialect `{{arg1}}`.

1. Find test directory: `python scripts/find-tests.py {{arg1}}`
2. Run lit tests: `lit -v <test_dir>`
3. Summarize results
```

### Tips for Commands
- Keep commands focused on one task
- Use scripts for complex logic (easier to debug)
- Reference `scripts/review.py` as an example of script integration
- Always include clear instructions for Claude
- Use `**STOP and wait**` when user interaction is needed

---

## Creating Custom Agents

Agents are specialized sub-agents defined in `.claude/agents/`.

### Agent File Structure

Create a new file: `.claude/agents/<agent-name>.md`

```markdown
---
name: agent-name
description: What this agent does (shown when selecting agents)
tools: Comma-separated list of tools
model: haiku | sonnet | opus
---

System prompt/instructions for the agent.

Describe:
- What the agent specializes in
- Key knowledge areas
- How it should approach problems
- Any specific patterns or files to reference
```

### Choosing the Model

| Model | Use When | Cost/Speed |
|-------|----------|------------|
| `haiku` | Simple, fast tasks (finding text, basic analysis) | Fast, cheap |
| `sonnet` | Most development tasks | Balanced |
| `opus` | Complex reasoning, architecture decisions | Slow, expensive |

### Example: Domain Expert Agent

`.claude/agents/tablegen-expert.md`:
```markdown
---
name: tablegen-expert
description: TableGen and ODS expert for MLIR dialect development
tools: Read, Grep, Glob, Edit
model: sonnet
---

You are a TableGen expert specializing in MLIR's ODS (Operation Definition Specification).

Key expertise:
- TableGen syntax and semantics
- MLIR ODS patterns and best practices
- Operation, type, and attribute definitions
- Declarative rewrite rules (DRR)
- Interface and trait definitions

When helping with TableGen:
1. Reference existing dialects as examples
2. Follow MLIR's established patterns
3. Consider both the .td file and generated C++ implications
4. Suggest appropriate constraints and verifiers

Common files to reference:
- mlir/include/mlir/IR/OpBase.td
- mlir/include/mlir/Dialect/*/IR/*.td
```

### Example: Task-Specific Agent

`.claude/agents/test-debugger.md`:
```markdown
---
name: test-debugger
description: Helps debug failing lit/gtest tests
tools: Read, Grep, Glob, Bash
model: sonnet
---

You help debug failing tests in IREE and MLIR.

For lit test failures:
1. Read the test file to understand what it's testing
2. Identify the FileCheck patterns that failed
3. Examine the actual output vs expected
4. Suggest fixes or explain the discrepancy

For gtest failures:
1. Locate the test source
2. Understand the test setup and assertions
3. Check for common issues (uninitialized state, order dependencies)
```

---

## Adding Workflow Documentation

Workflow docs go in `workflows/` and document processes.

### Structure

`workflows/<workflow-name>.md`:
```markdown
# Workflow Name

## Overview
Brief description of this workflow.

## Prerequisites
What needs to be set up before using this workflow.

## Steps

### Step 1: Description
```bash
# Commands
```

### Step 2: Description
...

## Troubleshooting

### Common Issue 1
**Problem:** Description
**Solution:** How to fix

## Notes
Additional context, tips, discoveries.
```

### Examples of Workflows to Add

- `building-iree.md` - Common build configurations and patterns
- `debugging-mlir.md` - MLIR debugging techniques (-print-ir-*, etc.)
- `adding-dialect-op.md` - Step-by-step for adding a new operation
- `running-tests.md` - Test infrastructure guide

---

## Updating the Directory Map

When adding new repositories:

1. Edit `directory-map.md`
2. Add a row to the Repository Aliases table:

```markdown
| Alias | Path | Notes |
|-------|------|-------|
| new-repo | /absolute/path/to/repo | Brief description |
```

3. The alias immediately works with:
   - `/stage-review new-repo`
   - `/vscode-diff new-repo`
   - `/prep-pr new-repo`
   - Task frontmatter: `repositories: [new-repo]`

4. Optionally update `scripts/goto.sh` for shell navigation

---

## Script Integration

For complex commands, create supporting scripts in `scripts/`.

### Pattern: Python Script with JSON Output

Commands can call scripts that output JSON for structured data.

`scripts/find-tests.py`:
```python
#!/usr/bin/env python3
import json
import sys

def find_tests(dialect):
    # Logic to find tests
    return {"tests": [...], "count": N}

if __name__ == "__main__":
    result = find_tests(sys.argv[1])
    print(json.dumps(result, indent=2))
```

Command usage:
```markdown
Run `python scripts/find-tests.py {{arg1}}` and parse the JSON output.
```

### Pattern: Bash Script for Shell Operations

`scripts/setup-env.sh`:
```bash
#!/bin/bash
# Setup environment for specific task
export SOME_VAR=value
echo "Environment configured"
```

### Existing Scripts to Reference

- `scripts/review.py` - Complex script with multiple subcommands, JSON output, directory-map parsing
- `scripts/vscode-watcher.sh` - File watcher pattern for remote VSCode
- `scripts/claude.sh` - Environment setup and launcher

---

## Quick Reference

### File Locations

| Type | Location | Extension |
|------|----------|-----------|
| Slash commands | `.claude/commands/` | `.md` |
| Custom agents | `.claude/agents/` | `.md` |
| Workflows | `workflows/` | `.md` |
| Scripts | `scripts/` | `.py`, `.sh` |
| Tech guides | `docs/technical-guides/` | `.md` |

### Frontmatter Fields

**Commands:**
```yaml
---
description: Required - shown in help
allowed-tools: Required - comma-separated
argument-hint: Optional - e.g., "[file] [line]"
---
```

**Agents:**
```yaml
---
name: Required - identifier
description: Required - shown when selecting
tools: Required - comma-separated
model: Required - haiku/sonnet/opus
---
```

### Testing Your Additions

1. **Commands:** Run the command and verify behavior
2. **Agents:** Use in a task and verify expertise
3. **Scripts:** Run directly with test inputs
4. **Workflows:** Follow the steps manually

---

## Tips

1. **Start simple** - Add basic functionality first, enhance later
2. **Reference existing** - Look at existing commands/agents as templates
3. **Document as you go** - Add notes to files about what you learned
4. **Iterate** - It's easy to edit these files as you discover improvements
