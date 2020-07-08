const crypto = require('crypto');
const model = require('../model');
const App = require('./app');
const Account = require('./account');
const Code = require('./code');
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
        this.saftKey = ['id'].concat(Snippet.keys());
    }

    get error() {
        return __error__;
    }
    
    async new(data) {
        try {
            data.username = this.account.user.username;
            if (!App.haskeys(['codes'])) throw this.error.param;

            let snippet = App.filter(await super.new(data, Snippet), this.saftKey);
            data.codes.forEach(c => c.snippet = snippet.id);
            snippet.codes = (await this.code.create(data.codes))
                .map(d => App.filter(d, this.code.saftKey.filter(k => k != 'snippet')));
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

            if (!App.haskeys(['codes'])) throw this.error.param;

            let snippet = App.filter(await super.set(data, Snippet, (d) => {
                if (d.username != this.account.user.username) {
                    throw this.error.unauthorized;
                }
                return true;
            }), this.saftKey);

            // Filter out all code ids that do not belong to this snippet.
            let codes_id = (await this.code.get(data.id)).map(c => c.id);
            data.codes = data.codes.filter(c => codes_id.indexOf(c.id) >= 0);

            let removeCodes = data.codes.filter(c => c.remove).map(c => c.id);
            data.codes = data.codes.filter(c => !c.remove).forEach(c => c.snippet = data.id);

            await this.code.remove(removeCodes);
            snippet.codes = (await this.code.update(data.codes))
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

    async get(id, onlyData = false) {
        let info = await Snippet.findOne({
            where: { id }
        });

        if (!info) {
            throw this.error.notexisted;
        }

        info.codes = this.code.get(id);

        if (onlyData) return App.filter(info, this.saftKey.concat(['codes']));

        return this.okquery(App.filter(info, this.saftKey.concat(['codes'])));
    }
    
    async query(data, onlyData = false) {
        // $ = like
        let ops = {
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

            if (data.fields.indexOf('codes') >= 0) {
                var ids = queryData.data.map(b => b.id);
                let codes = await this.code.getAll(ids, true);
                queryData.data.forEach(d => d.codes =
                    codes.find(c => c.snippet == d.id));
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