const crypto = require('crypto');
const model = require('../model');
const App = require('./app');
const Account = require('./account');
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
        this.saftKey = ['id'].concat(Snippet.keys());
    }

    get error() {
        return __error__;
    }
    
    async new(data) {
        try {
            data.username = this.account.user.username;
            return this.okcreate(
                App.filter(await super.new(data, Snippet), this.saftKey)
            );
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
            return this.okupdate(
                App.filter(await super.set(data, Snippet, (d) => {
                    if (d.username != this.account.user.username) {
                        throw this.error.unauthorized;
                    }
                    return true;
                }), this.saftKey));
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

        if (onlyData) return App.filter(info, this.saftKey);

        return this.okquery(App.filter(info, this.saftKey));
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

            if (onlyData) return queryData;
            return this.okquery(queryData);
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }
}

module.exports = Module;