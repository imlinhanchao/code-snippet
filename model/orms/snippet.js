const db = require('../db');
const prefix = require('../config').prefix;
let orm = {
    title: {
        type: db.STRING(50),
        comment: 'Snippet 标题'
    },
    description: {
        type: db.STRING(500),
        comment: '描述'
    },
    command: {
        type: db.STRING(64),
        comment: '运行命令'
    },
    private: {
        type: db.BOOLEAN,
        comment: '是否私有'
    },
    username: {
        type: db.STRING(20),
        comment: '登录帐号'
    },
    fork_from: {
        type: db.ID,
        comment: 'Fork 来源 ID'
    }
};
let table_name = prefix + 'snippet';
module.exports = db.defineModel(table_name, orm, {
    comment: '代码片段表',
});
module.exports.db = db;
module.exports.tb = table_name;
module.exports.keys = function () {
    return Object.keys(orm);
};