const crypto = require('crypto');
const model = require('../model');
const App = require('./app');
const Account = require('./account');
const Code = require('./code');
const Fav = require('./fav');
const Snippet = model.snippet;

let __error__ = Object.assign({
    notexisted: App.error.existed('Snippet', false)
}, App.error);

class Module extends App {
    constructor(session) {
        super([ ]);
        this.session = session;
        this.name = 'Snippet';
        this.account = new Account(session);
        this.code = new Code(session);
        this.fav = new Fav(session);
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
            data.codes.forEach(c => c.snippet = snippet.id);
            snippet.codes = (await this.code.create(data.codes))
                .map(d => App.filter(d, this.code.saftKey.filter(k => k != 'snippet')));
            if (onlyData) return snippet;
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

            // Filter out all code ids that do not belong to this snippet.
            let codes_id = (await this.code.get(data.id)).map(c => c.id);
            let createCodes = data.codes.filter(c => !c.id);

            data.codes = data.codes.filter(c => codes_id.indexOf(c.id) >= 0);

            let removeCodes = data.codes.filter(c => c.remove).map(c => c.id);
            data.codes = data.codes.filter(c => !c.remove);
            data.codes.forEach(c => c.snippet = data.id);
            createCodes.forEach(c => c.snippet = data.id);

            await this.code.remove(removeCodes);
            await this.code.create(createCodes);
            await this.code.update(data.codes);
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
            await this.code.del(data.id);
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

            return await this.new(snippet);
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
        info.stars = await this.fav.get(id, true);
        info.stared = this.account.islogin && info.stars.find(s => s.username == this.account.user.username) != undefined;

        if (info.fork_from) {
            info.fork = await this.get(info.fork_from, true);
        }

        let forks = await super.count({ fork_from: [info.id] }, Snippet, {
            fork_from: App.ops.in,
        }, 'fork_from');
        info.forks = forks.length > 0 ? forks[0].dataValues.count : 0;

        let extendKeys = ['codes', 'stars', 'stared', 'fork', 'forks'];
        if (onlyData) return App.filter(info, this.saftKey.concat(extendKeys));

        return this.okquery(App.filter(info, this.saftKey.concat(extendKeys)));
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

        try {
            let queryData = await super.query(
                data, Snippet, ops
            );

            queryData.data = queryData.data.filter(q => (!q.private 
                || (this.account.islogin && q.username == this.account.user.username)))

            data.fields = data.fields || ['codes', 'stars', 'fork', 'forks'].concat(this.saftKey)
            var ids = queryData.data.map(b => b.id);
            if (data.fields.indexOf('codes') >= 0) {
                let codes = await this.code.getAll(ids, true);
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
}

module.exports = Module;