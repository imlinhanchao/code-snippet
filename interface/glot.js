const axios = require('axios')
const model = require('../model');
const App = require('./app');
const Languages = require('../langs.json');

const domain = 'https://run.glot.io';
const token = require('../config').base.glot;

// 错误码定义
let __error__ = Object.assign({}, App.error);
let __langs__ = {};
Languages.forEach(l => __langs__[l.language] = l.glot);
class GlotApp extends App {
    constructor() {
        super([{
        }]);
        this.langs = {};
    }

    static get error() {
        return __error__;
    }

    static get langs() {
        return __langs__;
    }

    static async compiler(language, files, stdin = '', command = '', version = 'latest') {
        try {
            let url = `${domain}/languages/${GlotApp.langs[language]}/${version}`;
            let rsp = await axios({
                method: 'POST',
                url,
                json: true,
                headers: {
                    'Authorization': `Token ${token}`
                },
                data: {
                    files,
                    stdin,
                    command
                }
            });
            if (rsp.status > 400) {
                throw (this.error.network)
            }
            return rsp.data;
        } catch (error) {
            throw(error);
        }
    }
}

module.exports = GlotApp;