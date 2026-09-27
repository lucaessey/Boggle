import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
// GitHub Pages serves this project site from a subpath, so asset URLs must be
// prefixed with the repo name. This also means the dev server serves the app at
// http://localhost:5173/Boggle/ (not the root).
export default defineConfig({
  base: '/Boggle/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: '/Boggle/',
        name: 'Boggle',
        short_name: 'Boggle',
        description: 'Find words, beat your best score, and play Boggle offline.',
        lang: 'en',
        start_url: '/Boggle/',
        scope: '/Boggle/',
        display: 'standalone',
        background_color: '#16171d',
        theme_color: '#4f8cff',
        categories: ['games', 'education'],
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Include the dictionary-bearing bundles, solver worker, lazy screens,
        // and both backgrounds so a fresh offline launch can play every solo mode.
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,avif,webmanifest}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: 'index.html',
        navigateFallbackAllowlist: [/^\/Boggle\//],
        // An update waits until the player chooses to reload from the menu.
        skipWaiting: false,
        clientsClaim: false,
        cleanupOutdatedCaches: true,
      },
    }),
  ],
})
