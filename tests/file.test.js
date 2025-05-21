import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { renderVTL } from '../vtl-emulator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testFilesDir = path.join(__dirname, 'files');

describe('VTL template rendering', () => {
  const files = fs.readdirSync(testFilesDir)
      .filter(file => file.endsWith('.vtl') && !file.endsWith('.result.vtl'));

  for (const file of files) {
    const testName = file.replace('.vtl', '');
    const templatePath = path.join(testFilesDir, `${testName}.vtl`);
    const resultPath = path.join(testFilesDir, `${testName}.result.vtl`);
    const inputPath = path.join(testFilesDir, `${testName}.json`);

    it(`should render template correctly for ${testName}`, () => {
      const template = fs.readFileSync(templatePath, 'utf8');
      const expected = fs.readFileSync(resultPath, 'utf8').trim();

      const event = fs.existsSync(inputPath)
          ? JSON.parse(fs.readFileSync(inputPath, 'utf8'))
          : {};

      const actual = renderVTL(template, event).trim();

      expect(actual).to.equal(expected);
    });
  }
});
