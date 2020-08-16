const db = require('../db');
const prefix = require('../config').prefix;
let orm = {
    username: {
        type: db.STRING(20),
        comment: '登录帐号'
    },
    token: {
        type: db.STRING(64),
        comment: 'Token'
    },
};
let table_name = prefix + 'token';
module.exports = db.defineModel(table_name, orm, {
    comment: '验证 Token 表',
});
module.exports.db = db;
module.exports.tb = table_name;
module.exports.keys = function () {
    return Object.keys(orm);
};