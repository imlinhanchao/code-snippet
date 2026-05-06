// eslint-disable-next-line @typescript-eslint/no-require-imports
import axios from 'axios'
import App from './App'
import fs from 'fs'
import path from 'path'

const langs: Record<string, unknown>[] = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'langs.json'), 'utf8')
)

let configData: Record<string, unknown> = {}
try {
  configData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'config.json'), 'utf8'))
} catch {
  // config not ready
}

const domain = 'https://glot.io/api/run'
const token = (configData as any)?.base?.glot || ''

const __langs__: Record<string, string> = {}
langs.forEach((l: any) => { __langs__[l.language] = l.glot })

const __error__ = Object.assign({}, App.error)

class GlotApp extends App {
  static get error() {
    return __error__
  }

  static get langs() {
    return __langs__
  }

  static async compiler(
    language: string,
    files: Array<{ name: string; content: string }>,
    stdin: string = '',
    command: string = '',
    version: string = 'latest'
  ): Promise<unknown> {
    try {
      const url = `${domain}/${GlotApp.langs[language]}/${version}`
      const rsp = await axios({
        method: 'POST',
        url,
        headers: {
          Authorization: `Token ${token}`
        },
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
        data: { files, stdin, command }
      })
      if (rsp.status > 400) {
        throw GlotApp.error.network('HTTP ' + rsp.status)
      }
      return rsp.data
    } catch (error) {
      throw error
    }
  }
}

export default GlotApp
