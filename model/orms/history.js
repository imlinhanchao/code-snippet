const db = require('../db');
const snippet = require('./snippet');
const prefix = require('../config').prefix;
let orm = {
    file_id: {
        type: db.ID,
        comment: '文件 ID'
    },
    change_id: {
        type: db.ID,
        comment: '变更 ID',
    },
    snippet: {
        type: db.ID,
        comment: '代码片段 ID',
    },
    filename: {
        type: db.STRING(50),
        comment: '文件名'
    },
    content: {
        type: db.TEXT,
        comment: '文件内容'
    },
    modify_date: {
        type: db.INTEGER,
        comment: '修改时间'
    }
};
let table_name = prefix + 'history';
module.exports = db.defineModel(table_name, orm, {
    comment: '历史修改表',
});
module.exports.db = db;
module.exports.tb = table_name;
module.exports.keys = function () {
    return Object.keys(orm);
};