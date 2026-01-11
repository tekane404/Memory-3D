import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      'three/examples/jsm': 'three/examples/jsm'
    }
  },
  optimizeDeps: {
    include: ['three', 'three/examples/jsm/controls/OrbitControls']
  }
})
