import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

const velocitsBrowserEntry = fileURLToPath(
  new URL('./node_modules/velocits/dist-browser/browser.js', import.meta.url)
)
const fsShim = fileURLToPath(new URL('./src/shims/fs.js', import.meta.url))
const pathShim = fileURLToPath(new URL('./src/shims/path.js', import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      velocits: velocitsBrowserEntry,
      fs: fsShim,
      'node:fs': fsShim,
      'node:fs/promises': fsShim,
      path: pathShim,
      'node:path': pathShim
    }
  },
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 3000,
    open: true
  },
  optimizeDeps: {
    include: ['apigw-vtl-emulator']
  }
})
