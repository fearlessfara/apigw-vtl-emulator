# WASM vs Java Equivalence Testing

## Overview

This guide explains how to verify that the WASM-compiled VTL processor produces **exactly the same results** as the pure Java implementation. Equivalence testing is critical to ensure the WASM build can be safely deployed as a drop-in replacement.

## Why Equivalence Testing?

When compiling Java to WebAssembly with GraalVM, several transformations occur:
- Native compilation with ahead-of-time (AOT) optimization
- Different runtime environment (JavaScript/WASM vs JVM)
- Potential differences in reflection, serialization, or library behavior
- Memory management differences

Equivalence testing ensures that despite these differences, the **outputs are identical** for all test cases.

## Test Strategy

### 1. Comprehensive Test Cases

We use the existing VTL test suite located in `src/test/resources/vtl-test-cases/`, which includes:

- **all-params**: Testing all parameter types (path, query, header)
- **array-operations**: Array manipulation and iteration
- **authorizer-context**: API Gateway authorizer context variables
- **complex-foreach**: Nested loops and complex iterations
- **conditional-logic**: If/else statements
- **context-variables**: Context variable access
- **empty-null-handling**: Edge cases with null/empty values
- **jsonpath**: JSONPath expressions
- **nested-conditionals**: Deeply nested conditional logic
- **util-functions**: Utility function testing

...and many more (20+ test cases total)

### 2. Test Execution Flow

```
┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │
│  Test Case      │         │  Test Case      │
│  (template.vtl, │         │  (template.vtl, │
│   context.json, │         │   context.json, │
│   input.json)   │         │   input.json)   │
│                 │         │                 │
└────────┬────────┘         └────────┬────────┘
         │                           │
         v                           v
┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │
│  Java JAR       │         │  WASM Binary    │
│  Implementation │         │  Implementation │
│                 │         │                 │
└────────┬────────┘         └────────┬────────┘
         │                           │
         v                           v
    ┌─────────┐              ┌─────────┐
    │ Output  │              │ Output  │
    │ (JSON)  │              │ (JSON)  │
    └────┬────┘              └────┬────┘
         │                         │
         └────────┬────────────────┘
                  │
                  v
         ┌─────────────────┐
         │                 │
         │  Compare        │
         │  (must match    │
         │   exactly)      │
         │                 │
         └────────┬────────┘
                  │
                  v
            Pass/Fail
```

### 3. Comparison Method

Outputs are compared after normalization:
- JSON outputs are parsed and re-serialized for consistent formatting
- Whitespace is normalized
- Byte-by-byte comparison
- Any difference is reported as a failure

## Testing Tools

### Option 1: Shell Script (Recommended for CI/CD)

**File:** `test-wasm-equivalence.sh`

**Features:**
- Fast, lightweight
- No additional dependencies beyond Java
- Generates output files for manual inspection
- Suitable for CI/CD pipelines

**Usage:**

```bash
# Build and test everything
./test-wasm-equivalence.sh --build-all

# Test with existing builds
./test-wasm-equivalence.sh

# Test specific test case
./test-wasm-equivalence.sh --test all-params

# Verbose output with diffs
./test-wasm-equivalence.sh --verbose

# Just build Java and test
./test-wasm-equivalence.sh --build-java
```

**Output:**

```
========================================================================
  WASM vs Java Equivalence Test Suite
========================================================================

Building Java JAR...
✓ Java JAR built

Building WASM...
✓ WASM built

Checking prerequisites...
✓ Java JAR found
✓ WASM found
  Size: 14.2M

Loading test cases...
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

### Option 2: Node.js Script (Comprehensive)

**File:** `test-wasm-equivalence.js`

**Features:**
- Full WASM module loading and inspection
- Detailed comparison with line-by-line diffs
- Color-coded output
- Verbose mode for debugging
- Better for development and debugging

**Usage:**

```bash
# Run all tests
node test-wasm-equivalence.js

# Custom paths
node test-wasm-equivalence.js \
  --jar target/vtl-processor.jar \
  --wasm target/graalvm-wasm/vtl-processor.wasm

# Test specific case
node test-wasm-equivalence.js --test all-params

# Verbose mode
node test-wasm-equivalence.js --verbose
```

## Running Tests

### Prerequisites

1. **Build Java JAR:**
   ```bash
   mvn clean package
   ```

2. **Build WASM:**
   ```bash
   mvn clean package -Pnative-wasm
   ```

### Quick Test

```bash
# Test everything (recommended)
./test-wasm-equivalence.sh --build-all --verbose
```

### CI/CD Integration

#### GitHub Actions

```yaml
name: WASM Equivalence Tests

on: [push, pull_request]

jobs:
  equivalence:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup GraalVM
        uses: graalvm/setup-graalvm@v1
        with:
          version: '21.0.0'
          java-version: '21'
          components: 'native-image'

      - name: Build JAR
        run: mvn clean package -DskipTests

      - name: Build WASM
        run: mvn package -Pnative-wasm -DskipTests

      - name: Run Equivalence Tests
        run: ./emulator/test-wasm-equivalence.sh --verbose

      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: equivalence-test-results
          path: emulator/target/equivalence-test-results/
```

#### GitLab CI

```yaml
equivalence-test:
  image: ghcr.io/graalvm/graalvm-ce:java21
  script:
    - mvn clean package -DskipTests
    - mvn package -Pnative-wasm -DskipTests
    - ./emulator/test-wasm-equivalence.sh --verbose
  artifacts:
    when: always
    paths:
      - emulator/target/equivalence-test-results/
