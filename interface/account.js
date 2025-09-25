const Op = require('../model/db').Op;
const nodemailer = require("nodemailer");
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const model = require('../model');
const App = require('./app');
const Activity = require('./activity');
const Account = model.account;
const Token = model.token;
const config = require('../config.json');

const __salt = config.salt;
const __tpl = {
    verify: {
        data: '',
        path: path.join(__dirname, '..', 'frontend', 'assets', 'verify_mail.html')
    },
    forget: {
        data: '',
        path: ''
    }
};

let __error__ = Object.assign({
	verify: App.error.reg('帐号或密码错误！'),
	captcha: App.error.reg('验证码错误！'),
	existed: App.error.existed('帐号'),
	existedmail: App.error.existed('邮箱'),
	existedphone: App.error.existed('电话'),
	notexisted: App.error.existed('帐号', false),
	notverify: App.error.existed('验证已失效', false, true),
	usertooshort: App.error.reg('用户名太短！'),
	passtooshort: App.error.reg('密码太短！'),
}, App.error);

class Module extends App {
    constructor(session) {
        super([
            { fun: App.ok, name: 'oklogin', msg: '登录成功' },
            { fun: App.ok, name: 'oklogout', msg: '登出成功' },
            { fun: App.ok, name: 'okget', msg: '获取成功' },
            { fun: App.ok, name: 'oksend', msg: '发送成功' },
            { fun: App.ok, name: 'okverify', msg: '验证成功' },
            { fun: App.ok, name: 'okfollow', msg: '关注成功' },
        ]);
        this.session = session;
        this.activity = new Activity(session);
        this.name = '用户';
        this.saftKey = ['id'].concat(Account.keys().filter(k => ['passwd'].indexOf(k) < 0));
    }

    get error() {
        return __error__;
    }

    static get cache() {
        return {
            avatar: 86900
        }
    }
    
