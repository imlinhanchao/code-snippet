const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { toPersistedConfig } = require('../config');

async function main() {
    if (!fs.existsSync(path.join(__dirname, '../config.json'))) {
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

        let config = Object.assign({
            host: '',
            user: '',
            password: ''
        }, require('../config').db);

        config.host = await rl.inputData('Host', 'localhost');
        config.user = await rl.inputData('User', 'root');
        config.password = await rl.inputData('Password', '');

        const current = require('../config');
        current.db = config;
        fs.writeFile(path.join(__dirname, '../config.json'),
            JSON.stringify(toPersistedConfig(current), null, 4), (err) => {
                if (err) console.error(`[Error] create db config failed: ${err.message}`);
                else initDB();
            });
        rl.close();
    } else {
        initDB();
    }
}

function initDB () {
    (async () => {
        const model = require('../model');
        if (process.argv.length > 2) {
            let table = process.argv[2];
            if (model[table]) {
                await model[table].sync({ force: true });
                console.info(`[Success] Init model ${table} finish.`);
            }
            else {
                console.error(`[Error] Model ${table} not found!`);
            }
        } else {
            try {
                await model.sync();
                console.info('[Success] Init all model finish.');
            } catch (err) {
                console.error(`[Error] Init database model failed: ${err.message}`);                
            }
        }
        process.exit();
    })();
}

main();