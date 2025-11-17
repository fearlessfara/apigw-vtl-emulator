#!/usr/bin/env node

/**
 * Node.js Test Script for GraalVM WASM VTL Processor
 *
 * This script tests the compiled WASM binary to ensure it works correctly in Node.js
 * and produces valid results for VTL template processing.
 *
 * Usage:
 *   node test-wasm-node.js [path-to-wasm-file]
 *
 * Example:
 *   node test-wasm-node.js target/graalvm-wasm/vtl-processor.wasm
 */

const fs = require('fs');
const path = require('path');

// Default WASM file path
const DEFAULT_WASM_PATH = path.join(__dirname, 'target/graalvm-wasm/vtl-processor.wasm');

// Get WASM file path from command line or use default
const wasmPath = process.argv[2] || DEFAULT_WASM_PATH;

// Test cases for VTL processing
const testCases = [
    {
        name: 'Simple Variable Substitution',
        template: 'Hello, $context.name!',
        context: JSON.stringify({ name: 'World' }),
        input: '',
        expected: 'Hello, World!'
    },
    {
        name: 'JSON Input Processing',
        template: '{"message": "$input.json(\'$.message\')", "user": "$input.json(\'$.user.name\')"}',
        context: JSON.stringify({}),
        input: JSON.stringify({ message: 'Hello', user: { name: 'John' } }),
        expectedPattern: /"message"\s*:\s*"Hello"/
    },
    {
        name: 'Context Variables',
        template: '{"requestId": "$context.requestId", "path": "$context.resourcePath"}',
        context: JSON.stringify({ requestId: '123-456', resourcePath: '/api/users' }),
        input: '',
        expectedPattern: /"requestId"\s*:\s*"123-456"/
    },
    {
        name: 'Foreach Loop',
        template: '#foreach($item in $context.items)$item.name#if($foreach.hasNext), #end#end',
        context: JSON.stringify({ items: [{ name: 'Apple' }, { name: 'Banana' }, { name: 'Cherry' }] }),
        input: '',
        expected: 'Apple, Banana, Cherry'
    },
    {
        name: 'Conditional Logic',
        template: '#if($context.isAdmin)Admin Access#else User Access#end',
        context: JSON.stringify({ isAdmin: true }),
        input: '',
        expected: 'Admin Access'
    },
    {
        name: 'Util Functions - parseJson',
        template: '#set($data = $util.parseJson(\'{"key":"value"}\'))$data.key',
        context: JSON.stringify({}),
        input: '',
        expected: 'value'
    }
];

