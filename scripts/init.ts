import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { randomBytes, randomUUID } from 'crypto'

type Dict = Record<string, any>

const ROOT_CONFIG_PATH = path.join(__dirname, '..', 'config.json')
const DEFAULT_CONFIG_PATH = path.join(__dirname, '..', 'cfg.json')

function loadConfig(): Dict {
  const p = fs.existsSync(ROOT_CONFIG_PATH) ? ROOT_CONFIG_PATH : DEFAULT_CONFIG_PATH
  const config = JSON.parse(fs.readFileSync(p, 'utf8')) as Dict

  // Backward compatibility for cfg.json where key may be `mail`
  if (!config.email && config.mail) {
    config.email = {
      ...config.mail,
      auth: {
        account: config.mail?.auth?.user || '',
        pass: config.mail?.auth?.pass || ''
      }
    }
  }

  config.base = config.base || {}
  config.file = config.file || {}
  config.db = config.db || {}
  config.email = config.email || { auth: { account: '', pass: '' } }
  config.email.auth = config.email.auth || { account: '', pass: '' }

  return config
}

const secureToken = (size = 24): string => randomBytes(size).toString('base64url')

function ask(rl: readline.Interface, key: string, defaultVal: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      rl.question(`${key} ${defaultVal ? `[${defaultVal}]` : ''}: `, (val) => {
        resolve((val || defaultVal).trim())
      })
    } catch (error) {
      reject(error)
    }
  })
}

async function main(): Promise<void> {
  const config = loadConfig()
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

  console.info("Let's config website.")

  if (
    !config.base.identityKey ||
    (await ask(rl, 'Do you want to reset safe key config (identityKey etc.) ?', 'N')) === 'Y'
  ) {
    config.base.identityKey = `_WEB_SESSION_ID_${secureToken(12)}`
    config.base.secret = `${secureToken(24)}${secureToken(24)}`
    config.base.salt = randomUUID().toUpperCase()
  }

  config.base.port = parseInt(await ask(rl, 'Port', String(config.base.port || 3000)), 10)
  config.base.domain = await ask(rl, 'Domain', config.base.domain || `http://localhost:${config.base.port}`)
  config.base.preview_url = await ask(
    rl,
    'Preview Domain',
    config.base.preview_url || `http://preview.local:${config.base.port}`
  )
  config.base.preview_domain = new URL(config.base.preview_url).hostname
  config.base.name = await ask(rl, 'Website Name', config.base.name || 'Code Snippet')
  config.base.glot = await ask(rl, 'Glot Token', config.base.glot || '')
  config.base.cnzz = await ask(rl, 'CNZZ Site Id', config.base.cnzz || '')

  config.file.maxSize = parseInt(await ask(rl, 'Max Size File Upload(MB)', String(config.file.maxSize || 2)), 10)

  console.info('Config Database:')
  config.db.host = await ask(rl, 'Database Host', config.db.host || 'localhost')
  config.db.user = await ask(rl, 'Database User', config.db.user || 'root')
  config.db.password = await ask(rl, 'Database Password', config.db.password || '')
  config.db.port = parseInt(await ask(rl, 'Database Port', String(config.db.port || 3306)), 10)
  config.db.database = await ask(rl, 'Database Name', config.db.database || 'code')
  config.db.prefix = await ask(rl, 'Table Prefix', config.db.prefix || 'code_')
  config.db.logging = (await ask(rl, 'Log SQL Execute', config.db.logging ? 'Y' : 'N')) === 'Y'
  config.db.dialect = config.db.dialect || 'mysql'

  console.info('Config Email:')
  config.email.host = await ask(rl, 'Email Server Host', config.email.host || '')
  config.email.port = parseInt(await ask(rl, 'Email Server Port', String(config.email.port || 465)), 10)
  config.email.auth.account = await ask(rl, 'Mail Account', config.email.auth.account || '')
  config.email.auth.pass = await ask(rl, 'Account Password', config.email.auth.pass || '')

  fs.writeFileSync(ROOT_CONFIG_PATH, JSON.stringify(config, null, 4))
  fs.mkdirSync(path.join(__dirname, '..', 'public', 'dist'), { recursive: true })

  rl.close()
  await initDB()
}

async function initDB(): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const model = require('../model')
    await model.sync()
    console.info('[Success] Init all model finish.')
    console.info("[Info] Please execute 'npm run build' to build frontend, and then execute 'npm start' to start the website.")
  } catch (err: any) {
    console.error(`[Error] Init database model failed: ${err?.message || String(err)}`)
  }
  process.exit()
}

void main()
