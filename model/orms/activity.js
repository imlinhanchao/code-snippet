const db = require('../db');
const prefix = require('../config').prefix;
let orm = {
    username: {
        type: db.STRING(20),
        comment: '发起账号'
    },
    type: {
        type: db.INTEGER,
        comment: '类型'
    },
    times: {
        type: db.INTEGER,
        comment: '执行次数'
    },
    private: {
        type: db.BOOLEAN,
        comment: '是否私有'
    },
    snippet: {
        type: db.ID,
        comment: '所属片段 ID'
    },
    fork_snippet: {
        type: db.ID,
        comment: 'Fork 片段 ID'
    },
    notice: {
        type: db.STRING(20),
        comment: '通知帐号，为空则为广播信息流'
    },
};
let table_name = prefix + 'activity';
module.exports = db.defineModel(table_name, orm, {
    comment: '信息通知表',
});
module.exports.db = db;
module.exports.tb = table_name;
module.exports.keys = function () {
    return Object.keys(orm);
};