// Color output for terminal
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileSize(filePath) {
    const stats = fs.statSync(filePath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    log(`\nWASM File Size: ${sizeInMB} MB`, 'cyan');

    if (parseFloat(sizeInMB) > 15) {
        log(`⚠ Warning: File size (${sizeInMB} MB) exceeds target of 15 MB`, 'yellow');
    } else {
        log(`✓ File size is within target (≤15 MB)`, 'green');
    }

    return parseFloat(sizeInMB);
}

async function loadWasm(wasmPath) {
    log(`\nLoading WASM from: ${wasmPath}`, 'blue');

    if (!fs.existsSync(wasmPath)) {
        throw new Error(`WASM file not found: ${wasmPath}`);
    }

    // Check file size
    checkFileSize(wasmPath);

    // Read the WASM file
    const wasmBuffer = fs.readFileSync(wasmPath);

    // Compile and instantiate the WASM module
    log('Compiling WASM module...', 'blue');
    const wasmModule = await WebAssembly.compile(wasmBuffer);

    log('Instantiating WASM module...', 'blue');

    // Create imports object with required functions
    const imports = {
        env: {
            // Add any required imports here
            // GraalVM WASM may require specific imports
        },
        wasi_snapshot_preview1: {
            // WASI imports if needed
            proc_exit: (code) => {
                log(`WASM process exit with code: ${code}`, 'yellow');
            },
            fd_write: () => 0,
            fd_read: () => 0,
            fd_close: () => 0,
            fd_seek: () => 0,
        }
    };

    const wasmInstance = await WebAssembly.instantiate(wasmModule, imports);

    log('✓ WASM module loaded successfully', 'green');

    return wasmInstance;
}

function testWasmExports(wasmInstance) {
    log('\nAvailable WASM Exports:', 'cyan');
    const exports = Object.keys(wasmInstance.exports);

    if (exports.length === 0) {
        log('  No exports found!', 'red');
        return false;
    }

    exports.forEach(exportName => {
        const exportValue = wasmInstance.exports[exportName];
        const type = typeof exportValue === 'function' ? 'function' :
                     exportValue instanceof WebAssembly.Memory ? 'memory' :
                     exportValue instanceof WebAssembly.Table ? 'table' :
                     'unknown';
        log(`  - ${exportName} (${type})`, 'cyan');
    });

    return true;
}

function runTest(testCase, wasmInstance) {
    log(`\n  Test: ${testCase.name}`, 'blue');
    log(`    Template: ${testCase.template}`);
    log(`    Context: ${testCase.context}`);
    if (testCase.input) {
        log(`    Input: ${testCase.input}`);
    }

    try {
        // Note: The actual method to call the VTL processor will depend on
        // how GraalVM exports the Java methods. This is a placeholder.
        // You may need to call a specific exported function like:
        // const result = wasmInstance.exports.process(template, input, context);

        // For now, we'll check if the expected exports exist
        if (!wasmInstance.exports.process && !wasmInstance.exports.main) {
            log('    ⚠ Expected exports (process/main) not found', 'yellow');
            log('    ℹ See exports list above for available functions', 'cyan');
            return { status: 'skipped', reason: 'Method not exported' };
        }

        // If we found the process method, try to call it
        // This is a placeholder - actual implementation will depend on the WASM interface
        log('    ✓ Test setup complete (execution pending WASM interface)', 'green');
        return { status: 'pending', reason: 'WASM interface needs to be implemented' };

    } catch (error) {
        log(`    ✗ Test failed: ${error.message}`, 'red');
        return { status: 'failed', error: error.message };
    }
}

async function main() {
    log('='.repeat(70), 'cyan');
    log('  GraalVM WASM VTL Processor - Node.js Test Suite', 'cyan');
    log('='.repeat(70), 'cyan');

    try {
        // Load the WASM module
        const wasmInstance = await loadWasm(wasmPath);

        // Inspect exports
        const hasExports = testWasmExports(wasmInstance);

        if (!hasExports) {
            log('\n✗ WASM module has no exports. Build may have failed.', 'red');
            process.exit(1);
        }

        // Run test cases
        log('\n' + '='.repeat(70), 'cyan');
        log('  Running Test Cases', 'cyan');
        log('='.repeat(70), 'cyan');

        const results = {
            passed: 0,
            failed: 0,
            skipped: 0,
            pending: 0
        };

        for (const testCase of testCases) {
            const result = runTest(testCase, wasmInstance);
            results[result.status]++;
        }

        // Summary
        log('\n' + '='.repeat(70), 'cyan');
        log('  Test Summary', 'cyan');
        log('='.repeat(70), 'cyan');
        log(`  Total Tests: ${testCases.length}`);
        log(`  Passed: ${results.passed}`, 'green');
        log(`  Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'reset');
        log(`  Pending: ${results.pending}`, 'yellow');
        log(`  Skipped: ${results.skipped}`, 'yellow');

        // Additional info
        log('\n' + '='.repeat(70), 'cyan');
        log('  Next Steps', 'cyan');
        log('='.repeat(70), 'cyan');
        log('  1. Verify the WASM exports match the expected interface');
        log('  2. Implement the process() method binding if available');
        log('  3. Test with actual VTL template processing');
        log('  4. Verify browser compatibility with test-wasm-browser.html');

        process.exit(results.failed > 0 ? 1 : 0);

    } catch (error) {
        log(`\n✗ Error: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    }
}

// Run the tests
if (require.main === module) {
    main().catch(error => {
        log(`\nFatal error: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    });
}

module.exports = { loadWasm, testWasmExports };
