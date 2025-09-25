const db = require('../db');
const prefix = require('../config').prefix;
let orm = {
    snippet: {
        type: db.ID,
        comment: 'Snippet ID'
    },
    description: {
        type: db.STRING(500),
        comment: '当前描述'
    },
    language: {
        type: db.STRING(10),
        comment: '运行语言'
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
let table_name = prefix + 'change';
module.exports = db.defineModel(table_name, orm, {
    comment: '更新记录表',
});
module.exports.db = db;
module.exports.tb = table_name;
module.exports.keys = function () {
    return Object.keys(orm);
};