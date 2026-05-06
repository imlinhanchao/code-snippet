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
  const configPath = path.join(process.cwd(), 'model', 'config.json')
  if (fs.existsSync(configPath)) {
    dbConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'))
  }
} catch {
  // config not available yet
}

export const prefix = dbConfig.prefix || 'code_'
export const getTableName = (name: string): string => `${prefix}${name}`
export { dbConfig }
