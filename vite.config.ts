import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vike from 'vike/plugin'
import path from 'path'

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
  build: {
    outDir: 'dist/client'
  }
})
