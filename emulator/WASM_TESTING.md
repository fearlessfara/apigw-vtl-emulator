# WASM Testing Guide

## Quick Start

### Build WASM
```bash
mvn clean package -Pnative-wasm
```

### Test in Node.js
```bash
node test-wasm-node.js
```

### Test in Browser
```bash
# Start server
python3 -m http.server 8000

# Open browser
open http://localhost:8000/test-wasm-browser.html
```

## Test Files

### test-wasm-node.js

Comprehensive Node.js test suite that:
- Loads and compiles the WASM module
- Verifies file size (target: ≤15 MB)
- Inspects WASM exports
- Runs VTL template processing tests
- Provides detailed reporting

**Usage:**
```bash
# Test with default path
node test-wasm-node.js

# Test with custom path
node test-wasm-node.js path/to/vtl-processor.wasm
```

**Sample Output:**
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
  Test: Simple Variable Substitution
    Template: Hello, $context.name!
    Context: {"name": "World"}
    ✓ Test passed

Test Summary
----------------------------------------------------------------------
  Total Tests: 6
  Passed: 6
  Failed: 0
```

### test-wasm-browser.html

Interactive browser-based testing tool with:
- Drag-and-drop WASM file loading
- Real-time file size verification
- WASM module information display
- Interactive test form for custom templates
- Pre-defined test suite
- Beautiful, responsive UI

**Features:**
- ✅ File size validation (≤15 MB warning)
- ✅ Load time measurement
- ✅ Export function inspection
- ✅ Interactive VTL template testing
- ✅ Multiple pre-defined test cases
- ✅ Real-time result display

**How to Use:**
1. Start local HTTP server (required for WASM loading)
2. Open `test-wasm-browser.html` in browser
3. Click "Choose File" and select your `.wasm` file
4. View module information and exports
5. Run tests or create custom ones

## Test Cases

Both test tools include these standard test cases:

1. **Simple Variable Substitution**
   - Template: `Hello, $context.name!`
   - Tests basic variable interpolation

2. **JSON Input Processing**
   - Template: `{"message": "$input.json('$.message')"}`
   - Tests input JSON parsing and JSONPath

3. **Context Variables**
   - Template: `{"requestId": "$context.requestId"}`
   - Tests context variable access

4. **Foreach Loop**
   - Template: `#foreach($item in $context.items)$item.name#end`
   - Tests iteration and loops

5. **Conditional Logic**
   - Template: `#if($context.isAdmin)Admin#else User#end`
   - Tests conditional rendering

6. **Util Functions**
   - Template: `#set($data = $util.parseJson('{"key":"value"}'))$data.key`
   - Tests utility functions

## Expected Results

### File Size
- **Target:** ≤15 MB
- **Warning threshold:** >15 MB
- **Typical optimized size:** 14-15 MB

### Performance
- **Compilation time:** <5s (depends on hardware)
- **Instantiation time:** <1s
- **Template processing:** <10ms per template

### Exports
The WASM module should export at least:
- `process` or `main` function
- `memory` (WebAssembly.Memory)
- Additional utility functions

## Troubleshooting

### Test Error: "WASM file not found"
```bash
# Build WASM first
mvn clean package -Pnative-wasm

# Verify file exists
ls -lh target/graalvm-wasm/vtl-processor.wasm
```

### Test Error: "CompileError: WebAssembly module is invalid"
**Possible causes:**
- File is corrupted
- WASM build failed
- Incompatible WASM version

**Solution:**
```bash
# Rebuild from scratch
mvn clean package -Pnative-wasm

# Check build logs for errors
tail -100 target/maven-build.log
```

### Browser Error: "Cannot load WASM from file://"
**Problem:** Browsers block WASM loading from `file://` protocol

**Solution:**
```bash
# Must use HTTP server
python3 -m http.server 8000
# or
npx http-server -p 8000
```

### Test Shows: "No exports found"
**Problem:** WASM compilation didn't export methods

**Solution:**
1. Verify `VTLProcessor` has `public static void main()` method
2. Check GraalVM build logs for warnings
3. Ensure reflection configuration includes VTLProcessor class

### File Size > 15 MB
See [Size Optimization](GRAALVM_WASM.md#size-optimization) in GRAALVM_WASM.md

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Build WASM
  run: mvn clean package -Pnative-wasm

- name: Test WASM
  run: node test-wasm-node.js

- name: Verify Size
  run: |
    SIZE=$(stat -f%z target/graalvm-wasm/vtl-processor.wasm)
    MAX_SIZE=$((15 * 1024 * 1024))  # 15 MB
    if [ $SIZE -gt $MAX_SIZE ]; then
      echo "WASM file too large: $SIZE bytes"
      exit 1
    fi
```

### GitLab CI Example
```yaml
test:wasm:
  script:
    - mvn clean package -Pnative-wasm
    - node test-wasm-node.js
    - |
      SIZE=$(stat -c%s target/graalvm-wasm/vtl-processor.wasm)
      if [ $SIZE -gt 15728640 ]; then
        echo "WASM file exceeds 15 MB"
        exit 1
      fi
```

## Advanced Testing

### Load Testing
```javascript
// test-wasm-load.js
const { loadWasm } = require('./test-wasm-node');

async function loadTest() {
    const wasm = await loadWasm('target/graalvm-wasm/vtl-processor.wasm');

    const iterations = 1000;
    const start = Date.now();

    for (let i = 0; i < iterations; i++) {
        // Call WASM function
        // wasm.exports.process(template, input, context);
    }

    const duration = Date.now() - start;
    console.log(`${iterations} iterations in ${duration}ms`);
    console.log(`Average: ${duration/iterations}ms per call`);
}

loadTest();
```

### Memory Profiling
```javascript
// Check WASM memory usage
const memPages = wasmInstance.exports.memory.buffer.byteLength / 65536;
console.log(`WASM Memory: ${memPages} pages (${memPages * 64}KB)`);
```

## Resources

- [GRAALVM_WASM.md](GRAALVM_WASM.md) - Complete build guide
- [WebAssembly Documentation](https://webassembly.org/)
- [Node.js WebAssembly Guide](https://nodejs.org/api/wasm.html)
- [MDN WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly)
