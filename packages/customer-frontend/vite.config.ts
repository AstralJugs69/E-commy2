import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'
/// <reference types="vitest" />

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}'], // Precache assets
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'images/icons/*.png'], // Ensure these are copied
        manifest: {
          name: 'Hybrid Store',
          short_name: 'HybridStore',
          description: 'Your friendly neighborhood hybrid e-commerce store.',
          theme_color: '#14B8A6', // Use our primary Teal color
          background_color: '#ffffff',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          icons: [
            { src: '/images/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/images/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
            // Add maskable icon later if needed
          ]
        }
      }),
      visualizer({
        filename: './dist/stats.html', // Output file in dist folder
        open: mode === 'development', // Only open automatically in development
        gzipSize: true, // Show gzipped size
        brotliSize: true, // Show brotli size
      })
    ],
    server: {
      port: 3000, // Define a specific port
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
      port: 4173, // Default preview port
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
