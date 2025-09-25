const fs = require('fs');
const path = require('path');
function preBuild() {
  if (!fs.existsSync(path.join(__dirname, '..', 'config.json'))) {
    console.info('[Error] Please execute `npm run init` to initialization config.')
    return;
  }
  let config = require('../config');
  const {
    name,
    domain,
    preview_domain,
    preview_url,
    cnzz,
  } = config.base;
  const webConfig = {
    name,
    domain,
    preview_domain,
    preview_url,
    cnzz,
    fileurl: config.file.fileurl,
    maxSize: config.file.maxSize,
  };
  fs.writeFileSync(path.join(__dirname, '..', 'frontend', 'config.json'), JSON.stringify(webConfig, null, 4));
}

preBuild();