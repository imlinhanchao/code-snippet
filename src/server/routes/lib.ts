import { Router, Request, Response } from 'express'
import multer from 'multer'
import svgCaptcha from 'svg-captcha'
import App from '../modules/App'
import LibModule from '../modules/Lib'

const upload = multer()
const router = Router()

/**
 * @openapi
 * /lib/upload:
 *   post:
 *     summary: Upload files
 *     tags: [Lib]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Upload result
 */
router.post('/upload', upload.array('file'), async (req: Request, res: Response) => {
  try {
    const lib = new LibModule(req.session as any)
    res.json(await lib.upload(req as any))
  } catch (err) {
    return res.json(App.err(err))
  }
})

/**
 * @openapi
 * /lib/captcha:
 *   get:
 *     summary: Get SVG captcha
 *     tags: [Lib]
 *     responses:
 *       200:
 *         description: SVG captcha image
 *         content:
 *           image/svg+xml:
 *             schema:
 *               type: string
 */
router.get('/captcha', (req: Request, res: Response) => {
  // Whitelist allowed captcha options to prevent library option injection
  const q = req.query as Record<string, string>
  const option: Record<string, unknown> = {}
  if (q.size) option.size = Math.min(Math.max(parseInt(q.size) || 4, 1), 8)
  if (q.noise) option.noise = Math.min(Math.max(parseInt(q.noise) || 2, 0), 5)
  if (q.color) option.color = q.color === 'true'
  if (q.background) option.background = q.background.replace(/[^a-zA-Z0-9#]/g, '')
  const code = svgCaptcha.create(option)
  ;(req.session as any)['captcha'] = code.text.toLowerCase()
  res.header('Content-Type', 'image/svg+xml')
  res.end(code.data)
})

export default router
