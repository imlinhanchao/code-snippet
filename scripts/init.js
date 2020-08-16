const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { v4: uuidv4 } = require('uuid');
let config = require(
    fs.existsSync(path.join(__dirname, '..', 'config.json')) ?
    '../config' : '../cfg'
);

const randomStr = () => randomUp(Math.random().toString(36).substr(2));
const randomUp = s => s.split('').map(s => parseInt(Math.random() * 10) % 2 ? s : s.toUpperCase()).join('');

async function main() {
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.inputData = function (key, defaultVal) {
        return new Promise((resolve, reject) => {
            try {
                this.question(`${key} ${(defaultVal ? `[${defaultVal}]` : '')}: `, function (val) {
                    resolve(val || defaultVal);
                });
            } catch (error) {
                reject(error);
            }
        });
    };

    console.info('Let\'s config website.');

    if (config.base['identityKey'] == ''
        || await rl.inputData('Do you want to reset safe key config (identityKey etc.) ?', 'N') == 'Y') {
        config.base['identityKey'] = '_WEB_SESSION_ID_' + randomStr();
        config.base['secret'] = randomStr() + randomStr();
        config.base['salt'] = randomUp(uuidv4());
    }
    config.base['port'] = parseInt(await rl.inputData('Port', config.base['port']));
    config.base['domain'] = await rl.inputData('Domain', `http://localhost:${config.base['port']}`);
    config.base['preview_url'] = await rl.inputData('Preview Domain', `http://preview.local:${config.base['port']}`);
    config.base['preview_domain'] = new URL(config.base['preview_url']).hostname;

    config.base['name'] = await rl.inputData('Website Name', config.base['name']);
    config.base['glot'] = await rl.inputData('Glot Token', config.base['glot']);
    config.base['cnzz'] = await rl.inputData('CNZZ Site Id', config.base['cnzz']);
    
    config.file['maxSize'] = await rl.inputData('Max Size File Upload(MB)', config.file['maxSize']);
    
    console.info('Config Database:');

    config.db['port'] = parseInt(await rl.inputData('Database Port', config.db['port']));
    config.db['database'] = await rl.inputData('Database Name', config.db['database']);
    config.db['prefix'] = await rl.inputData('Table Prefix', config.db['prefix']);
    config.db['logging'] = await rl.inputData('Log SQL Execute', config.db['logging'] ? 'Y' : 'N') == 'Y';

    let dbConfig = Object.assign({}, config.db);
    dbConfig['host'] = await rl.inputData('Database Host', 'localhost');
    dbConfig['user'] = await rl.inputData('Database User', 'root');
    dbConfig['password'] = await rl.inputData('Database Password', '');

    console.info('Config Email:');
    config.email['host'] = await rl.inputData('Email Server Host', config.email['host']);
    config.email['port'] = parseInt(await rl.inputData('Email Server Port', config.email['port']));
    config.email.auth['account'] = await rl.inputData('Mail Account', config.email.auth['account']);
    config.email.auth['pass'] = await rl.inputData('Acount Password', config.email.auth['pass']);

    fs.writeFile(path.join(__dirname, '../config.json'),
        JSON.stringify(config, null, 4),
        (err) => {
            if (err) console.error(`[Error] Save website config failed: ${err.message}`);
            else {
                // Save DB Config
                fs.writeFile(path.join(__dirname, '../model/config.json'),
                JSON.stringify(dbConfig, null, 4),
                (err) => {
                    if (err) console.error(`[Error] Save db config failed: ${err.message}`);
                    else initDB();
                });        
            }
        });
    rl.close();

    fs.mkdir(path.join(__dirname, '..', 'public', 'dist'))
}

function initDB () {
    (async () => {
        const model = require('../model');
        try {
            await model.sync();
            console.info('[Success] Init all model finish.');
            console.info('[Info] Please execute \'npm run build\' to build frontend, and then execute \'npm start\' to start the website.');
        } catch (err) {
            console.error(`[Error] Init database model failed: ${err.message}`);                
        }
        process.exit();
    })();
}

main();