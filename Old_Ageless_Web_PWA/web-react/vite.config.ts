import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// Emit to ../web/react-build and name the main chunk predictably as react-app.js
export default defineConfig({
  plugins: [react()],
  root: '.',
  base: '/react-build/',
  build: {
    outDir: resolve(__dirname, '../web/react-build'),
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
      output: {
        entryFileNames: 'react-app.js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true
  }
})
