const model = require('../model');
const App = require('./app');
const Account = require('./account');
const Code = model.code;
const History = model.history;

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
    
    async create(codes, changeId) {
        try {
            if (codes.length <= 0) return [];
            codes.forEach(c => c.id = undefined);
            codes = await Code.bulkCreate(codes);
            if (changeId) {
                return codes.map(c => ({
                    file_id: c.id,
                    change_id: changeId,
                    snippet: c.snippet,
                    pre_filename: c.filename,
                    filename: c.filename,
                    pre_content: '',
                    content: c.content,
                    modify_date: Math.floor(Date.now() / 1000)
                }));
            }
            return [];
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async update(codes, changeId) {
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
           
            let keys = ['filename', 'content', 'order', 'input', 'command', 'execute'];
            const historys = [];
            for (let i = 0; i < data.length; i++) {
                let newData = codes.find(c => c.id == data[i].id);
                if (!newData) continue;
                if (App.isSame(data[i].dataValues, newData, keys)) continue;
                const history = {
                    file_id: data[i].id,
                    change_id: changeId,
                    snippet: data[i].snippet,
                    pre_filename: data[i].filename,
                    filename: newData.filename,
                    pre_content: data[i].content,
                    content: newData.content,
                    modify_date: Math.floor(Date.now() / 1000)
                };
                keys.forEach(k => data[i][k] = newData[k]);
                await data[i].save();
                historys.push(history);
            }
            return historys;
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
            await History.destroy({
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

    async remove(codes, changeId) {
        try {
            if (codes.length <= 0) return [];
            let code = await Code.destroy({
                where: {
                    id: {
                        [Code.db.Op.in]: codes.map(c => c.id)
                    }
                }
            });
            return codes.map(c => ({
                file_id: c.id,
                change_id: changeId,
                snippet: c.snippet,
                filename: c.filename,
                pre_content: c.content,
                content: '',
                modify_date: Math.floor(Date.now() / 1000)
            }));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async get(snippet) {
        try {
            let codes = await Code.findAll({
                where: { snippet },
                order: [['order', 'ASC']]
            });

            if (!codes) {
                throw this.error.notexisted;
            }

            return codes.map(d => App.filter(d, this.saftKey));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async getAll(snippets) {
        try {
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

            return codes.map(d => App.filter(d, this.saftKey));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }
    
    async query(data, onlyData = false) {
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
            queryData.data = queryData.data.map(q => App.filter(q, this.saftKey))
            return this.okquery(queryData);
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }
}

module.exports = Module;