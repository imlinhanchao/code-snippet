const db = require('../db');
const prefix = require('../config').prefix;
let orm = {
    filename: {
        type: db.STRING(50),
        comment: '文件名'
    },
    content: {
        type: db.TEXT,
        comment: '文件内容'
    },
    snippet: {
        type: db.ID,
        comment: '所属片段 ID'
    },
    order: {
        type: db.INTEGER,
        comment: '添加順序'
    },
    input: {
        type: db.TEXT,
        comment: '运行默认输入'
    },
    command: {
        type: db.STRING(64),
        comment: '运行命令'
    },
    execute: {
        type: db.BOOLEAN,
        comment: '是否可执行'
    },
};
let table_name = prefix + 'code';
module.exports = db.defineModel(table_name, orm, {
    comment: '代码表',
});
module.exports.db = db;
module.exports.tb = table_name;
module.exports.keys = function () {
    return Object.keys(orm);
};