# IREE/MLIR Style Guide

This guide documents coding standards and best practices for working on IREE and MLIR projects.

## Official Style Guides

Always defer to the official project style guides:

- **LLVM/MLIR**: [LLVM Coding Standards](https://llvm.org/docs/CodingStandards.html)
- **IREE**: [IREE Style Guide](https://iree.dev/developers/general/developer-overview/#style-guide)

## Workspace-Specific Conventions

### Code Review Comments

Use these markers for inline review feedback:

| Marker | Meaning | Example |
|--------|---------|---------|
| `RVW:` | Discuss with reviewer | `// RVW: Should this handle empty input?` |
| `RVWY:` | Fix without asking | `// RVWY: Add null check here` |

### Commit Messages

Follow this format:
```
<Short summary line (50-72 chars)>

<Detailed description>

Changes:
- Key change 1
- Key change 2

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Branch Naming

Pattern: `users/Max191/<description>`

Examples:
- `users/Max191/add-fold-pattern`
- `users/Max191/fix-verifier-crash`

## C++ Conventions

<!-- Add IREE/MLIR specific C++ notes here -->

### MLIR-Specific

- Use TableGen for op definitions where possible
- Follow MLIR's declarative patterns for transformations
- Prefer using MLIR's built-in utilities over custom implementations

### IREE-Specific

- Follow IREE's HAL abstraction patterns
- Use IREE's utility functions for common operations

## Python Conventions

<!-- Add Python-specific notes for IREE/MLIR Python bindings -->

## Testing Conventions

### Lit Tests
- Write unit lit tests for compiler transformations using LLVM's FileCheck tool
- Tests will have a set of `// RUN:` lines with the commands to run each test at the beginning; these commands can be used to test output and iterate on test checks
- Lit tests live in the `test` directory of each module, with a `.mlir` extension
- Only add checks for the relevant transformation code that is being tested - too many irrelevant checks is difficult to maintain and bad practice
- Always run the lit test command to view test output before writing the CHECKs for FileCheck
- Use FileCheck for output verification
- Keep tests focused and minimal
- Document expected behavior in test comments

### Running Tests
```bash
# Run tests with ctest
ctest --test-dir iree-build/ -R <regex-for-test-name>
```

### Unit Tests
- Follow GoogleTest conventions
- Test edge cases explicitly

## Refactoring Guidelines

- When cleaning or refactoring code, do not change the existing lit tests to fix failures. Instead, debug and fix the refactored code.
- Ensure that all `llvm::dbgs()` prints are wrapped in `LLVM_DEBUG()`, or use the `LDBG()` macro from `llvm/Support/DebugLog.h` to avoid printing unconditionally.

## Documentation

- Document public APIs
- Include examples in documentation
- Keep docs close to code (same PR when possible)

## Notes

[Add project-specific discoveries and conventions here as you work]
