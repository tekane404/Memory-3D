import { defineConfig } from 'vite'

// Récupère le nom du repository depuis package.json pour GitHub Pages
const repoName = 'memory-3d'
const isGitHubPages = process.env.NODE_ENV === 'production'

export default defineConfig({
  base: isGitHubPages ? `/${repoName}/` : '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext'
  }
})
