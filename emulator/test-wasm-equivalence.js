#!/usr/bin/env node

/**
 * WASM vs Java Equivalence Test Suite
 *
 * This script verifies that the WASM-compiled VTL processor produces
 * exactly the same results as the Java implementation.
 *
 * It loads test cases from the test-cases directory and runs them through
 * both implementations, comparing the outputs.
 *
 * Usage:
 *   node test-wasm-equivalence.js [options]
 *
 * Options:
 *   --jar <path>     Path to Java JAR file (default: target/vtl-processor.jar)
 *   --wasm <path>    Path to WASM file (default: target/graalvm-wasm/vtl-processor.wasm)
 *   --test-dir <dir> Path to test cases (default: src/test/resources/vtl-test-cases)
 *   --test <name>    Run specific test case only
 *   --verbose        Show detailed output
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const config = {
    jarPath: 'target/vtl-processor.jar',
    wasmPath: 'target/graalvm-wasm/vtl-processor.wasm',
    testDir: 'src/test/resources/vtl-test-cases',
    specificTest: null,
    verbose: false
};

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--jar' && i + 1 < args.length) {
        config.jarPath = args[++i];
    } else if (args[i] === '--wasm' && i + 1 < args.length) {
        config.wasmPath = args[++i];
    } else if (args[i] === '--test-dir' && i + 1 < args.length) {
        config.testDir = args[++i];
    } else if (args[i] === '--test' && i + 1 < args.length) {
        config.specificTest = args[++i];
    } else if (args[i] === '--verbose') {
        config.verbose = true;
    }
}

// Color output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function readJsonFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        return null;
    }
}

function readTextFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        return null;
    }
}

function loadTestCase(testCaseDir) {
    const testCaseName = path.basename(testCaseDir);
    const templatePath = path.join(testCaseDir, 'template.vtl');
    const contextPath = path.join(testCaseDir, 'context.json');
    const inputPath = path.join(testCaseDir, 'input.json');

    if (!fs.existsSync(templatePath)) {
        return null;
    }

    const template = readTextFile(templatePath);
    const context = readJsonFile(contextPath) || {};
    const input = readJsonFile(inputPath) || {};

    return {
        name: testCaseName,
        template,
        context: JSON.stringify(context),
        input: JSON.stringify(input)
    };
}

function loadAllTestCases(testDir) {
    if (!fs.existsSync(testDir)) {
        log(`Test directory not found: ${testDir}`, 'red');
        return [];
    }

    const entries = fs.readdirSync(testDir);
    const testCases = [];

    for (const entry of entries) {
        const testCaseDir = path.join(testDir, entry);
        if (!fs.statSync(testCaseDir).isDirectory()) {
            continue;
        }

        if (config.specificTest && entry !== config.specificTest) {
            continue;
        }

        const testCase = loadTestCase(testCaseDir);
        if (testCase) {
            testCases.push(testCase);
        }
    }

    return testCases.sort((a, b) => a.name.localeCompare(b.name));
}

function runJavaImplementation(testCase) {
    try {
        // Create temporary files for input
        const tempDir = fs.mkdtempSync('/tmp/vtl-test-');
        const templateFile = path.join(tempDir, 'template.vtl');
        const contextFile = path.join(tempDir, 'context.json');
        const inputFile = path.join(tempDir, 'input.json');

        fs.writeFileSync(templateFile, testCase.template);
        fs.writeFileSync(contextFile, testCase.context);
        fs.writeFileSync(inputFile, testCase.input);

        // Create a simple Java runner
        const javaCode = `
import dev.vtlemulator.engine.VTLProcessor;
import java.nio.file.Files;
import java.nio.file.Paths;

public class TestRunner {
    public static void main(String[] args) throws Exception {
        String template = new String(Files.readAllBytes(Paths.get(args[0])));
        String context = new String(Files.readAllBytes(Paths.get(args[1])));
        String input = new String(Files.readAllBytes(Paths.get(args[2])));

        VTLProcessor processor = new VTLProcessor();
        String result = processor.process(template, input, context);
        System.out.print(result);
    }
}
`;

        const javaFile = path.join(tempDir, 'TestRunner.java');
        fs.writeFileSync(javaFile, javaCode);

        // Compile and run (requires JAR in classpath)
        const jarPath = path.resolve(config.jarPath);

        execSync(`javac -cp "${jarPath}" "${javaFile}"`, { cwd: tempDir });
        const output = execSync(
            `java -cp "${jarPath}:${tempDir}" TestRunner "${templateFile}" "${contextFile}" "${inputFile}"`,
            { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
        );

        // Cleanup
        fs.rmSync(tempDir, { recursive: true, force: true });

        return {
            success: true,
            output: output.trim()
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

async function runWasmImplementation(testCase, wasmInstance) {
    try {
        // Note: This is a placeholder implementation
        // The actual WASM interface will depend on how GraalVM exports the functions

        // For now, we'll check if the expected exports exist
        if (!wasmInstance || !wasmInstance.exports) {
            return {
                success: false,
                error: 'WASM instance not available'
            };
        }

        // Try to find the process function
        const processFunc = wasmInstance.exports.process ||
                           wasmInstance.exports.processTemplate ||
                           wasmInstance.exports.main;

        if (!processFunc) {
            return {
                success: false,
                error: 'No process function found in WASM exports. Available: ' +
                       Object.keys(wasmInstance.exports).join(', ')
            };
        }

        // TODO: Implement actual WASM call once interface is known
        // const output = processFunc(testCase.template, testCase.input, testCase.context);

        return {
            success: false,
            error: 'WASM interface binding not yet implemented'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

function normalizeOutput(output) {
    // Normalize JSON output for comparison
    try {
        const parsed = JSON.parse(output);
        return JSON.stringify(parsed, null, 2);
    } catch {
        // Not JSON, return as-is with normalized whitespace
        return output.trim();
    }
}

function compareOutputs(javaOutput, wasmOutput) {
    const normalizedJava = normalizeOutput(javaOutput);
    const normalizedWasm = normalizeOutput(wasmOutput);

    if (normalizedJava === normalizedWasm) {
        return { match: true };
    }

    // Calculate difference details
    const javaLines = normalizedJava.split('\n');
    const wasmLines = normalizedWasm.split('\n');
    const maxLines = Math.max(javaLines.length, wasmLines.length);
    const differences = [];

    for (let i = 0; i < maxLines; i++) {
        const javaLine = javaLines[i] || '';
        const wasmLine = wasmLines[i] || '';

        if (javaLine !== wasmLine) {
            differences.push({
                line: i + 1,
                java: javaLine,
                wasm: wasmLine
            });
        }
    }

    return {
        match: false,
        differences,
        javaOutput: normalizedJava,
        wasmOutput: normalizedWasm
    };
}

async function loadWasm(wasmPath) {
    if (!fs.existsSync(wasmPath)) {
        return null;
    }

    try {
        const wasmBuffer = fs.readFileSync(wasmPath);
        const wasmModule = await WebAssembly.compile(wasmBuffer);

        const imports = {
            env: {},
            wasi_snapshot_preview1: {
                proc_exit: () => {},
                fd_write: () => 0,
                fd_read: () => 0,
                fd_close: () => 0,
                fd_seek: () => 0,
            }
        };

        const wasmInstance = await WebAssembly.instantiate(wasmModule, imports);
        return wasmInstance;
    } catch (error) {
        log(`Error loading WASM: ${error.message}`, 'red');
        return null;
    }
}

async function runEquivalenceTests() {
    log('='.repeat(80), 'cyan');
    log('  WASM vs Java Equivalence Test Suite', 'cyan');
    log('='.repeat(80), 'cyan');

    // Check prerequisites
    log('\n📋 Configuration:', 'blue');
    log(`  JAR Path:  ${config.jarPath}`);
    log(`  WASM Path: ${config.wasmPath}`);
    log(`  Test Dir:  ${config.testDir}`);

    const jarExists = fs.existsSync(config.jarPath);
    const wasmExists = fs.existsSync(config.wasmPath);

    log(`\n✓ Java JAR:  ${jarExists ? 'Found' : 'NOT FOUND'}`, jarExists ? 'green' : 'red');
    log(`✓ WASM file: ${wasmExists ? 'Found' : 'NOT FOUND'}`, wasmExists ? 'green' : 'red');

    if (!jarExists && !wasmExists) {
        log('\n❌ Neither JAR nor WASM file found. Please build first:', 'red');
        log('   JAR:  mvn clean package', 'yellow');
        log('   WASM: mvn clean package -Pnative-wasm', 'yellow');
        process.exit(1);
    }

    // Load test cases
    log('\n📦 Loading test cases...', 'blue');
    const testCases = loadAllTestCases(config.testDir);

    if (testCases.length === 0) {
        log('❌ No test cases found', 'red');
        process.exit(1);
    }

    log(`✓ Loaded ${testCases.length} test cases`, 'green');

    // Load WASM if available
    let wasmInstance = null;
    if (wasmExists) {
        log('\n🔧 Loading WASM module...', 'blue');
        wasmInstance = await loadWasm(config.wasmPath);
        if (wasmInstance) {
            log('✓ WASM module loaded', 'green');
            const exports = Object.keys(wasmInstance.exports);
            log(`  Exports: ${exports.join(', ')}`, 'cyan');
        } else {
            log('❌ Failed to load WASM module', 'red');
        }
    }

    // Run tests
    log('\n' + '='.repeat(80), 'cyan');
    log('  Running Tests', 'cyan');
    log('='.repeat(80), 'cyan');

    const results = {
        total: testCases.length,
        passed: 0,
        failed: 0,
        skipped: 0,
        javaOnly: 0,
        wasmOnly: 0,
        failures: []
    };

    for (const testCase of testCases) {
        log(`\n[${testCase.name}]`, 'bright');

        if (config.verbose) {
            log(`  Template: ${testCase.template.substring(0, 100)}...`, 'cyan');
            log(`  Context: ${testCase.context.substring(0, 100)}...`, 'cyan');
        }

        let javaResult = null;
        let wasmResult = null;

        // Run Java implementation
        if (jarExists) {
            process.stdout.write('  Java:  ');
            javaResult = runJavaImplementation(testCase);
            if (javaResult.success) {
                log('✓', 'green');
                if (config.verbose) {
                    log(`    Output: ${javaResult.output}`, 'cyan');
                }
            } else {
                log('✗ ' + javaResult.error, 'red');
            }
        }

        // Run WASM implementation
        if (wasmExists && wasmInstance) {
            process.stdout.write('  WASM:  ');
            wasmResult = await runWasmImplementation(testCase, wasmInstance);
            if (wasmResult.success) {
                log('✓', 'green');
                if (config.verbose) {
                    log(`    Output: ${wasmResult.output}`, 'cyan');
                }
            } else {
                log('⚠ ' + wasmResult.error, 'yellow');
            }
        }

        // Compare results
        if (javaResult && javaResult.success && wasmResult && wasmResult.success) {
            const comparison = compareOutputs(javaResult.output, wasmResult.output);

            if (comparison.match) {
                log('  Result: ✓ Outputs match', 'green');
                results.passed++;
            } else {
                log('  Result: ✗ Outputs differ', 'red');
                results.failed++;
                results.failures.push({
                    testCase: testCase.name,
                    comparison
                });

                if (config.verbose) {
                    log('  Differences:', 'red');
                    comparison.differences.slice(0, 5).forEach(diff => {
                        log(`    Line ${diff.line}:`, 'yellow');
                        log(`      Java: ${diff.java}`, 'cyan');
                        log(`      WASM: ${diff.wasm}`, 'magenta');
                    });
                }
            }
        } else if (javaResult && javaResult.success) {
            log('  Result: ⚠ Java only (WASM not available)', 'yellow');
            results.javaOnly++;
        } else if (wasmResult && wasmResult.success) {
            log('  Result: ⚠ WASM only (Java not available)', 'yellow');
            results.wasmOnly++;
        } else {
            log('  Result: ⊘ Both failed', 'red');
            results.skipped++;
        }
    }

    // Summary
    log('\n' + '='.repeat(80), 'cyan');
    log('  Test Summary', 'cyan');
    log('='.repeat(80), 'cyan');
    log(`\n  Total Tests:  ${results.total}`);
    log(`  ✓ Passed:     ${results.passed}`, results.passed > 0 ? 'green' : 'reset');
    log(`  ✗ Failed:     ${results.failed}`, results.failed > 0 ? 'red' : 'reset');
    log(`  ⊘ Skipped:    ${results.skipped}`, results.skipped > 0 ? 'yellow' : 'reset');

    if (results.javaOnly > 0) {
        log(`  ⚠ Java Only:  ${results.javaOnly}`, 'yellow');
    }
    if (results.wasmOnly > 0) {
        log(`  ⚠ WASM Only:  ${results.wasmOnly}`, 'yellow');
    }

    // Detailed failure report
    if (results.failures.length > 0 && !config.verbose) {
        log('\n' + '='.repeat(80), 'cyan');
        log('  Failure Details', 'cyan');
        log('='.repeat(80), 'cyan');

        for (const failure of results.failures) {
            log(`\n❌ ${failure.testCase}`, 'red');
            log('  Differences:', 'yellow');

            failure.comparison.differences.slice(0, 10).forEach(diff => {
                log(`    Line ${diff.line}:`, 'yellow');
                log(`      Java: ${diff.java.substring(0, 80)}`, 'cyan');
                log(`      WASM: ${diff.wasm.substring(0, 80)}`, 'magenta');
            });

            if (failure.comparison.differences.length > 10) {
                log(`    ... and ${failure.comparison.differences.length - 10} more differences`, 'yellow');
            }
        }
    }

    // Exit code
    log('');
    if (results.failed > 0) {
        log('❌ Equivalence tests FAILED', 'red');
        process.exit(1);
    } else if (results.passed > 0) {
        log('✅ All equivalence tests PASSED', 'green');
        process.exit(0);
    } else {
        log('⚠ No tests could be compared', 'yellow');
        log('\nNote: WASM interface binding needs to be implemented.', 'cyan');
        log('The WASM module is loaded, but the method calling interface', 'cyan');
        log('depends on how GraalVM exports the Java methods to WASM.', 'cyan');
        process.exit(2);
    }
}

// Run the tests
runEquivalenceTests().catch(error => {
    log(`\n💥 Fatal error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
});
