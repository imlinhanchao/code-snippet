const crypto = require('crypto');
const model = require('../model');
const App = require('./app');
const Account = require('./account');
const Code = model.code;

let __error__ = Object.assign({
    notexisted: App.error.existed('代码', false)
}, App.error);

class Module extends App {
    constructor(session) {
        super([ ]);
        this.session = session;
        this.name = '代码';
        this.account = new Account(session);
        this.saftKey = ['id', 'create_time', 'update_time'].concat(Code.keys());
    }

    get error() {
        return __error__;
    }
    
    async create(codes) {
        try {
            if (codes.length <= 0) return [];
            return await Code.bulkCreate(codes);
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async update(codes) {
        try {
            if (codes.length <= 0) return [];
            let ids = codes.map(c => c.id);

            let data = await Code.findAll({
                where: {
                    id: {
                        [Code.db.Op.in]: ids
                    }
                }
            });
           
            let keys = ['filename', 'content', 'command'];
            for (let i = 0; i < data.length; i++) {
                let newData = codes.find(c => c.id == data[i].id);
                if (!newData) continue;
                if (App.isSame(data, newData, keys)) continue;
                keys.forEach(k => data[i][k] = newData[k]);
                await data[i].save();
            }
            return data;
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async del(snippet) {
        try {
            let code = await Code.destroy({
                where: {
                    snippet
                }
            });
            return code;
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async remove(ids) {
        try {
            if (ids.length <= 0) return [];
            let code = await Code.destroy({
                where: {
                    id: {
                        [Code.db.Op.in]: ids
                    }
                }
            });
            return code;
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async get(snippet) {
        let codes = await Code.findAll({
            where: { snippet },
            order: [['create_time', 'ASC']]
        });

        if (!codes) {
            throw this.error.notexisted;
        }

        return codes.map(d => App.filter(d, this.saftKey));
    }

    async getAll(snippets) {
        let codes = await Code.findAll({
            where: {
                snippet: {
                    [Code.db.Op.in]: snippets
                }
            }
        });

        if (!codes) {
            throw this.error.notexisted;
        }

        codes = codes.map(d => App.filter(d, this.saftKey));

        return App.filter(codes, this.saftKey);
    }
    
    async query(data) {
        // $ = like
        let ops = {
            filename: App.ops.like,
            content: App.ops.like,
            snippet: App.ops.equal,
            create_time: App.ops.less
        };

        try {
            let queryData = await super.query(
                data, Code, ops
            );

            if (onlyData) return queryData;
            return queryData;
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }
}

module.exports = Module;