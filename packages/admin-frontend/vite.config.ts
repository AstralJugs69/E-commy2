import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { visualizer } from 'rollup-plugin-visualizer'
/// <reference types="vitest" />

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react(),
      visualizer({
        filename: './dist/stats.html', // Output file in dist folder
        open: true, // Automatically open report in browser after build
        gzipSize: true, // Show gzipped size
        brotliSize: true, // Show brotli size
      })
    ],
    server: {
      port: 3011, // Define a specific port
      open: true, // Open browser on start
    },
    define: {
      // Make env variables available i n the client
      'process.env': env
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true,
    },
  }
})
