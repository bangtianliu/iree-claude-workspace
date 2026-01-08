# IREE Build Pipeline

## Overview

This document describes common build configurations and workflows for IREE development.

## Prerequisites

### Required
- CMake 3.21+
- Ninja
- Python 3.9+
- Clang/LLVM (clang, clang++)
- LLD (LLVM linker) - for faster linking with `-DIREE_ENABLE_LLD=ON`

### Recommended
- ccache - for faster incremental builds
- ROCm/HIP SDK - if targeting AMD GPUs

### Install on Ubuntu/Debian
```bash
sudo apt install cmake ninja-build clang lld ccache python3
```

## Quick Start

### Basic IREE Build (RelWithDebInfo + ROCm/HIP)

```bash
# Configure
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
ctest --test-dir iree-build/ --output-on-failure
```

### Build Specific Targets

```bash
# Build the IREE compiler
cmake --build iree-build/ --target iree-compile

# Build the IREE MLIR optimizer
cmake --build iree-build/ --target iree-opt

# Build all test dependencies
cmake --build iree-build/ --target iree-test-deps
```

### Tools Location

After building, the IREE compiler tools (such as `iree-opt`, `iree-compile`) are located in `iree-build/tools/`.

## Common Configurations

### Debug Build

```bash
cmake -G Ninja -B iree-build-debug/ -S . \
  -DCMAKE_BUILD_TYPE=Debug \
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
```

### Release with Debug Info

```bash
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
```

### Build Flags Explanation

| Flag | Purpose |
|------|---------|
| `IREE_ENABLE_LLD` | Use LLD linker for faster link times |
| `IREE_ENABLE_SPLIT_DWARF` | Split debug info for faster linking |
| `IREE_ENABLE_THIN_ARCHIVES` | Use thin archives for faster archiving |
| `CMAKE_*_COMPILER_LAUNCHER=ccache` | Cache compilations for faster rebuilds |
| `IREE_TARGET_BACKEND_ROCM` | Enable ROCm compiler backend |
| `IREE_HAL_DRIVER_HIP` | Enable HIP runtime driver |
| `IREE_ENABLE_ASSERTIONS` | Enable runtime assertions |

### Building with Custom LLVM

```bash
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
  -DIREE_HAL_DRIVER_HIP=ON \
  -DIREE_BUILD_BUNDLED_LLVM=OFF \
  -DLLVM_DIR=/path/to/llvm/build/lib/cmake/llvm \
  -DMLIR_DIR=/path/to/llvm/build/lib/cmake/mlir
```

## Incremental Builds

```bash
# Quick rebuild after changes
cmake --build iree-build/

# Rebuild specific target
cmake --build iree-build/ --target <target>

# Force reconfigure
cmake iree-build/
```

## Troubleshooting

### CMake Cache Issues

```bash
# Clear CMake cache
rm iree-build/CMakeCache.txt
# Or full clean
rm -rf iree-build/CMakeFiles/ iree-build/CMakeCache.txt
```

### Out of Memory During Build

```bash
# Limit parallel jobs
cmake --build iree-build/ -j 4
```

### LLVM Version Mismatches

Ensure your LLVM version matches IREE's requirements. Check `third_party/llvm-project` for the expected version.

## Notes

<!-- Add your build-specific notes and discoveries here -->
