const model = require('../model');
const App = require('./app');
const Activity = model.activity;
const Code = model.code;
const Snippet = model.snippet;
const Account = model.account;

let __error__ = Object.assign({
}, App.error);

class Module extends App {
    constructor(session) {
        super([
            { fun: App.ok, name: 'okget', msg: '获取成功' },
        ]);
        this.session = session;
        this.name = '活动';
        this.saftKey = ['id', 'create_time', 'update_time'].concat(Activity.keys());
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
            source: JSON.stringify(data),
            description: data.codes[0].filename,
            notice: '',
            create_time: data.create_time
        })
    }

    async star(data, user) {
        if (!App.haskeys(data, ['id'])) throw this.error.param;
        let name = data.codes?.[0]?.filename
        let notice = '';
        if (!name) {
            let code = await Code.findOne({
                where: { snippet: data.id },
                order: [['order', 'ASC']]
            });
            if (code) name = code.filename;
            let snippet = await Snippet.findOne({
                where: { id: data.id },
            })
            if (snippet) notice = snippet.username;
        }
        Activity.create({
            username: user,
            type: 1,
            private: false,
            snippet: data.id,
            source: JSON.stringify(data),
            target: data.username,
            description: name,
            notice: notice,
            create_time: data.create_time
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
            source: JSON.stringify(data),
            target: data.username,
            description: data.codes[0].filename,
            notice: '',
            create_time: data.create_time
        })
    }

    removeSnippet(data) {
        if (!App.haskeys(data, ['id'])) throw this.error.param;
        Activity.destroy({
            where: {
                type: { [Activity.db.Op.in]: [0, 1, 2] },
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
            source: JSON.stringify(data),
            target: data.reply,
            notice: notice || '',
            description: data.reply ? 'reply_comment' : 'comment_snippet',
            create_time: data.create_time
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

    async follow(data, user) {
        if (!App.haskeys(data, ['target'])) throw this.error.param;
        const account = await Account.findOne({ where: { username: data.target } });
        delete account.passwd;
        Activity.create({
            username: user,
            type: 5,
            private: false,
            snippet: '',
            source: JSON.stringify(account),
            notice: data.target,
            description: data.target,
            create_time: data.create_time
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

    async readed(data, user) {
        data = App.filter(data, ['id']);
        await Activity.update({
            readed: true
        }, {
            where: {
                ...data,
                notice: user,
                readed: false,
                type: { [Activity.db.Op.in]: [3, 4] }
            }
        });
        return this.okget(true);
    }

    async list(data, username) {
        const { lastTime = Date.now() / 1000, count = 20, follows, type } = data;
        let where = {};
        if (type) {
            let types = type.split(',').map(t => Number(t));
            if (types.length == 1) {
                where.type = types[0];
            } else {
                where.type = { [Activity.db.Op.in]: types };
            }
        }
        if (lastTime) {
            where.create_time = {
                [Activity.db.Op.lt]: lastTime
            }
        }
        where.private = false;
        where[Activity.db.Op.or] = [
            { username: { [Activity.db.Op.in]: follows } },
            { notice: username }
        ];
        return this.okget(await Activity.findAll({
            where,
            order: [['create_time', 'DESC']],
            limit: count
        }).then(d => d.map(v => {
            v.source = v.source ? JSON.parse(v.source) : null;
            return App.filter(v, this.saftKey)
        })));
    }
}

module.exports = Module;