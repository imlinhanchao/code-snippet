const path = require('path');
const fs = require('fs');
const App = require('./app');
const files = require('../lib/files');

const filecfg = require('../config').file;

let __error__ = Object.assign({}, App.error);
__error__.toobig = App.error.reg('上传文件过大！');

class Module extends App {
    constructor(session) {
        super([
            { fun: App.ok, name: 'okupload', msg: '上传成功' },
        ]);
        this.session = session;
    }

    get error() {
        return __error__;
    }
    
    async upload(req) {
        try {
            let dirpath = path.join(process.cwd(), filecfg.upload);
            files.mkdir(dirpath);
            let filenames = [];
            for (let i = 0; i < req.files.length; i++) {
                if (req.files[i].size > filecfg.maxSize * 1024 * 1024) {
                    throw(this.error.toobig);
                }
                let data = req.files[i].buffer;
                let hash = files.hash(data);
                let filename = hash + path.extname(req.files[i].originalname);
                let savepath = path.join(dirpath, filename);
                if (!files.exists(savepath))
                    fs.writeFileSync(savepath, data);
                filenames.push(filename);
            }
            return this.okupload(filenames);
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = Module;