import { describe, it, expect } from 'vitest';
import { VTLProcessor } from '../src/engine/VTLProcessor';
import * as fs from 'fs';
import * as path from 'path';

const TEST_CASES_DIR = path.join(__dirname, 'vtl-test-cases');

/**
 * File-based test runner
 * Reads test cases from vtl-test-cases/ and runs them against the VTLProcessor
 * Each test case folder contains:
 * - template.vtl - The VTL template
 * - input.json - The input body
 * - context.json - The context variables
 * - expected.json (optional) - The expected output
 */
describe('VTL File-Based Tests', () => {
  const processor = new VTLProcessor();

  // Get all test case directories
  const testCaseDirs = fs
    .readdirSync(TEST_CASES_DIR)
    .filter((file) => {
      const fullPath = path.join(TEST_CASES_DIR, file);
      return fs.statSync(fullPath).isDirectory();
    })
    .sort();

  testCaseDirs.forEach((testCase) => {
    it(`should process ${testCase}`, () => {
      const testDir = path.join(TEST_CASES_DIR, testCase);

      // Read test files
      const templatePath = path.join(testDir, 'template.vtl');
      const inputPath = path.join(testDir, 'input.json');
      const contextPath = path.join(testDir, 'context.json');
      const expectedPath = path.join(testDir, 'expected.json');

      // Check if required files exist
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Missing template.vtl in ${testCase}`);
      }

      // Read files
      const template = fs.readFileSync(templatePath, 'utf-8');
      const input = fs.existsSync(inputPath) ? fs.readFileSync(inputPath, 'utf-8') : '{}';
      const context = fs.existsSync(contextPath)
        ? fs.readFileSync(contextPath, 'utf-8')
        : '{}';

      // Process the template
      const result = processor.process(template, input, context);

      // Verify result is valid
      expect(result).toBeDefined();
      expect(result).not.toContain('Error processing template');

      // If expected output exists, compare it
      if (fs.existsSync(expectedPath)) {
        const expected = fs.readFileSync(expectedPath, 'utf-8').trim();

        // Try to parse both as JSON for comparison
        try {
          const resultJson = JSON.parse(result);
          const expectedJson = JSON.parse(expected);
          expect(resultJson).toEqual(expectedJson);
        } catch (e) {
          // If not JSON, compare as strings
          expect(result.trim()).toBe(expected);
        }
      } else {
        // No expected output, just verify it doesn't error
        console.log(`✓ ${testCase}: ${result.substring(0, 100)}${result.length > 100 ? '...' : ''}`);
      }
    });
  });
});
