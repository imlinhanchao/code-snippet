import 'reflect-metadata'
import fs from 'fs'
import path from 'path'
import { ensureAppDataSourceInitialized } from './server/database/data-source'
import app from './server/app'

let configData: Record<string, any> = {}
try {
  configData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'config.json'), 'utf8'))
} catch {
  console.error('[Error] config.json not found. Run `npm run init` first.')
  process.exit(0)
}

const PORT = configData?.base?.port || 3000

ensureAppDataSourceInitialized()
  .then(() => {
    console.info('[DB] Database connection established.')
    app.listen(PORT, () => {
      console.info(`[Server] Code Snippet running on http://localhost:${PORT}`)
    })
  })
  .catch((err: unknown) => {
    console.error('[DB] Database connection failed:', err)
    process.exit(1)
  })
