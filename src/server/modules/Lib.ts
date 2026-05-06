import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import App from './App'
import { Request } from 'express'

let configData: Record<string, any> = {}
try {
  configData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'config.json'), 'utf8'))
} catch {
  // config not ready
}

const filecfg = configData?.file || { upload: '/public/upload/', fileurl: '/upload/', maxSize: 2 }

const __error__ = Object.assign({}, App.error)
;(__error__ as any).toobig = App.error.reg('上传文件过大！')

function mkdirSync(dirpath: string): void {
  if (!fs.existsSync(dirpath)) {
    fs.mkdirSync(dirpath, { recursive: true })
  }
}

interface SessionLike {
  account_login?: Record<string, unknown>
}

// Allowed file extensions for upload (whitelist)
const ALLOWED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
  '.pdf', '.txt', '.md', '.json', '.xml', '.csv',
  '.zip', '.tar', '.gz'
])

class LibModule extends App {
  session?: SessionLike

  constructor(session?: SessionLike) {
    super([{ fun: App.ok, name: 'okupload', msg: '上传成功' }])
    this.session = session
  }

  // Dynamic methods
  okupload!: (data?: unknown) => object

  get error(): typeof __error__ {
    return __error__
  }

  async upload(req: Request & { files?: Express.Multer.File[] }): Promise<object> {
    try {
      const dirpath = path.join(process.cwd(), filecfg.upload)
      mkdirSync(dirpath)
      const filenames: string[] = []
      const files = req.files || []
      for (const file of files) {
        if (file.size > filecfg.maxSize * 1024 * 1024) {
          throw (this.error as any).toobig
        }
        const data = file.buffer
        const hash = crypto.createHash('md5').update(data).digest('hex')
        const ext = path.extname(file.originalname).toLowerCase()
        if (ext && !ALLOWED_EXTENSIONS.has(ext)) {
          throw (this.error as any).toobig // reuse error or add a specific one
        }
        const filename = hash + ext
        const savepath = path.join(dirpath, filename)
        if (!fs.existsSync(savepath)) {
          fs.writeFileSync(savepath, data)
        }
        filenames.push(filename)
      }
      return this.okupload(filenames)
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default LibModule
