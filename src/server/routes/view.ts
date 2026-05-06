import { Router, Request, Response } from 'express'
import mime from 'mime-types'
import fs from 'fs'
import path from 'path'
import SnippetModule from '../modules/Snippet'
import CodeModule from '../modules/Code'

let configData: Record<string, any> = {}
try {
  configData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'config.json'), 'utf8'))
} catch {
  // config not ready
}

const router = Router()

router.get('/:id/:file', async (req: Request, res: Response, next) => {
  if (req.hostname !== configData?.base?.preview_domain) {
    return next()
  }

  const snippet = new SnippetModule(req.session as any)
  const data = await snippet.query(
    { query: { id: [req.params.id] }, count: 1, index: 0 },
    true
  ) as any
  if (data.total === 0) return res.status(404).send('404 not found')

  const code = new CodeModule(req.session as any)
  const file = await code.query(
    {
      query: { snippet: req.params.id, filename: req.params.file },
      count: 1,
      index: 0
    },
    true
  ) as any
  if (file.total === 0) return res.status(404).send('404 not found')

  const fileData = file.data[0]
  const contentType = mime.lookup(fileData.filename) || 'text/plain'
  res.header('Content-Type', `${contentType}; charset=utf-8`)
  res.end(fileData.content)
})

export default router