```

## Interpreting Results

### All Tests Pass ✅

```
  ✓ Passed:     20
  ✗ Failed:     0

✅ All equivalence tests PASSED
```

**Meaning:** WASM implementation is equivalent to Java. Safe to deploy.

### Some Tests Fail ❌

```
  ✓ Passed:     18
  ✗ Failed:     2

❌ Equivalence tests FAILED

Failure Details:
❌ nested-conditionals
  Differences:
    Line 3:
      Java: "result": "admin"
      WASM: "result": "user"
```

**Action Required:**
1. Review the failing test cases
2. Check the diff output to understand differences
3. Investigate why WASM produces different output
4. Fix the issue (likely reflection config or resource inclusion)
5. Rebuild and retest

### Java Only (WASM Not Built) ⚠️

```
  ⚠ Java Only:  20

⚠ No tests could be compared
```

**Meaning:** WASM hasn't been built yet. Build it with:
```bash
mvn clean package -Pnative-wasm
```

## Troubleshooting

### Issue: "WASM interface binding not implemented"

**Symptom:**
```
WASM:  ⚠ Interface not implemented
```

**Cause:** The WASM module loading and method calling interface depends on how GraalVM exports Java methods to WASM.

**Solution:**
1. Inspect WASM exports: Use the WASM testing tools to see what functions are exported
2. Implement the binding in `test-wasm-equivalence.js`
3. Map the exported WASM functions to the Java API

**Example Investigation:**
```bash
# Check exports
node test-wasm-node.js

# Output will show:
# Available WASM Exports:
#   - main (function)
#   - memory (memory)
#   - ...
```

### Issue: All Tests Fail

**Possible Causes:**
1. **WASM build failed** - Check build logs
2. **Missing reflection config** - Add classes to `reflect-config.json`
3. **Missing resources** - Check `resource-config.json`
4. **Java version mismatch** - Ensure same Java version for both builds

**Debug Steps:**
```bash
# 1. Test Java implementation alone
./test-wasm-equivalence.sh --build-java --verbose

# 2. Check if Java tests pass
# If Java tests fail, fix Java implementation first

# 3. Then test WASM
mvn clean package -Pnative-wasm
./test-wasm-equivalence.sh --verbose
```

### Issue: Specific Tests Fail

**Investigation:**
```bash
# Run specific test with verbose output
./test-wasm-equivalence.sh --test failing-test-name --verbose

# Check output files
ls -la target/equivalence-test-results/
cat target/equivalence-test-results/failing-test-name.java.out
cat target/equivalence-test-results/failing-test-name.wasm.out

# Compare side by side
diff -u \
  target/equivalence-test-results/failing-test-name.java.out \
  target/equivalence-test-results/failing-test-name.wasm.out
```

### Issue: "Template not found" or "Resource not found"

**Cause:** Resources (Velocity templates, properties) not included in WASM build

**Solution:** Update `resource-config.json`:

```json
{
  "resources": {
    "includes": [
      {"pattern": "org/apache/velocity/.*\\.properties"},
      {"pattern": ".*\\.vtl"},
      {"pattern": ".*\\.properties"}
    ]
  }
}
```

Rebuild:
```bash
mvn clean package -Pnative-wasm
```

## Expected Performance

### Java Implementation
- **Cold start:** ~500ms
- **Per request:** <5ms
- **Memory:** ~50MB

### WASM Implementation
- **Load time:** 1-3s (first time)
- **Compilation:** <5s
- **Per request:** <10ms (similar to Java)
- **Memory:** Depends on WASM runtime

**Note:** WASM should have comparable throughput once loaded. If significantly slower, investigate optimizations.

## Best Practices

1. **Run equivalence tests before every release**
2. **Add new test cases when fixing bugs** - Ensure the fix works in both Java and WASM
3. **Test with representative data** - Use production-like templates and context
4. **Automate in CI/CD** - Make equivalence tests a required check
5. **Keep test cases updated** - When adding features, add corresponding tests

## Advanced: Custom Test Cases

### Adding a New Test Case

1. Create directory:
   ```bash
   mkdir src/test/resources/vtl-test-cases/my-new-test
   ```

2. Add files:
   ```bash
   # Template
   cat > src/test/resources/vtl-test-cases/my-new-test/template.vtl << 'EOF'
   {
     "message": "$context.message",
     "timestamp": $context.timestamp
   }
   EOF

   # Context
   cat > src/test/resources/vtl-test-cases/my-new-test/context.json << 'EOF'
   {
     "message": "Hello",
     "timestamp": 1234567890
   }
   EOF

   # Input
   cat > src/test/resources/vtl-test-cases/my-new-test/input.json << 'EOF'
   {}
   EOF
   ```

3. Run tests:
   ```bash
   ./test-wasm-equivalence.sh --test my-new-test --verbose
   ```

## Summary

Equivalence testing ensures the WASM build is a faithful reproduction of the Java implementation. By running comprehensive tests across all VTL features, you can confidently deploy the WASM version knowing it will produce identical results to the Java version.

**Key Takeaways:**
- ✅ Run tests before every release
- ✅ All tests must pass (0 failures)
- ✅ Investigate and fix any differences
- ✅ Automate in CI/CD pipeline
- ✅ Add tests for new features
