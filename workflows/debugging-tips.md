# MLIR/IREE Debugging Tips

## Overview

This document collects debugging techniques for MLIR and IREE development.

<!-- TODO: Add more techniques as you discover them -->

## MLIR Debugging

### Print IR at Various Stages

```bash
# Print IR after all passes
iree-compile --mlir-print-ir-after-all input.mlir

# Print IR after specific pass
iree-compile --mlir-print-ir-after=<pass-name> input.mlir

# Print IR before and after
iree-compile --mlir-print-ir-before-all --mlir-print-ir-after-all input.mlir

# Print IR only on change
iree-compile --mlir-print-ir-after-change input.mlir
```

### Pass Debugging

```bash
# Print pass pipeline
iree-compile --mlir-print-ir-before-all --mlir-disable-threading input.mlir

# Run specific pass pipeline with iree-opt (note: nesting must match expected structure)
iree-opt --pass-pipeline="builtin.module(func.func(cse,canonicalize))" input.mlir

# Run single pass for debugging
mlir-opt --pass-name input.mlir

# Statistics
iree-compile --mlir-pass-statistics input.mlir
```

### Verbose Output

```bash
# Enable timing
iree-compile --mlir-timing input.mlir

# Enable LLVM debug output (if built with assertions)
iree-compile --debug input.mlir

# Enable specific debug types
iree-compile --debug-only=<type> input.mlir
```

## IREE-Specific Debugging

### Compiler Debugging

```bash
# Dump intermediate artifacts to a directory
iree-compile --iree-hal-dump-executable-intermediates-to=/path/to/dump input.mlir

# Dump executable sources (pre-compilation)
iree-compile --iree-hal-dump-executable-sources-to=/path/to/dump input.mlir

# Dump executable configurations
iree-compile --iree-hal-dump-executable-configurations-to=/path/to/dump input.mlir

# Dump executable benchmarks (NOTE: does not work with dynamic shapes or push constants)
iree-compile --iree-hal-dump-executable-benchmarks-to=/path/to/dump input.mlir

# Dump all executable files (sources, intermediates, configurations, benchmarks)
iree-compile --iree-hal-dump-executable-files=/path/to/dump input.mlir

# Trace compilation
iree-compile --iree-llvm-debug-symbols=true input.mlir
```

### Runtime Debugging

```bash
# Enable tracing
IREE_TRACING_MODE=tracy ./your_program

# Verbose HAL execution
IREE_HAL_EXECUTABLE_PLUGIN_DEBUG=1 ./your_program
```

## GDB/LLDB Tips

### Breaking on Verification Failures

```gdb
break mlir::Op::verifyInvariants
```

### Print MLIR Values

```gdb
# Print an Operation
p op->dump()

# Print a Value
p value.dump()

# Print a Type
p type.dump()
```

### Useful Breakpoints

```gdb
# Break on pass failure
break mlir::PassManager::runPasses

# Break on diagnostic emission
break mlir::detail::DiagnosticEngineImpl::emit
```

## lit Test Debugging

### Running Individual Tests

```bash
# Run single test with verbose output
lit -v path/to/test.mlir

# Run with debug output
lit -v -a path/to/test.mlir

# Show all test output
lit --show-all path/to/test.mlir
```

### FileCheck Debugging

```bash
# See what FileCheck is matching
FileCheck --dump-input=always input.txt

# Verbose matching
FileCheck -v input.txt
```

## Common Issues

### Pass Ordering Problems
**Symptom:** Pass fails because expected ops aren't present
**Debug:** Use `--mlir-print-ir-before=<pass>` to see input state

### Type Mismatches
**Symptom:** Verification failure about types
**Debug:** Check op definitions in TableGen, verify type inference

### Memory Issues
**Symptom:** Crash or corruption
**Debug:** Build with sanitizers: `-DLLVM_USE_SANITIZER="Address;Undefined"`

## Notes

<!-- Add your debugging discoveries here -->
