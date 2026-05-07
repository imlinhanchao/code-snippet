import { defineConfig, Plugin, ViteDevServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import vike from 'vike/plugin'
import path from 'path'

function backendMiddlewarePlugin(): Plugin {
  return {
    name: 'backend-middleware-plugin',
    apply: 'serve' as const,
    async configureServer(server: ViteDevServer) {
      const [{ default: backendApp }, { ensureAppDataSourceInitialized }] = await Promise.all([
        import('./src/server/app'),
        import('./src/server/database/data-source')
      ])

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
