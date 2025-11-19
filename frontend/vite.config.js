import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 3000,
    open: true
  },
  resolve: {
    alias: {
      '@fearlessfara/apigw-vtl-emulator': path.resolve(__dirname, '../emulator/typescript/dist/index.js')
    }
  },
  optimizeDeps: {
    include: ['@fearlessfara/apigw-vtl-emulator']
  }
})