    async login(data) {
        const keys = ['username', 'passwd'];

        if (!App.haskeys(data, keys)) {
            throw (this.error.param);
        }

        if (data.username.length < 5) {
            throw this.error.usertooshort;
        }

        if (data.passwd.length < 5) {
            throw this.error.passtooshort;
        }

        data = App.filter(data, keys);

        try {
            let account = await this.exist(data.username, true);
            if(!account) {
                throw this.error.verify;
            } else {
                let sha256 = crypto.createHash('sha256');
                let passwd = sha256.update(data.passwd + __salt).digest('hex');
                if (account.passwd != passwd) {
                    throw this.error.verify;
                }
            }

            account.lastlogin = new Date().valueOf() / 1000;
            account.save();

            this.session.account_login = account;
            return this.oklogin(App.filter(this.session.account_login, this.saftKey));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.network(err));
        }
    }

    async create(data, onlyData = false) {
        const keys = ['username', 'passwd'];

        if (!App.haskeys(data, keys)) {
            throw (this.error.param);
        }

        data = App.filter(data, Account.keys().concat(['captcha']));
        
        try {
            if (this.session.captcha != data.captcha)
                throw this.error.captcha;
            
            if (data.email) {
                let account = await Account.findOne({
                    where: {
                        email: data.email
                    }
                });
                if (account) {
                    throw this.error.existedmail;
                }
            }  
            
            data.nickname = data.username;
            data.lastlogin = new Date().valueOf() / 1000;
            let sha256 = crypto.createHash('sha256');
            data.passwd = sha256.update(data.passwd + __salt).digest('hex');
            data.email = data.email || '';
            data.motto = data.motto || '';
            data.avatar = data.avatar || '';
            data.company = data.company || '';
            data.location = data.location || '';
            data.url = data.url || '';
            data.verify = false;
            let account = await super.new(data, Account, 'username');
            if (onlyData) return account;
            return this.okcreate(App.filter(account, this.saftKey));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async update(data) {
        const keys = ['username'];

        if (!App.haskeys(data, keys)) {
            throw (this.error.param);
        }

        data = App.filter(data, Account.keys().concat(['id', 'oldpasswd']));

        try {
            let account = await this.info(true, Account.keys());
            if (account.username != data.username) {
                throw this.error.limited;
            }
            // 用户名不可更改
            data.username = undefined;
            if (data.passwd) {
                let sha256 = crypto.createHash('sha256');
                let passwd = sha256.update(data.oldpasswd + __salt).digest('hex');
                if (account.passwd != passwd) {
                    throw this.error.verify;
                }
                sha256 = crypto.createHash('sha256');
                data.passwd = sha256.update(data.passwd + __salt).digest('hex');
            }
      
            // Mail 更新重复检查
            if (data.email && data.email != account.email) {
                let account = await Account.findOne({
                    where: {
                        email: data.email
                    }
                });
                if (account) {
                    throw this.error.existedmail;
                }
                data.verify = false;
                Token.destroy({
                    where: {
                        username: data.username
                    }
                })
            }
        
            return this.okupdate(App.filter(await super.set(data, Account), this.saftKey));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async exist(username, onlyData = false) {
        try {
            let data = await Account.findOne({
                where: {
                    username: username
                }
            });
            if (onlyData) return data;
            return this.okget(!!data);
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async exists(data, onlyData = false) {
        const keys = ['email', 'phone'];

        if (!App.hasone(data, keys)) {
            throw (this.error.param);
        }

        data = App.filter(data, keys);
        try {
            let account = await Account.findOne({
                where: data
            });
            if (onlyData) return account;
            return this.okget(!!account);
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    logout() {
        if (!this.islogin) {
            throw (this.error.nologin);
        }
        this.session.account_login = undefined;
        return this.oklogout();
    }

    get islogin() {
        return this.session && this.session.account_login;
    }

    async info(onlyData = false, fields=null) {
        if (!this.islogin) {
            throw (this.error.nologin);
        }
        fields = fields || this.saftKey;
        let data = await Account.findOne({
            where: {
                username: this.session.account_login.username
            }
        });

        data.lastlogin = new Date().valueOf() / 1000;
        data.save();

        if (onlyData == true) return App.filter(data, fields);
        return this.okget(App.filter(data, fields));
    }

    async avatar(username) {
        let data = await Account.findOne({
            where: {
                username
            },
            attributes: ['avatar']
        });

        let avatar = path.join(process.cwd(), '/public/res/user.png');

        if (data && data.avatar)
            avatar = path.join(process.cwd(), config.file.upload, data.avatar);

        let buffer = fs.readFileSync(avatar);
        return buffer;
    }

    isFollow(usernames) {
        if (!this.islogin) {
            throw (this.error.nologin);
        }
        if (!usernames || !usernames.length) {
            throw (this.error.param);
        }
        return model.follow.findAll({
            where: {
                username: this.session.account_login.username,
                target: usernames
            },
            attributes: ['target']
        }).then(follows => {
            let followmap = {};
            follows.forEach(f => {
                followmap[f.target] = true;
            });
            return followmap;
        });
    }

    async follow(data) {
        const { target, follow = true } = data;

        if (!this.islogin) {
            throw (this.error.nologin);
        }
        if (!target || !target.length) {
            throw (this.error.param);
        }
        if (target == this.session.account_login.username) {
            throw (this.error.reg('不能关注自己！'));
        }
        const isFollow = await model.follow.findOne({
            where: {
                username: this.session.account_login.username,
                target
            }
        });
        if (isFollow && follow) {
            throw (this.error.existed('关注'));
        }
        try {
            if (follow) {
                await super.new({
                    username: this.session.account_login.username,
                    target
                }, model.follow);
                this.activity.follow({ target }, this.session.account_login.username);
            } else {
                await model.follow.destroy({
                    where: {
                        username: this.session.account_login.username,
                        target
                    }
                });
                this.activity.unfollow({ target }, this.session.account_login.username);
            }
            return this.okfollow(follow);
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async following(data={}) {
        const { index = 0, count = 20 } = data;
        if (!this.islogin) {
            throw (this.error.nologin);
        }
        try {
            let follows = await model.follow.findAll({
                where: {
                    username: this.session.account_login.username
                },
                attributes: ['target'],
                offset: index,
                limit: count,
            });
            follows = await model.account.findAll({
                where: {
                    username: {
                        [Op.in]: follows.map(f => f.target)
                    }
                },
                attributes: this.saftKey
            });
            return this.okget(follows.map(f => App.filter(f, this.saftKey)));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async follower(data={}) {
        const { index = 0, count = 20 } = data;
        if (!this.islogin) {
            throw (this.error.nologin);
        }
        try {
            let follows = await model.follow.findAll({
                where: {
                    target: this.session.account_login.username
                },
                attributes: ['username'],
                offset: index,
                limit: count,
            });
            follows = await model.account.findAll({
                where: {
                    username: {
                        [Op.in]: follows.map(f => f.username)
                    }
                },
                attributes: this.saftKey
            });
            return this.okget(follows.map(f => App.filter(f, this.saftKey)));
        } catch (err) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async activities(data={}) {
        const follows = await model.follow.findAll({
            where: {
                username: this.session.account_login.username
            },
            attributes: ['target'],
        }).then((follows) => follows.map(f => f.target));
        return await this.activity.list({ ...data, follows }, this.user.username);
    }

    async makereaded(data) {
        return await this.activity.readed(data, this.user.username);
    }

    async query(query, fields=null, onlyData=false) {
        let ops = {
            id: App.ops.in,
            username: App.ops.in,
        };
        query = App.filter(query, Object.keys(ops));
        try {
            let data = {
                index: 0,
                count: -1,
                query
            };
            data.fields = fields || this.saftKey.filter(k => ['email', 'phone'].indexOf(k) < 0);
            let queryData = await super.query(
                data, Account, ops
            );
            const isFollow = await this.isFollow(queryData.data.map(d => d.username));
            queryData.list = queryData.data.forEach(d => {
                d.isfollow = !!isFollow[d.username];
            });
            if (onlyData) return queryData;
            return this.okquery(queryData);
        } catch (err) {
            throw (err);
        }
    }

    async sendverify(data, onlyData = false) {
        const keys = ['username', 'email'];

        if (!App.haskeys(data, keys)) {
            throw (this.error.param);
        }
        try {
            let account = await this.info(true);
            if (account.username != data.username) {
                throw this.error.limited;
            }

            let sha256 = crypto.createHash('sha256');
            let token = sha256.update(data.email + new Date().getTime() + __salt).digest('hex');

            // clear history token
            await Token.destroy({
                where: {
                    username: data.username
                }
            });
            let tokened = await super.new({ username: data.username, token }, Token, 'username');

            let transporter = nodemailer.createTransport(config.mail);

            let info = await transporter.sendMail({
                from: `"${config.base.name}" <${config.mail.auth.user}>`, // sender address
                to: data.email,
                subject: '[Code Snippet] Please verify your email address', // Subject line
                html: this.__makemail({ ...account, token, domain: config.base.domain }, 'verify'), // html body
            });

            return this.oksend(info);
        } catch (err) {
            throw (err);
        }

    }
    async verify(data, onlyData = false) {
        const keys = ['username', 'token'];

        if (!App.haskeys(data, keys)) {
            throw (this.error.param);
        }

        try {
            let token = await Token.findOne({
                where: {
                    username: data.username,
                    token: data.token
                }
            })

            let yesterday = new Date();
            yesterday = yesterday.setDate(yesterday.getDate() - 1) / 1000;
            if (!token || token.create_time < yesterday) {
                throw (this.error.notverify)
            }

            let account = await Account.findOne({
                where: { username: data.username }
            })
            account.verify = true;
            await account.save();

            await Token.destroy({
                where: {
                    username: data.username
                }
            });

            return this.okverify(data.username);
        } catch (err) {
            throw (err);
        }
    }

    get user() {
        if (!this.islogin) {
            throw (this.error.nologin);
        }
        return this.session.account_login;
    }

    __makemail(data, type) {
        let tpl = '';
        if (!__tpl[type].data) {
            __tpl[type].data = fs.readFileSync(__tpl[type].path).toString();
        }
        tpl = __tpl[type].data;

        Object.keys(data).forEach(k => {
            let value = data[k];
            tpl = tpl.replace(new RegExp(`{{${k}}}`, 'g'), value);
        })
        return tpl;
    }
}

module.exports = Module;