const model = require('../model');
const App = require('./app');
const Account = require('./account');
const Activity = require('./activity');
const Fav = model.fav;
const Snippet = model.snippet;

let __error__ = Object.assign({
    existed: App.error.existed('已收藏过', true, true)
}, App.error);

class Module extends App {
    constructor(session) {
        super([ ]);
        this.session = session;
        this.name = '收藏';
        this.account = new Account(session);
        this.activity = new Activity(session);
        this.saftKey = ['create_time', 'update_time'].concat(Fav.keys());
    }

    get error() {
        return __error__;
    }
    
    async new(data) {
        try {
            data.username = this.account.user.username;

            if (!App.haskeys(data, ['snippet'])) throw this.error.param;
            let snippet = await Snippet.findOne({
                where: { id: data.snippet }
            });
            if (!snippet) throw this.error.notexisted;

            let fav = App.filter(await super.new(data, Fav, ['username', 'snippet']), this.saftKey);

            this.activity.star(snippet, this.account.user.username);
            return this.okcreate(fav);
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async del(data) {
        try {
            data.username = this.account.user.username;
            let fav = await Fav.destroy({
                where: data
            });
            return this.okdelete(fav.id);
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async get(snippet, onlyData = false) {
        try {
            let favs = await Fav.findAll({
                where: { 
                    snippet
                },
            });

            if (!favs) {
                throw this.error.notexisted;
            }

            favs = favs.map(d => App.filter(d, this.saftKey));
            if(onlyData) return favs

            return this.okquery(favs);
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async getAll(snippets) {
        try {
            let favs = await Fav.findAll({
                where: {
                    snippet: {
                        [Fav.db.Op.in]: snippets
                    }
                }
            });

            if (!favs) {
                throw this.error.notexisted;
            }

            return favs.map(d => App.filter(d, this.saftKey));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async query(data, onlyData = false) {
        // $ = like
        let ops = {
            username: App.ops.equal,
            snippet: App.ops.in,
            create_time: App.ops.less
        };

        try {
            let queryData = await super.query(
                data, Fav, ops
            );

            if (onlyData) return queryData;
            queryData.data = queryData.data.map(q => App.filter(q, this.saftKey))
            return this.okquery(queryData);
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async count(data, onlyData = false) {
        // $ = like
        let ops = {
            username: App.ops.equal,
            snippet: App.ops.in,
            create_time: App.ops.less
        };

        try {
            let total = await super.count(
                data, Fav, ops, 'snippet'
            );

            total = total.map(t => ({ count: t.dataValues.count, snippet: t.snippet }));
        
            if (onlyData) return total;
            return this.okquery(total);
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }
}

module.exports = Module;