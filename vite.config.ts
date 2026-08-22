import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

import pkg from './package.json' with { type: 'json' }

// PWA plugin configuration extracted to keep the defineConfig callback concise.
// Uses autoUpdate so the service worker activates new versions automatically
// without requiring the user to force-close all tabs.
const pwaPlugin = VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.svg', 'pwa-192x192.svg', 'pwa-512x512.svg'],
  manifest: {
    name: 'Jisaku: Kanji Dictionary Curation App',
    short_name: 'Jisaku',
    description: 'Personal tool for researching and documenting kanji',
    theme_color: '#4f7d8c',
    background_color: '#fafafa',
    display: 'standalone',
    start_url: '.',
    icons: [
      {
        src: 'pwa-192x192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any'
      },
      {
        src: 'pwa-512x512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      }
    ]
  },
  workbox: {
    // Cache all static assets
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,wasm}'],
    // Runtime caching for sql.js WASM files
    runtimeCaching: [
      {
        // Cache WASM files from node_modules (bundled)
        urlPattern: /\.wasm$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'wasm-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
          }
        }
      }
    ]
  }
})

export default defineConfig(({ command }) => ({
  // Base path for GitHub Pages deployment
  // Only apply /jisaku/ base during production build on GitHub Actions
  // Dev server always uses '/' so Playwright E2E tests work correctly
  base: command === 'build' && process.env['GITHUB_ACTIONS'] ? '/jisaku/' : '/',

  plugins: [vue(), pwaPlugin],

  define: {
    __APP_VERSION__: JSON.stringify(pkg.version)
  },

  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src')
    }
  },

  // sql.js requires special handling for WASM files
  optimizeDeps: {
    include: ['sql.js']
  },

  build: {
    target: 'es2022',
    // Source maps are included in the build intentionally. This is a personal
    // tool deployed to GitHub Pages — obfuscation provides no security benefit
    // and source maps aid debugging production issues. Consider `'hidden'` if
    // the deployment surface ever changes.
    sourcemap: true
  },

  server: {
    port: 5173,
    strictPort: true,
    // Enable CORS for local development
    cors: true,
    // Required headers for SharedArrayBuffer (needed by sql.js in some cases)
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },

  preview: {
    port: 4173,
    strictPort: true
  }
}))
