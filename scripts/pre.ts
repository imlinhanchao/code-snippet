import fs from 'fs'
import path from 'path'

function preBuild(): void {
  const configPath = path.join(__dirname, '..', 'config.json')
  if (!fs.existsSync(configPath)) {
    console.info('[Error] Please execute `npm run init` to initialization config.')
    return
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8')) as Record<string, any>
  const { name, domain, preview_domain, preview_url, cnzz } = config.base || {}

  const webConfig = {
    name,
    domain,
    preview_domain,
    preview_url,
    cnzz,
    fileurl: config.file?.fileurl,
    maxSize: config.file?.maxSize
  }

  fs.writeFileSync(path.join(__dirname, '..', 'frontend', 'config.json'), JSON.stringify(webConfig, null, 4))
}

preBuild()
