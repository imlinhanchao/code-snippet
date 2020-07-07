const crypto = require('crypto');
const model = require('../model');
const App = require('./app');
const Account = model.account;

const __salt = require('../config').salt;

let __error__ = Object.assign({}, App.error);
__error__.verify = App.error.reg('帐号或密码错误！');
__error__.captcha = App.error.reg('验证码错误！');
__error__.existed = App.error.existed('帐号');
__error__.existedmail = App.error.existed('邮箱');
__error__.existedphone = App.error.existed('电话');
__error__.notexisted = App.error.existed('帐号', false);
__error__.usertooshort = App.error.reg('用户名太短！');
__error__.passtooshort = App.error.reg('密码太短！');

class Module extends App {
    constructor(session) {
        super([
            { fun: App.ok, name: 'oklogin', msg: '登录成功' },
            { fun: App.ok, name: 'oklogout', msg: '登出成功' },
            { fun: App.ok, name: 'okget', msg: '获取成功' },
        ]);
        this.session = session;
        this.name = '用户';
        this.saftKey = ['id'].concat(Account.keys().filter(k => ['passwd'].indexOf(k) < 0));
    }

    get error() {
        return __error__;
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
        
            if (data.phone) {
                let account = await Account.findOne({
                    where: {
                        phone: data.phone
                    }
                });
                if (account) {
                    throw this.error.existedphone;
                }
            }
            
            data.nickname = data.username;
            data.lastlogin = new Date().valueOf() / 1000;
            let sha256 = crypto.createHash('sha256');
            data.passwd = sha256.update(data.passwd + __salt).digest('hex');
            data.email = data.email || '';
            data.phone = data.phone || '';
            data.motto = data.motto || '';
            data.avatar = data.avatar || '';
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

        data = App.filter(data, Account.keys().concat(['id']));

        try {
            let account = await this.info(true);
            if (account.username != data.username) {
                throw this.error.limited;
            }
            // 用户名不可更改
            data.username = undefined;
            if (account.passwd) {
                let sha256 = crypto.createHash('sha256');
                let passwd = sha256.update(data.oldpasswd + __salt).digest('hex');
                if (account.passwd != passwd) {
                    throw this.error.verify;
                }
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
            }
        
            // Phone 更新重复检查
            if (data.phone && data.phone != account.phone) {
                let account = await Account.findOne({
                    where: {
                        phone: data.phone
                    }
                });
                if (account) {
                    throw this.error.existedphone;
                }
            }
            return this.okupdate(await super.set(data, Account));
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

    async query(query, fields=null, onlyData=false) {
        let ops = {
            id: App.ops.in,
            username: App.ops.equal,
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
            if (onlyData) return queryData;
            return this.okquery(queryData);
        } catch (err) {
            throw (err);
        }
    }

    get userId() {
        if (!this.islogin) {
            throw (this.error.nologin);
        }
        return this.session.account_login.id;
    }
}

module.exports = Module;