import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
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
      })
    ],
    server: {
      port: 3000, // Define a specific port
      open: true, // Open browser on start
    },
    define: {
      // Make env variables available in the client
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
