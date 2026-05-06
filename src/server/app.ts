import 'reflect-metadata'
import express, { Request, Response, NextFunction } from 'express'
import fs from 'fs'
import path from 'path'
import favicon from 'serve-favicon'
import logger from 'morgan'
import cookieParser from 'cookie-parser'
import session from 'express-session'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const robots = require('express-robots')
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './swagger'
import apiRouter from './routes/api'
import viewRouter from './routes/view'

let configData: Record<string, any> = {}
try {
  configData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'config.json'), 'utf8'))
} catch {
  // config not ready
}

const FileStore = require('session-file-store')(session)

const app = express()

// Ensure public directory exists
const publicDir = path.join(process.cwd(), 'public')
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true })

app.use(robots({ UserAgent: '*', Disallow: '/' }))

const faviconPath = path.join(process.cwd(), 'frontend', 'assets', 'favicon.ico')
if (fs.existsSync(faviconPath)) {
  app.use(favicon(faviconPath))
}

app.use(logger('dev'))
app.use(express.json({ limit: '2048kb' }))
app.use(express.urlencoded({ limit: '2048kb', extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(process.cwd(), 'public')))

app.use(
  session({
    name: configData?.base?.identityKey || 'connect.sid',
    secret: configData?.base?.secret || 'code-snippet-secret',
    store: new FileStore({ logFn: () => {} }),
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 60 * 60 * 24 * 1000 * 365
    }
  })
)

// Swagger API docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// API routes
app.use('/api', apiRouter)

// View routes (raw file serving for preview domain)
app.use('/view', viewRouter)

// SPA fallback
app.use((_req: Request, res: Response) => {
  const indexPath = path.join(process.cwd(), 'public', 'index.html')
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.status(404).send('Not found — run `npm run build` first')
  }
})

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ state: -1, msg: err.message || 'Server error' })
})

export default app
