const fs = require('fs');
const path = require('path');

const rootConfigPath = path.join(__dirname, '..', 'config.json');
const defaultConfigPath = path.join(__dirname, '..', 'cfg.json');

let rootConfig = {};
if (fs.existsSync(rootConfigPath)) {
  rootConfig = JSON.parse(fs.readFileSync(rootConfigPath, 'utf8'));
} else if (fs.existsSync(defaultConfigPath)) {
  rootConfig = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf8'));
}

const db = Object.assign(
  {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'code',
    dialect: 'mysql',
    port: 3306,
    prefix: 'code_',
    logging: false
  },
  rootConfig.db || {}
);

module.exports = db;
