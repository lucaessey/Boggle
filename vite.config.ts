import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// GitHub Pages serves this project site from a subpath, so asset URLs must be
// prefixed with the repo name. This also means the dev server serves the app at
// http://localhost:5173/Boggle/ (not the root).
export default defineConfig({
  base: '/Boggle/',
  plugins: [react()],
})
