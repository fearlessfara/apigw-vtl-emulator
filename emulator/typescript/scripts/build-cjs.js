#!/usr/bin/env node
/**
 * Build script for CommonJS output
 * Copies ESM output to CJS format and updates package.json
 */
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const distCjsDir = path.join(__dirname, '../dist-cjs');
  const distDir = path.join(__dirname, '../dist');

  try {
    // Copy dist-cjs contents to dist with .cjs extension
    const files = await fs.readdir(distCjsDir, { recursive: true });

    for (const file of files) {
      const srcPath = path.join(distCjsDir, file);
      const stat = await fs.stat(srcPath);

      if (stat.isFile() && file.endsWith('.js')) {
        const destPath = path.join(distDir, file.replace('.js', '.cjs'));
        await fs.mkdir(path.dirname(destPath), { recursive: true });
        await fs.copyFile(srcPath, destPath);
        console.log(`Copied ${file} -> ${file.replace('.js', '.cjs')}`);
      }
    }

    // Clean up dist-cjs directory
    await fs.rm(distCjsDir, { recursive: true, force: true });
    console.log('Build complete! Created both ESM and CJS outputs.');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

main();
