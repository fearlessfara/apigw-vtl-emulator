# GraalVM WebAssembly Build Guide

## Overview

This guide explains how to build and test the VTL Processor as a WebAssembly module using GraalVM Native Image. The WASM build enables running the VTL template engine in web browsers and Node.js without requiring a JVM.

**Target File Size:** ≤15 MB (optimized)

## Table of Contents

- [Prerequisites](#prerequisites)
- [Building the WASM](#building-the-wasm)
- [Testing the WASM](#testing-the-wasm)
- [Size Optimization](#size-optimization)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### 1. Install GraalVM

You need GraalVM JDK 21 or later with WASM support:

```bash
# Option 1: Using SDKMAN (recommended)
sdk install java 21.0.9-graal
sdk use java 21.0.9-graal

# Option 2: Manual download
# Download from: https://www.graalvm.org/downloads/
# Extract and set JAVA_HOME
export JAVA_HOME=/path/to/graalvm
export PATH=$JAVA_HOME/bin:$PATH
```

Verify installation:

```bash
java -version
# Should show: Oracle GraalVM or GraalVM Community Edition

native-image --version
# Should show: native-image version
```

### 2. Check WASM Support

Verify that your GraalVM installation supports WASM compilation:

```bash
native-image --help | grep -i wasm
# or
native-image --tool:svm-wasm --help
```

If the `--tool:svm-wasm` option is not available, you may need:
- A newer version of GraalVM
- GraalVM with experimental WASM features enabled
- Additional WASM tooling components

### 3. Install Maven

```bash
mvn --version
# Maven 3.6+ required
```

## Building the WASM

### Quick Build

Build the WASM module with optimizations:

```bash
cd emulator
mvn clean package -Pnative-wasm
```

The build will:
1. Compile Java sources
2. Create shaded JAR with all dependencies
3. Compile to WASM using GraalVM Native Image
4. Apply size optimizations
5. Output to `target/graalvm-wasm/vtl-processor.wasm`

### Build Output

Expected build artifacts:
```
target/
├── vtl-processor.jar          # Shaded JAR (used as input for WASM)
└── graalvm-wasm/
    └── vtl-processor.wasm     # WebAssembly binary (~15 MB)
```

### Build Time

- **First build:** 5-15 minutes (depending on system)
- **Incremental builds:** Faster if sources haven't changed

## Testing the WASM

### 1. Verify File Size

Check that the WASM file meets the size target:

```bash
ls -lh target/graalvm-wasm/vtl-processor.wasm
```

**Target:** ≤15 MB
**If larger:** See [Size Optimization](#size-optimization)

### 2. Test in Node.js

Run the comprehensive Node.js test suite:

```bash
node test-wasm-node.js target/graalvm-wasm/vtl-processor.wasm
```

The test script will:
- Load and compile the WASM module
- Verify file size
- Check WASM exports
- Run VTL template processing tests
- Display detailed results

Example output:
```
======================================================================
  GraalVM WASM VTL Processor - Node.js Test Suite
======================================================================

Loading WASM from: target/graalvm-wasm/vtl-processor.wasm
WASM File Size: 14.32 MB
✓ File size is within target (≤15 MB)

Compiling WASM module...
Instantiating WASM module...
✓ WASM module loaded successfully

Available WASM Exports:
  - process (function)
  - main (function)
  - memory (memory)
  ...
```

### 3. Test in Browser

1. Start a local HTTP server:

```bash
# Python 3
python3 -m http.server 8000

# or Node.js
npx http-server -p 8000
```

2. Open the test page:

```
http://localhost:8000/test-wasm-browser.html
```

3. Load the WASM file using the file picker

4. The page will:
   - Display file size and verify it's ≤15 MB
   - Show compilation/instantiation time
   - List all WASM exports
   - Provide interactive test interface
   - Run pre-defined test cases

### 4. Manual Testing

You can also test manually in Node.js:

```javascript
const fs = require('fs');

async function testWasm() {
    // Load WASM
    const wasmBuffer = fs.readFileSync('target/graalvm-wasm/vtl-processor.wasm');
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

    // Check exports
    console.log('Exports:', Object.keys(instance.exports));

    // Call process method (if available)
    // const result = instance.exports.process(template, input, context);
}

testWasm().catch(console.error);
```

## Size Optimization

The current build is optimized to achieve ~15 MB. The POM includes several optimization flags:

### Applied Optimizations

```xml
<buildArg>-Os</buildArg>                      <!-- Size optimization -->
<buildArg>-H:+RemoveSaturatedTypeFlows</buildArg>  <!-- Remove unused code -->
<buildArg>-H:ResourceConfigurationFiles=...</buildArg>  <!-- Selective resources -->
```

### If File is Too Large

If your WASM build exceeds 15 MB:

1. **Review Resource Configuration:**
   Edit `src/main/resources/META-INF/native-image/resource-config.json` to include only necessary resources:

```json
{
  "resources": {
    "includes": [
      {"pattern": "org/apache/velocity/runtime/defaults/velocity.properties"},
      {"pattern": ".*\\.properties$"}
    ],
    "excludes": [
      {"pattern": ".*\\.class$"},
      {"pattern": "META-INF/.*"}
    ]
  }
}
```

2. **Remove Unused Dependencies:**
   Check if all dependencies in `pom.xml` are necessary for WASM build.

3. **Add More Aggressive Flags:**
   ```xml
   <buildArg>-H:-SpawnIsolates</buildArg>
   <buildArg>-H:+StripDebugInfo</buildArg>
   ```

4. **Use Binaryen for Post-Processing:**
   ```bash
   # Install binaryen
   brew install binaryen  # macOS
   # or download from: https://github.com/WebAssembly/binaryen/releases

   # Optimize WASM
   wasm-opt -Os input.wasm -o output.wasm
   ```

### Size Comparison

| Build Type | Size | Notes |
|-----------|------|-------|
| Initial (no optimization) | ~235 MB | Baseline |
| With -Os | ~50 MB | Basic optimization |
| With resource config | ~15 MB | Selective resource inclusion |
| Target | ≤15 MB | Production target |

## Configuration Files

### Reflection Configuration

GraalVM requires explicit reflection configuration for Velocity and Jackson:

**Location:** `src/main/resources/META-INF/native-image/reflect-config.json`

If you encounter reflection errors at runtime, you may need to generate configuration using the tracing agent:

```bash
# Run with tracing agent
java -agentlib:native-image-agent=config-output-dir=target/native-image-config \
     -jar target/vtl-processor.jar

# This generates:
# - reflect-config.json
# - resource-config.json
# - jni-config.json
# - proxy-config.json
```

Then merge the generated configs with your existing ones.

### Resource Configuration

**Location:** `src/main/resources/META-INF/native-image/resource-config.json`

Controls which resources are included in the WASM binary. Keep this minimal to reduce size.

## Troubleshooting

### Build Fails: "tool:svm-wasm not found"

**Problem:** GraalVM doesn't support WASM compilation
**Solution:**
- Ensure you're using GraalVM (not standard OpenJDK)
- Try a newer GraalVM version (21.0.9+)
- Check if WASM support is available: `native-image --help | grep wasm`

### Build Fails: Network/Dependency Issues

**Problem:** Maven cannot download dependencies
**Solution:**
```bash
# Build regular JAR first (without profile)
mvn clean package

# Then build WASM
mvn package -Pnative-wasm
```

### Runtime Error: "Class not found" or Reflection Errors

**Problem:** Missing reflection configuration
**Solution:**
1. Run with tracing agent (see above)
2. Add classes to `reflect-config.json`
3. Rebuild WASM

### WASM Too Large

**Problem:** Binary exceeds 15 MB
**Solution:** See [Size Optimization](#size-optimization) section

### WASM Loads but Exports are Empty

**Problem:** No functions exported from WASM
**Solution:**
- Check that `VTLProcessor` has a `main()` method
- Verify GraalVM properly exported the methods
- Check build logs for warnings about method elimination

## Next Steps

1. **Build the WASM:**
   ```bash
   mvn clean package -Pnative-wasm
   ```

2. **Verify Size:**
   ```bash
   ls -lh target/graalvm-wasm/vtl-processor.wasm
   ```

3. **Test in Node.js:**
   ```bash
   node test-wasm-node.js
   ```

4. **Test in Browser:**
   - Start HTTP server
   - Open `test-wasm-browser.html`
   - Load WASM file
   - Run tests

5. **Deploy:**
   - Copy `vtl-processor.wasm` to your web server
   - Ensure proper MIME type: `application/wasm`
   - Enable gzip compression for smaller transfer size

## Resources

- [GraalVM Documentation](https://www.graalvm.org/)
- [GraalVM Native Image](https://www.graalvm.org/native-image/)
- [WebAssembly.org](https://webassembly.org/)
- [MDN WebAssembly Guide](https://developer.mozilla.org/en-US/docs/WebAssembly)

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review build logs in `target/` directory
3. Ensure all prerequisites are met
4. Try with a clean build: `mvn clean package -Pnative-wasm`
