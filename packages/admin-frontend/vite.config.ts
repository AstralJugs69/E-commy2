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
        open: mode === 'development', // Only open automatically in development
        gzipSize: true, // Show gzipped size
        brotliSize: true, // Show brotli size
      })
    ],
    server: {
      port: 3011, // Define a specific port
      open: true, // Open browser on start
      proxy: {
        // Proxy API requests to backend server during development
        '/api': {
          target: process.env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false
        }
      }
    },
    preview: {
      port: 4174, // Different preview port from customer frontend
      proxy: {
        // Proxy API requests to backend server during preview
        '/api': {
          target: process.env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false
        }
      }
    },
    define: {
      // Make env variables available in the client
      'process.env': {
        ...env,
        // Ensure these variables are always available
        VITE_API_BASE_URL: env.VITE_API_BASE_URL || '/api',
        NODE_ENV: env.NODE_ENV || mode
      }
    },
    build: {
      // Production build optimizations
      sourcemap: mode !== 'production', // Disable sourcemaps in production
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            bootstrap: ['react-bootstrap', 'bootstrap'],
          }
        }
      },
      chunkSizeWarningLimit: 1000 // Increase warning limit for larger chunks
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true,
    },
  }
})
