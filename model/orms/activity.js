const db = require('../db');
const prefix = require('../config').prefix;
let orm = {
    username: {
        type: db.STRING(20),
        comment: '发起账号'
    },
    type: {
        type: db.INTEGER,
        comment: '类型: 0-create, 1-star, 2-fork, 3-comment, 4-reply, 5-follow, -1-system'
    },
    private: {
        type: db.BOOLEAN,
        comment: '是否私有'
    },
    snippet: {
        type: db.ID,
        comment: '所属片段 ID'
    },
    source: {
        type: db.TEXT,
        comment: '来源数据，如 fork 的源片段 JSON，评论内容等',
    },
    target: {
        type: db.ID,
        comment: '来源ID，如 fork 的源片段 ID，回复的评论 ID',
        defaultValue: ''
    },
    notice: {
        type: db.STRING(20),
        comment: '通知帐号，为空则为广播信息流'
    },
    readed: {
        type: db.BOOLEAN,
        comment: '是否已读',
        defaultValue: false
    },
    description: {
        type: db.STRING(1024),
        comment: '描述',
        defaultValue: ''
    }
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