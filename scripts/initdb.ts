import fs from 'fs'
import path from 'path'
import readline from 'readline'

type Dict = Record<string, any>

const ROOT_CONFIG_PATH = path.join(__dirname, '..', 'config.json')
const DEFAULT_CONFIG_PATH = path.join(__dirname, '..', 'cfg.json')

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

function loadConfig(): Dict {
  const p = fs.existsSync(ROOT_CONFIG_PATH) ? ROOT_CONFIG_PATH : DEFAULT_CONFIG_PATH
  const config = JSON.parse(fs.readFileSync(p, 'utf8')) as Dict
  config.db = config.db || {}
  return config
}

async function ensureDbConfig(): Promise<void> {
  if (fs.existsSync(ROOT_CONFIG_PATH)) return

  const config = loadConfig()
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

  config.db.host = await ask(rl, 'Host', config.db.host || 'localhost')
  config.db.user = await ask(rl, 'User', config.db.user || 'root')
  config.db.password = await ask(rl, 'Password', config.db.password || '')
  config.db.port = parseInt(await ask(rl, 'Port', String(config.db.port || 3306)), 10)
  config.db.database = await ask(rl, 'Database Name', config.db.database || 'code')
  config.db.prefix = config.db.prefix || 'code_'
  config.db.logging = Boolean(config.db.logging)
  config.db.dialect = config.db.dialect || 'mysql'

  fs.writeFileSync(ROOT_CONFIG_PATH, JSON.stringify(config, null, 4))
  rl.close()
}

async function initDB(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const model = require('../model')

  if (process.argv.length > 2) {
    const table = process.argv[2]
    if (model[table]) {
      await model[table].sync({ force: true })
      console.info(`[Success] Init model ${table} finish.`)
    } else {
      console.error(`[Error] Model ${table} not found!`)
    }
    process.exit()
    return
  }

  try {
    await model.sync()
    console.info('[Success] Init all model finish.')
  } catch (err: any) {
    console.error(`[Error] Init database model failed: ${err?.message || String(err)}`)
  }
  process.exit()
}

async function main(): Promise<void> {
  await ensureDbConfig()
  await initDB()
}

void main()
