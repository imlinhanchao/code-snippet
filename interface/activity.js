const model = require('../model');
const App = require('./app');
const Account = require('./account');
const Activity = model.activity;

let __error__ = Object.assign({
}, App.error);

class Module extends App {
    constructor(session) {
        super([ ]);
        this.session = session;
        this.name = '活动';
        this.account = new Account(session);
        this.saftKey = ['id', 'create_time', 'update_time'].concat(Code.keys());
    }

    get error() {
        return __error__;
    }
    
    async create(data, user) {
        if (!App.haskeys(data, ['id', 'private'])) throw this.error.param;
        Activity.create({
            username: user,
            type: 0,
            private: data.private || false,
            snippet: data.id,
            source: data.id,
            description: data.title || `${data.username}/${data.codes[0].filename}`,
            notice: ''
        })
    }

    async star(data, user) {
        if (!App.haskeys(data, ['id'])) throw this.error.param;
        Activity.create({
            username: user,
            type: 1,
            private: false,
            snippet: data.id,
            source: data.id,
            description: data.title || `${data.username}/${data.codes[0].filename}`,
            notice: ''
        })
    }

    async unstar(data, user) {
        if (!App.haskeys(data, ['id'])) throw this.error.param;
        Activity.destroy({
            where: {
                username: user,
                type: 1,
                snippet: data.id
            }
        });
    }

    fork(data, user) {
        if (!App.haskeys(data, ['id', 'fork_from'])) throw this.error.param;
        Activity.create({
            username: user,
            type: 2,
            private: false,
            snippet: data.id,
            source: data.id,
            target: data.fork_from,
            description: data.title || `${data.username}/${data.codes[0].filename}`,
            notice: ''
        })
    }

    removeSnippet(data) {
        if (!App.haskeys(data, ['id'])) throw this.error.param;
        Activity.destroy({
            where: {
                type: {[Activity.db.Op.in]: [0, 1, 2] },
                snippet: data.id
            }
        });
    }

    comment(data, user, notice) {
        if (!App.haskeys(data, ['snippet', 'reply'])) throw this.error.param;
        Activity.create({
            username: user,
            type: data.reply ? 3 : 4,
            private: false,
            snippet: data.snippet,
            source: data.id,
            target: data.reply,
            notice: notice || '',
            description: `${user} ${data.reply ? '回复了你的评论' : '评论了你的片段'}`
        })
    }

    removeComment(data, user) {
        if (!App.haskeys(data, ['id'])) throw this.error.param;
        Activity.destroy({
            where: {
                username: user,
                type: { [Activity.db.Op.in]: [3, 4] },
                source: data.id
            }
        });
    }

    follow(data, user) {
        if (!App.haskeys(data, ['target'])) throw this.error.param;
        Activity.create({
            username: user,
            type: 5,
            private: false,
            snippet: '',
            source: data.target,
            notice: data.target,
            description: `${user} 关注了 ${data.target}`
        })
    }

    unfollow(data, user) {
        if (!App.haskeys(data, ['target'])) throw this.error.param;
        Activity.destroy({
            where: {
                username: user,
                type: 5,
                notice: data.target
            }
        });
    }

    async list(data) {
        const { lastTime = Date.now() / 1000, limit = 20, follows } = data;
        let where = {};
        if (lastTime) {
            where.create_time = {
                [Activity.db.Op.lt]: lastTime
            }
        }
        where.private = false;
        where[Activity.db.Op.or] = [
            { username: { [Activity.db.Op.in]: follows } },
            { notice: this.account.user.username }
        ];
        return this.okget(await Activity.findAll({
            where,
            order: [['create_time', 'DESC']],
            limit
        }).then(d => d.map(v => App.filter(v, this.saftKey))));
    }
}

module.exports = Module;