# GraalVM WebAssembly Build - Complete Guide

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Building](#building)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)

## Overview

This directory contains everything needed to:
1. ✅ Build the VTL processor as WebAssembly using GraalVM
2. ✅ Test the WASM in Node.js and browsers
3. ✅ Verify equivalence with the Java implementation
4. ✅ Deploy the WASM to production

**Target:** WASM binary ≤15 MB (optimized for web delivery)

## Quick Start

```bash
# 1. Build the WASM
mvn clean package -Pnative-wasm

# 2. Test in Node.js
node test-wasm-node.js

# 3. Verify equivalence with Java
./test-wasm-equivalence.sh --build-all

# 4. Test in browser
python3 -m http.server 8000
# Open: http://localhost:8000/test-wasm-browser.html
```

## Prerequisites

### Required

- **GraalVM JDK 21+** with WASM support
  ```bash
  # Using SDKMAN
  sdk install java 21.0.9-graal
  sdk use java 21.0.9-graal

  # Verify
  native-image --version
  ```

- **Maven 3.6+**
  ```bash
  mvn --version
  ```

### Optional (for testing)

- **Node.js 18+** (for Node.js tests)
- **Python 3** (for browser test HTTP server)
- **Binaryen** (for post-build optimization)
  ```bash
  # macOS
  brew install binaryen

  # Linux
  # Download from: https://github.com/WebAssembly/binaryen/releases
  ```

## Building

### Build WASM Only

```bash
mvn clean package -Pnative-wasm
```

Output: `target/graalvm-wasm/vtl-processor.wasm`

Build time: 5-15 minutes (first build)

### Build JAR and WASM

```bash
mvn clean package        # Build JAR
mvn package -Pnative-wasm  # Build WASM
```

### Verify Build

```bash
# Check file exists and size
ls -lh target/graalvm-wasm/vtl-processor.wasm

# Should be ~15 MB or less
```

## Testing

### 1. Node.js Testing

Test the WASM module in Node.js environment:

```bash
node test-wasm-node.js
```

**What it tests:**
- ✅ WASM loads and compiles
- ✅ File size is ≤15 MB
- ✅ Exports are available
- ✅ VTL template processing works

**Example output:**
```
======================================================================
  GraalVM WASM VTL Processor - Node.js Test Suite
======================================================================

Loading WASM from: target/graalvm-wasm/vtl-processor.wasm
WASM File Size: 14.32 MB
✓ File size is within target (≤15 MB)

Available WASM Exports:
  - process (function)
  - main (function)
  - memory (memory)

Running Test Cases
----------------------------------------------------------------------
✓ Simple Variable Substitution
✓ JSON Input Processing
✓ Context Variables
✓ Foreach Loop
✓ Conditional Logic
✓ Util Functions

Test Summary
----------------------------------------------------------------------
  Total Tests: 6
  Passed: 6
  Failed: 0
```

### 2. Browser Testing

Test the WASM in an actual browser:

```bash
# Start HTTP server (required for WASM)
python3 -m http.server 8000

# Open in browser
# http://localhost:8000/test-wasm-browser.html
```

**Features:**
- Drag-and-drop WASM file loading
- Real-time file size validation
- Module information display
- Interactive test form
- Pre-defined test suite
- Beautiful UI

### 3. Equivalence Testing

Verify WASM produces identical results to Java:

```bash
# Build and test everything
./test-wasm-equivalence.sh --build-all --verbose

# Or use Node.js version
node test-wasm-equivalence.js --verbose
```

**What it tests:**
- ✅ All 20+ VTL test cases
- ✅ Byte-by-byte output comparison
- ✅ Java vs WASM equivalence
- ✅ Comprehensive feature coverage

**Example output:**
```
========================================================================
  WASM vs Java Equivalence Test Suite
========================================================================

✓ Java JAR found
✓ WASM found
  Size: 14.2M

✓ Found 20 test cases

========================================================================
  Running Tests
========================================================================

[all-params]
  Java:  ✓
  WASM:  ✓
  ✓ Outputs match

[array-operations]
  Java:  ✓
  WASM:  ✓
  ✓ Outputs match

...

========================================================================
  Test Summary
========================================================================

  Total Tests:  20
  ✓ Passed:     20
  ✗ Failed:     0

✅ All equivalence tests PASSED
```

## Deployment

### Web Server Deployment

```bash
# Copy WASM file to web server
cp target/graalvm-wasm/vtl-processor.wasm /var/www/html/

# Configure MIME type (Nginx)
# Add to nginx.conf:
types {
    application/wasm wasm;
}

# Enable compression (recommended)
gzip on;
gzip_types application/wasm;
```

### CDN Deployment

```bash
# Upload to S3/CDN with correct MIME type
aws s3 cp target/graalvm-wasm/vtl-processor.wasm \
  s3://your-bucket/vtl-processor.wasm \
  --content-type application/wasm \
  --metadata-directive REPLACE

# Enable CloudFront compression
```

### Client-Side Usage

```javascript
// Load WASM
const response = await fetch('vtl-processor.wasm');
const wasmBuffer = await response.arrayBuffer();
const wasmModule = await WebAssembly.compile(wasmBuffer);

// Instantiate with imports
const imports = {
    env: {},
    wasi_snapshot_preview1: {
        proc_exit: () => {},
        fd_write: () => 0,
    }
};

const instance = await WebAssembly.instantiate(wasmModule, imports);

// Use the processor
// const result = instance.exports.process(template, input, context);
```

## Project Structure

```
emulator/
├── pom.xml                      # Maven build configuration
├── src/
│   └── main/java/               # Java source code
├── target/
│   ├── vtl-processor.jar        # Java JAR (built)
│   └── graalvm-wasm/
│       └── vtl-processor.wasm   # WASM binary (built)
│
├── test-wasm-node.js           # Node.js test suite
├── test-wasm-browser.html      # Browser test page
├── test-wasm-equivalence.js    # Node.js equivalence tests
├── test-wasm-equivalence.sh    # Shell equivalence tests
│
└── Documentation:
    ├── README_WASM.md          # This file (complete guide)
    ├── GRAALVM_WASM.md         # Build and optimization guide
    ├── WASM_TESTING.md         # Testing guide
    └── EQUIVALENCE_TESTING.md  # Equivalence testing guide
```

## Troubleshooting

### Build Issues

**Problem:** `--tool:svm-wasm not found`
```
Solution: Ensure you're using GraalVM (not standard OpenJDK)
- Download from: https://www.graalvm.org/downloads/
- Try newer GraalVM version (21.0.9+)
```

**Problem:** Maven dependency errors
```
Solution:
- Check internet connection
- Try: mvn clean package (build JAR first)
- Then: mvn package -Pnative-wasm
```

**Problem:** Build fails with reflection errors
```
Solution: Update reflect-config.json
- See: GRAALVM_WASM.md#reflection-configuration
```

### Size Issues

**Problem:** WASM > 15 MB
```
Solution: Optimize resources
- Review resource-config.json
- Remove unused dependencies
- See: GRAALVM_WASM.md#size-optimization
```

### Runtime Issues

**Problem:** "Class not found" errors
```
Solution: Add to reflect-config.json
- Run with tracing agent to generate config
- See: GRAALVM_WASM.md#reflection-configuration
```

**Problem:** WASM loads but exports are empty
```
Solution:
- Check VTLProcessor has main() method
- Verify GraalVM exported methods correctly
- Check build logs for warnings
```

### Testing Issues

**Problem:** Browser can't load WASM from file://
```
Solution: Must use HTTP server
python3 -m http.server 8000
```

**Problem:** Equivalence tests fail
```
Solution:
1. Test Java alone: ./test-wasm-equivalence.sh --build-java
2. If Java fails, fix Java first
3. Check build logs
4. See: EQUIVALENCE_TESTING.md#troubleshooting
```

## Documentation

Detailed guides for specific topics:

### [GRAALVM_WASM.md](GRAALVM_WASM.md)
- Prerequisites and installation
- Build configuration
- Size optimization strategies
- Reflection and resource configuration
- Advanced troubleshooting

### [WASM_TESTING.md](WASM_TESTING.md)
- Node.js testing guide
- Browser testing guide
- Test case descriptions
- CI/CD integration examples
- Performance expectations

### [EQUIVALENCE_TESTING.md](EQUIVALENCE_TESTING.md)
- Equivalence testing strategy
- Running equivalence tests
- Interpreting results
- CI/CD integration
- Adding custom test cases

## CI/CD Integration

### GitHub Actions

```yaml
name: WASM Build and Test

on: [push, pull_request]

jobs:
  wasm:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup GraalVM
        uses: graalvm/setup-graalvm@v1
        with:
          version: '21.0.9'
          java-version: '21'
          components: 'native-image'

      - name: Build WASM
        run: |
          cd emulator
          mvn clean package -Pnative-wasm -DskipTests

      - name: Verify Size
        run: |
          SIZE=$(stat -c%s emulator/target/graalvm-wasm/vtl-processor.wasm)
          MAX_SIZE=$((15 * 1024 * 1024))
          if [ $SIZE -gt $MAX_SIZE ]; then
            echo "WASM too large: $SIZE bytes"
            exit 1
          fi

      - name: Test Node.js
        run: |
          cd emulator
          node test-wasm-node.js

      - name: Equivalence Tests
        run: |
          cd emulator
          ./test-wasm-equivalence.sh --build-all --verbose

      - name: Upload WASM
        uses: actions/upload-artifact@v3
        with:
          name: vtl-processor-wasm
          path: emulator/target/graalvm-wasm/vtl-processor.wasm
```

### Success Criteria

For a successful build:
- ✅ WASM file builds without errors
- ✅ File size ≤15 MB
- ✅ All Node.js tests pass
- ✅ All equivalence tests pass (Java vs WASM outputs match)
- ✅ Browser tests work (manual verification)

## Performance

### Expected Metrics

| Metric | Java | WASM | Notes |
|--------|------|------|-------|
| Binary Size | ~3.5 MB (JAR) | ~15 MB | WASM includes full runtime |
| Cold Start | ~500ms | 1-3s | WASM compilation overhead |
| Warm Performance | <5ms | <10ms | Per template processing |
| Memory Usage | ~50 MB | Varies | Depends on runtime |

### Optimization Tips

1. **Enable compression** - WASM compresses well (gzip reduces by ~60%)
2. **Cache WASM module** - Compile once, reuse many times
3. **Use streaming compilation** - `WebAssembly.instantiateStreaming()`
4. **Lazy loading** - Load WASM only when needed

## Support and Resources

- [GraalVM Documentation](https://www.graalvm.org/)
- [WebAssembly.org](https://webassembly.org/)
- [MDN WebAssembly Guide](https://developer.mozilla.org/en-US/docs/WebAssembly)

## License

[Your license here]

## Contributing

When contributing WASM-related changes:
1. Ensure all tests pass (`./test-wasm-equivalence.sh --build-all`)
2. Keep WASM size ≤15 MB
3. Update documentation if needed
4. Add test cases for new features

---

**Ready to build?**

```bash
mvn clean package -Pnative-wasm
node test-wasm-node.js
./test-wasm-equivalence.sh --build-all
```

**Questions?** See the detailed guides in the documentation section above.
