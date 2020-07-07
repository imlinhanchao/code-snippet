const fs = require('fs');
const axios = require('axios')
const path = require('path');
const filecfg = require(process.cwd() + '/config').file;
const crypto = require('crypto');

module.exports = {
    async download(url, filename) {
        var filepath = path.join(process.cwd(), filecfg.upload, filename);
        this.mkdir(path.dirname(filepath));

        const writer = fs.createWriteStream(filepath);

        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        })

        response.data.pipe(writer)

        return new Promise((resolve, reject) => {
            let buffer = new Buffer([]);
            response.data.on('data', (chunk) => {
                buffer = Buffer.concat([buffer, chunk]);
            })
            writer.on('finish', () => {
                console.log()
                resolve({
                    url: filename,
                    path: filepath,
                    hash: this.hash(buffer)
                })
            })
            writer.on('error', reject)
        });
    },

    exists(directory) {
        return fs.existsSync(directory);
    },

    mkdir(directory) {
        if (this.exists(directory)) return;
        fs.mkdirSync(directory);
    },

    del(file) {
        fs.unlink(file);
    },

    rename(oldpath, newpath) {
        try {
            fs.renameSync(oldpath, newpath);
        } catch (error) {
            console.error(error);
        }
    },

    hash(buff) {
        let sha256 = crypto.createHash('sha256');
        let hash = sha256.update(buff).digest('hex');
        return hash;
    }
};