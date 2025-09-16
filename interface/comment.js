const crypto = require('crypto');
const model = require('../model');
const App = require('./app');
const Account = require('./account');
const Activity = require('./activity');
const Comment = model.comment;
const Snippet = model.snippet;

let __error__ = Object.assign({
    notexisted: App.error.existed('评论', false)
}, App.error);

class Module extends App {
    constructor(session) {
        super([ ]);
        this.session = session;
        this.name = '评论';
        this.account = new Account(session);
        this.activity = new Activity(session);
        this.saftKey = ['id', 'create_time', 'update_time'].concat(Comment.keys());
    }

    get error() {
        return __error__;
    }
    
    async new(data) {
        try {
            data.username = this.account.user.username;

            let comment = App.filter(await super.new(data, Comment), this.saftKey);
            let targetUser = '';
            if (data.reply) {
                let replyComment = await Comment.findOne({
                    where: { id: data.reply }
                });
                if (replyComment) {
                    targetUser = replyComment.username;
                }
            } else {
                let snippet = await Snippet.findOne({
                    where: { id: data.snippet }
                });
                if (snippet) {
                    targetUser = snippet.username;
                }
            }
            this.activity.comment(comment, this.account.user.username, targetUser);
            return this.okcreate(comment);
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async set(data) {
        try {
            // can't update field
            data.username = undefined;
            data.snippet = undefined;
            data.reply = undefined;
            data.floor = undefined;

            let comment = App.filter(await super.set(data, Comment, (d) => {
                if (d.username != this.account.user.username) {
                    throw this.error.unauthorized;
                }
                return true;
            }), this.saftKey);
            
            return this.okupdate(comment);
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async del(data) {
        try {
            data.username = this.account.user.username;
            let comment = await Comment.destroy({
                where: data
            });
            this.activity.removeComment(data, this.account.user.username);
            return this.okdelete(comment ? comment.id : null);
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async get(snippet, onlyData = false) {
        try {
            let comments = await Comment.findAll({
                where: { 
                    snippet
                },
            });

            if (!comments) {
                throw this.error.notexisted;
            }

            comments = comments.map(d => App.filter(d, this.saftKey));
            if(onlyData) return comments

            return this.okquery(comments);
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
                data, Comment, ops
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
                data, Comment, ops, 'snippet'
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