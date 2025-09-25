const model = require('../model');
const App = require('./app');
const Account = require('./account');
const Code = require('./code');
const Fav = require('./fav');
const Comment = require('./comment');
const Activity = require('./activity');
const Glot = require('./glot');
const { off } = require('../app');
const Snippet = model.snippet;
const History = model.history;
const Change = model.change;

let __error__ = Object.assign({
    notexisted: App.error.existed('Snippet', false)
}, App.error);

class Module extends App {
    constructor(session) {
        super([
            { fun: App.ok, name: 'okrun', msg: '执行成功' },
        ]);
        this.session = session;
        this.name = 'Snippet';
        this.account = new Account(session);
        this.code = new Code(session);
        this.fav = new Fav(session);
        this.comment = new Comment(session);
        this.activity = new Activity(session);
        this.saftKey = ['id', 'create_time', 'update_time'].concat(Snippet.keys());
    }

    get error() {
        return __error__;
    }
    
    async new(data, onlyData=false) {
        try {
            data.username = this.account.user.username;
            if (!App.haskeys(data, ['codes'])) throw this.error.param;

            let snippet = App.filter(await super.new(data, Snippet), this.saftKey);
            data.codes.forEach(c => {
                c.snippet = snippet.id
                c.filename = c.filename.trim();
                c.content = c.content.replace(/\t/g, '    ');
            });
            snippet.codes = (await this.code.create(data.codes))
                .map(d => App.filter(d, this.code.saftKey.filter(k => k != 'snippet')));
            if (onlyData) return snippet;
            this.activity.create(snippet, this.account.user.username); 
            return this.okcreate(snippet);
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async set(data) {
        try {
            // can't update field
            data.username = undefined;
            data.fork_from = undefined;
            data.private = undefined;

            if (!App.haskeys(data, ['codes'])) throw this.error.param;

            let snippet = App.filter(await super.set(data, Snippet, (d) => {
                if (d.username != this.account.user.username) {
                    throw this.error.unauthorized;
                }
                return true;
            }), this.saftKey);

            const change = await super.new({
                snippet: data.id,
                ...data,
            }, Change);

            data.codes.forEach(c => {
                c.snippet = data.id;
                c.filename = c.filename.trim();
                c.content = c.content.replace(/\t/g, '    ');
            });

            // Filter out all code ids that do not belong to this snippet.
            let codes_id = (await this.code.get(data.id)).map(c => c.id);
            let createCodes = data.codes.filter(c => !c.id);
            data.codes = data.codes.filter(c => codes_id.indexOf(c.id) >= 0);

            let removeCodes = data.codes.filter(c => c.remove);
            data.codes = data.codes.filter(c => !c.remove);
            
            const history = [];
            history.push(...await this.code.remove(removeCodes, change.id));
            history.push(...await this.code.create(createCodes, change.id));
            history.push(...await this.code.update(data.codes, change.id));
            await History.bulkCreate(history);

            snippet.codes = (await this.code.get(data.id))
                .map(d => App.filter(d, this.code.saftKey.filter(k => k != 'snippet')));
            
            return this.okupdate(snippet);
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async del(data) {
        try {
            let info = await super.del(data, Snippet, (d) => {
                if (d.username != this.account.user.username) {
                    throw this.error.unauthorized;
                }
                return true;
            });
            await this.activity.removeSnippet(data);
            await this.code.del(data.id);
            await this.fav.remove(data.id, true);
            await this.comment.remove(data.id, true);
            await Change.destroy({
                where: {
                    snippet: data.id
                }
            });
            return this.okdelete(info.id);
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async fork(data) {
        try {
            if (!App.haskeys(data, ['id'])) throw this.error.param;

            let snippet = await this.get(data.id, true);

            if (snippet.private && (!this.account.islogin || snippet.username != this.account.user.username)) {
                throw this.error.limited;
            }
    
            snippet.fork_from = snippet.id;
            delete snippet.id;
            snippet = await this.new(snippet, true);
            this.activity.fork(snippet, this.account.user.username);
            return this.okcreate(snippet);
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async get(id, onlyData = false) {
        let info = await Snippet.findOne({
            where: { id }
        });

        if (!info) {
            throw this.error.notexisted;
        }

        if (info.private && (!this.account.islogin || info.username != this.account.user.username)) {
            throw this.error.limited;
        }

        info.codes = await this.code.get(id);
        info.stared = this.account.islogin && (await this.fav.query({
            query: { username: this.account.user.username, snippet: [info.id] },
            index: 0, count: 1
        }, true)).total > 0;

        if (info.fork_from) {
            info.fork = await this.get(info.fork_from, true);
        }

        let extendKeys = ['codes', 'stared', 'fork'];
        if (onlyData) return App.filter(info, this.saftKey.concat(extendKeys));

        return this.okquery(App.filter(info, this.saftKey.concat(extendKeys)));
    }

    async changes(data, onlyData = false) {
        if (!App.haskeys(data, ['id'])) throw this.error.param;
        const { index = 0, count = 20 } = data;
        try {
            let changes = await Change.findAll({
                where: { snippet: data.id },
                order: [['create_time', 'DESC']],
                offset: Number(index),
                limit: Number(count) + 1
            });

            changes = changes.map(d => App.filter(d, Change.keys().concat(['id'])));
            const historys = await History.findAll({
                where: { change_id: changes.map(c => c.id) },
                order: [['modify_date', 'DESC']]
            });
            changes.forEach(c => {
                c.historys = historys.filter(h => h.change_id == c.id)
                    .map(h => App.filter(h, History.keys().concat(['id'])));
            });
            if (onlyData) return changes;

            return this.okquery(changes);
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }
    
    async query(data, onlyData = false) {
        // $ = like
        let ops = {
            id: App.ops.in,
            fork_from: App.ops.in,
            title: App.ops.like,
            description: App.ops.like,
            username: App.ops.equal,
            private: App.ops.equal,
            create_time: App.ops.less
        };

        if (this.account.islogin && data.query.username == this.account.user.username) {
            data.query.private = undefined;
        } else {
            data.query.private = false;
        }

        try {
            let queryData = await super.query(
                data, Snippet, ops
            );

            data.fields = data.fields || ['codes', 'stars', 'fork', 'forks', 'comments'].concat(this.saftKey)
            var ids = queryData.data.map(b => b.id);
            if (data.fields.indexOf('codes') >= 0) {
                let codes = await this.code.getAll(ids, true);
                codes.sort((a,b) => a.order - b.order);
                queryData.data.forEach(d => {
                    d.codes = codes.filter(c => c.snippet == d.id);
                });
            }

            if (data.fields.indexOf('stars') >= 0) {
                let stars = await this.fav.getAll(ids, true);
                queryData.data.forEach(d => {
                    let star = stars.filter(s => s.snippet == d.id)
                    d.stars = star.length;
                    d.stared = this.account.islogin && d.stars > 0 && star.find(s => s.username == this.account.user.username) != undefined;
                });
            }

            if (data.fields.indexOf('comments') >= 0) {
                let comments = await this.comment.count({snippet: ids}, true);
                queryData.data.forEach(d => {
                    let comment = comments.find(c => c.snippet == d.id)
                    d.comments = comment ? comment.count : 0;
                });
            }

            var fork_ids = queryData.data.map(b => b.fork_from);
            fork_ids = fork_ids.filter(d => d !== '');
            if (data.fields.indexOf('fork_from') >= 0) {
                let snippets = await this.query({
                    query: { id: fork_ids }, index: 0, count: -1, fields: ['id', 'codes', 'username']
                }, true);

                queryData.data.forEach(d => {
                    if (d.fork_from == '') return;
                    d.fork = snippets.data.find(s => s.id == d.fork_from);
                });
            }

            if (data.fields.indexOf('forks') >= 0) {
                let forks = await super.count({ fork_from: ids }, Snippet, ops, 'fork_from');
                queryData.data.forEach(d => {
                    let f = forks.find(f => f.dataValues.fork_from == d.id);
                    d.forks = f ? f.dataValues.count : 0;
                });
            }

            if (onlyData) return queryData;
            return this.okquery(queryData);
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async execute(data) {
        const keys = ['language', 'codes', 'command'];

        if (!App.haskeys(data, keys)) {
            throw (this.error.param);
        }

        let result = await Glot.compiler(data.language, data.codes, data.input || '', data.command);

        return this.okrun(result);
    }
}

module.exports = Module;