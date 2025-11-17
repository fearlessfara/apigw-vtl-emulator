# VTL Processor WASM File

## ⚠️ IMPORTANT: This is a Demonstration File

The `vtl-processor.wasm` file in this directory is a **minimal demonstration WASM** created to show that the UI integration works correctly.

### What This Demo WASM Does

✅ **Demonstrates UI Integration:**
- Shows that WASM files can be loaded
- Proves lazy loading works correctly
- Validates export detection
- Confirms the infrastructure is ready

❌ **Does NOT Process VTL Templates:**
- This is NOT the GraalVM-compiled WASM
- It's a minimal 40-byte WASM module
- Only exports a `process` function that returns 0
- Cannot actually process Velocity templates

### Why a Demo File?

The build environment has constraints that prevent building the full WASM:
- ❌ No network access for Maven dependencies
- ❌ GraalVM WASM tool not available in current installation
- ✅ Can create demo to show UI works
- ✅ All infrastructure ready for real WASM

### How to Build the Real WASM

To get the full GraalVM-compiled WASM that actually processes VTL templates:

#### Option 1: Local Build

```bash
# Prerequisites:
# - GraalVM JDK 21+ with WASM support
# - Maven 3.6+
# - Internet connectivity

cd emulator
mvn clean package -Pnative-wasm

# Copy to frontend
cp target/graalvm-wasm/vtl-processor.wasm ../frontend/public/
```

#### Option 2: GitHub Actions (Recommended)

Set up CI/CD to build WASM automatically:

```yaml
name: Build WASM

on: [push, pull_request]

jobs:
  build-wasm:
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
          mvn clean package -Pnative-wasm

      - name: Upload WASM Artifact
        uses: actions/upload-artifact@v3
        with:
          name: vtl-processor-wasm
          path: emulator/target/graalvm-wasm/vtl-processor.wasm
```

Then download the artifact and place it here.

#### Option 3: Docker Build

```bash
# Use Docker with GraalVM
docker run -v $(pwd):/work \
  ghcr.io/graalvm/native-image-community:21 \
  bash -c "cd /work/emulator && mvn clean package -Pnative-wasm"

# Copy result
cp emulator/target/graalvm-wasm/vtl-processor.wasm frontend/public/
```

### Expected Real WASM

When properly built with GraalVM, the WASM file should be:

- **Size:** ~14-15 MB (optimized)
- **Exports:** `process`, `main`, `memory`, and others
- **Functionality:** Full VTL template processing
- **Performance:** Native speed (~2ms per template)

### Testing the UI Integration

Even with this demo WASM, you can test the UI:

1. **Start the frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. **Open in browser:**
   ```
   http://localhost:5173
   ```

3. **Select WASM engine:**
   - Click the engine dropdown
   - Select "WebAssembly (GraalVM)"
   - Watch it load (should be instant for 40-byte demo)

4. **Verify in console:**
   ```
   Initializing WebAssembly VTL Processor...
   Fetching WASM from /vtl-processor.wasm...
   WASM file loaded: 0.00 MB
   Compiling WASM module...
   Instantiating WASM module...
   WASM module initialized successfully
   Available exports: ["process"]
   ```

5. **Try rendering:**
   - The UI will show exports were found
   - Template processing will show an error (expected)
   - This confirms the integration works!

### What the UI Shows

With the demo WASM, when you select the WASM engine and click Render:

```json
{
  "message": "WASM module loaded successfully!",
  "note": "The WASM-Java bridge interface needs to be implemented...",
  "exports": ["process"],
  "template": "$input.json(\"$\")...",
  "status": "WASM engine operational, awaiting interface implementation"
}
```

This confirms:
- ✅ WASM loaded correctly
- ✅ Lazy loading worked
- ✅ Exports detected
- ✅ Infrastructure ready
- ⏳ Waiting for real WASM binary

### File Structure

```
frontend/public/
├── vtl-processor.wasm    ← Current: 40-byte demo
│                         ← Replace with: 15 MB GraalVM WASM
├── vtl-processor.jar     ← CheerpJ engine (3.3 MB)
├── favicon.ico
├── robots.txt
└── sitemap.xml
```

### Deployment

When you have the real WASM:

1. **Replace the file:**
   ```bash
   cp path/to/real/vtl-processor.wasm frontend/public/
   ```

2. **Verify size:**
   ```bash
   ls -lh frontend/public/vtl-processor.wasm
   # Should show ~15 MB
   ```

3. **Build and deploy:**
   ```bash
   cd frontend
   npm run build
   # Deploy dist/ directory
   ```

4. **Configure server:**
   - Set Content-Type: `application/wasm`
   - Enable gzip compression
   - Configure CORS if needed

### Resources

- **Build Guide:** `../emulator/README_WASM.md`
- **Testing Guide:** `../emulator/WASM_TESTING.md`
- **Equivalence Tests:** `../emulator/EQUIVALENCE_TESTING.md`
- **UI Integration:** `./WASM_UI_INTEGRATION.md`

### Summary

| Aspect | Demo WASM (Current) | Real WASM (Needed) |
|--------|--------------------|--------------------|
| Size | 40 bytes | ~15 MB |
| Exports | `process` | `process`, `main`, `memory`, etc. |
| Functionality | None | Full VTL processing |
| Purpose | UI testing | Production use |
| Build | Node.js script | GraalVM native-image |

---

**Ready to build the real WASM?** Follow the instructions above!

**Questions?** Check the documentation in `emulator/README_WASM.md`
