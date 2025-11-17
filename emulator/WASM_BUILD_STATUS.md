## GraalVM WASM Build Status

### Current Status: WASM Tool Not Available

The GraalVM installation in this environment (Oracle GraalVM 21.0.9+7.1) does not include the WASM compilation tool (`--tool:svm-wasm`).

### Why WASM Tool Is Missing

The `--tool:svm-wasm` feature is:
- Experimental in GraalVM
- Not included in standard Oracle GraalVM distributions
- Available in specific GraalVM builds or community editions
- Requires explicit WASM component installation

### How to Build WASM

**Option 1: GraalVM with WASM Support**

```bash
# Install GraalVM Community Edition or specific WASM-enabled build
sdk install java 23-graalce  # Or latest with WASM support

# Install WASM component (if available separately)
gu install wasm

# Build WASM
mvn clean package -Pnative-wasm
```

**Option 2: Manual native-image with WASM flag**

```bash
# Try with experimental flags
native-image --tool:svm-wasm \
  -jar target/vtl-processor.jar \
  -H:Name=vtl-processor \
  -H:+RemoveSaturatedTypeFlows \
  -Os
```

**Option 3: Use Docker with WASM-enabled GraalVM**

```dockerfile
FROM ghcr.io/graalvm/native-image-community:21-ol9 AS builder
# Install WASM tools
# Build WASM
```

### Alternative: Create Demo WASM

For demonstration purposes, I can create a minimal WASM file that shows the UI integration works. However, this won't process VTL templates - it will just demonstrate the loading mechanism.

### Recommendation

To get a fully functional WASM binary:

1. **Use a system with:**
   - GraalVM with WASM support
   - Internet connectivity for Maven
   - WASM tooling installed

2. **Or use CI/CD:**
   - GitHub Actions with GraalVM WASM setup
   - Build in CI and download artifact

3. **Or use the testing infrastructure:**
   - The test framework in `emulator/test-wasm-*.js` can validate once built
   - UI is ready and will work once WASM is available

### Current Environment Constraints

❌ No network access for Maven dependencies
❌ GraalVM WASM tool not available in current installation
❌ Cannot build full WASM binary

✅ Can create demo WASM to show UI works
✅ All infrastructure ready for real WASM
✅ UI will work immediately when WASM is provided

Would you like me to:
1. Create a demo WASM file for UI testing?
2. Provide detailed build instructions for a proper environment?
3. Create a GitHub Actions workflow to build WASM in CI?
