import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vike from 'vike/plugin'
import path from 'path'
import fs from 'fs'

function getBackendTarget() {
  try {
    const configPath = path.resolve(__dirname, 'config.json')
    if (!fs.existsSync(configPath)) return 'http://localhost:3000'
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    const port = config?.base?.port || 3000
    return `http://localhost:${port}`
  } catch {
    return 'http://localhost:3000'
  }
}

const backendTarget = getBackendTarget()

export default defineConfig({
  plugins: [
    vue(),
    vike({ prerender: false })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@store': path.resolve(__dirname, 'store'),
      '@components': path.resolve(__dirname, 'components'),
      '@pages': path.resolve(__dirname, 'pages')
    }
  },
  css: {
    postcss: './postcss.config.js'
  },
  server: {
    proxy: {
      '/api': backendTarget,
      '/view': backendTarget,
      '/res': backendTarget,
      '/upload': backendTarget
    }
  },
  build: {
    outDir: 'dist/client'
  }
})
