const db = require('../db');
const prefix = require('../config').prefix;
let orm = {
    username: {
        type: db.STRING(20),
        comment: '登录帐号'
    },
    content: {
        type: db.TEXT,
        comment: '评论内容'
    },
};
let table_name = prefix + 'comment';
module.exports = db.defineModel(table_name, orm, {
    comment: '评论表',
});
module.exports.db = db;
module.exports.tb = table_name;
module.exports.keys = function () {
    return Object.keys(orm);
};