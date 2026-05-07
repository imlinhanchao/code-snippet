import fs from 'fs'
import path from 'path'

interface DbConfig {
  prefix?: string
  host?: string
  port?: number
  user?: string
  password?: string
  database?: string
  logging?: boolean
}

let dbConfig: DbConfig = {}
try {
  const rootConfigPath = path.join(process.cwd(), 'config.json')
  const defaultConfigPath = path.join(process.cwd(), 'cfg.json')
  const configPath = fs.existsSync(rootConfigPath) ? rootConfigPath : defaultConfigPath
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8')) as { db?: DbConfig }
    dbConfig = config.db || {}
  }
} catch {
  // config not available yet
}

export const prefix = dbConfig.prefix || 'code_'
export const getTableName = (name: string): string => `${prefix}${name}`
export { dbConfig }
