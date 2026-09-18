import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // La scène 3D du lustre (Three.js, ~560 Ko minifiés) est un morceau séparé, chargé après la page
    chunkSizeWarningLimit: 600,
  },
})
