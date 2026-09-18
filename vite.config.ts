import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Démo : / = page de démo (écran de chargement et sélecteur), /v1/ = version classique (src),
// /v2/ = version immersive (src-v2). Les deux versions sont chargées ensemble au démarrage.
export default defineConfig({
  plugins: [react()],
  build: {
    // La scène 3D du lustre (Three.js, ~560 Ko minifiés) est un morceau séparé, chargé après la page
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      input: {
        demo: 'index.html',
        v1: 'v1/index.html',
        v2: 'v2/index.html',
      },
    },
  },
})
