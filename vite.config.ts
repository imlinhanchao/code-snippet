import { defineConfig, Plugin, ViteDevServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import vike from 'vike/plugin'
import path from 'path'

function backendMiddlewarePlugin(): Plugin {
  return {
    name: 'backend-middleware-plugin',
    apply: 'serve' as const,
    async configureServer(server: ViteDevServer) {
      const runtimeFlag = 'TS_NODE_REGISTERED_FLAG'
      const runtimeGlobal = globalThis as Record<string, unknown>
      if (!runtimeGlobal[runtimeFlag]) {
        require('ts-node/register/transpile-only')
        runtimeGlobal[runtimeFlag] = true
      }

      const appModulePath = path.resolve(__dirname, 'src/server/app.ts')
      const dataSourceModulePath = path.resolve(__dirname, 'src/server/database/data-source.ts')
      const backendApp = require(appModulePath).default
      const { ensureAppDataSourceInitialized } = require(dataSourceModulePath)

      await ensureAppDataSourceInitialized()
      console.info('[DB] Database connection established (vike dev).')

      server.middlewares.use((req, res, next) => {
        const url = req.url || ''
        if (
          url.startsWith('/api') ||
          url.startsWith('/view') ||
          url.startsWith('/res') ||
          url.startsWith('/upload')
        ) {
          backendApp(req, res, next)
          return
        }
        next()
      })
    }
  }
}

export default defineConfig({
  plugins: [
    vue(),
    vike({ prerender: false }),
    backendMiddlewarePlugin()
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
