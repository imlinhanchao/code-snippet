const db = require('../db');
const prefix = require('../config').prefix;
let orm = {
    username: {
        type: db.STRING(20),
        comment: '登录帐号'
    },
    snippet: {
        type: db.ID,
        comment: '代码片段 ID'
    },
};
let table_name = prefix + 'fav';
module.exports = db.defineModel(table_name, orm, {
    comment: '收藏表',
});
module.exports.db = db;
module.exports.tb = table_name;
module.exports.keys = function () {
    return Object.keys(orm);
};