import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: 'http://127.0.0.1:4174',
    headless: true
  },
  webServer: {
    command: process.env.CI
      ? 'npm run preview -- --host 127.0.0.1 --port 4174 --strictPort'
      : 'npm run dev -- --host 127.0.0.1 --port 4174 --strictPort --open false',
    port: 4174,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
