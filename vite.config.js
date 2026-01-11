import { defineConfig } from 'vite'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      'three/examples/jsm': resolve(__dirname, 'node_modules/three/examples/jsm')
    }
  }
})
