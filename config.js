const fs = require('fs');
const path = require('path');

const defaultConfig = require('./cfg.json');

const USER_CONFIG_PATH = path.join(__dirname, 'config.json');

function merge(base, extra) {
    if (!extra || typeof extra !== 'object' || Array.isArray(extra)) {
        return base;
    }

    const output = Array.isArray(base) ? [...base] : { ...base };
    Object.keys(extra).forEach((key) => {
        const value = extra[key];
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            output[key] = merge(output[key] || {}, value);
            return;
        }
        output[key] = value;
    });
    return output;
}

function normalize(raw = {}) {
    const merged = merge(defaultConfig, raw);
    const email = merge(defaultConfig.mail || {}, merged.email || merged.mail || {});
    email.auth = merge(defaultConfig.mail?.auth || {}, email.auth || {});
    if (email.auth.account && !email.auth.user) {
        email.auth.user = email.auth.account;
    }
    if (email.auth.user && !email.auth.account) {
        email.auth.account = email.auth.user;
    }
    merged.email = email;
    merged.mail = email;
    merged.base = merge({
        identityKey: '',
        secret: '',
        salt: '',
        glot: '',
        preview_domain: '',
    }, merged.base || {});
    merged.file = merge({
        upload: '/public/upload/',
        fileurl: '/upload/',
        maxSize: 2,
    }, merged.file || {});
    merged.db = merge({
        host: '',
        user: '',
        password: '',
        database: '',
        dialect: 'mysql',
        prefix: '',
        port: 3306,
        logging: false,
    }, merged.db || {});
    return merged;
}

function toPersistedConfig(config = {}) {
    const normalized = normalize(config);
    return {
        base: normalized.base,
        file: normalized.file,
        mail: normalized.mail,
        db: normalized.db,
    };
}

function loadRuntimeConfig() {
    const exists = fs.existsSync(USER_CONFIG_PATH);
    const userConfig = exists ? require(USER_CONFIG_PATH) : {};
    const config = normalize(userConfig);
    config.configured = exists;
    config.paths = {
        root: __dirname,
        userConfig: USER_CONFIG_PATH,
    };
    return config;
}

module.exports = loadRuntimeConfig();
module.exports.loadRuntimeConfig = loadRuntimeConfig;
module.exports.toPersistedConfig = toPersistedConfig;
module.exports.USER_CONFIG_PATH = USER_CONFIG_PATH;
