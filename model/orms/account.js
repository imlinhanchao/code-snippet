const db = require('../db');
const prefix = require('../config').prefix;
let orm = {
    username: {
        type: db.STRING(20),
        comment: '登录帐号'
    },
    nickname: {
        type: db.STRING(20),
        comment: '昵称'
    },
    passwd: {
        type: db.STRING(64),
        comment: '密码'
    },
    email: {
        type: db.STRING(100),
        comment: '邮箱'
    },
    phone: {
        type: db.STRING(20),
        comment: '手机'
    },
    motto: {
        type: db.STRING(200),
        comment: '签名'
    },
    avatar: {
        type: db.STRING(200),
        comment: '头像'
    },
    lastlogin: {
        type: db.INTEGER,
        comment: '最后登录时间'
    }
};
let table_name = prefix + 'account';
module.exports = db.defineModel(table_name, orm, {
    comment: '用户表',
});
module.exports.db = db;
module.exports.tb = table_name;
module.exports.keys = function () {
    return Object.keys(orm);
};