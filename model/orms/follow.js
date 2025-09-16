const db = require('../db');
const prefix = require('../config').prefix;
let orm = {
    username: {
        type: db.STRING(20),
        comment: '发起账号'
    },
    target: {
        type: db.STRING(20),
        comment: '目标帐号'
    },
};
let table_name = prefix + 'follow';
module.exports = db.defineModel(table_name, orm, {
    comment: '关注表',
});
module.exports.db = db;
module.exports.tb = table_name;
module.exports.keys = function () {
    return Object.keys(orm);
};