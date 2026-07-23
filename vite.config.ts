import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base: './' keeps built asset URLs relative so the app works when served from
// a GitHub Pages project subpath (e.g. https://user.github.io/repo/).
export default defineConfig({
  base: './',
  plugins: [react()],
})
