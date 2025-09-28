const model = require('../model');
const Snippet = model.snippet;
const Code = model.code;
const Change = model.change;
const History = model.history;

// 补充/重建信息流
async function main() {
  console.log('重建代码片段创建历史');
  const snippets = await Snippet.findAll();
  for (let snippet of snippets) {  
    await SnippetChange(snippet.dataValues);
  }
}

async function SnippetChange(snippet) {
  const change = await Change.create({
    snippet: snippet.id,
    ...snippet,
    id: undefined
  });
  snippet.codes = await Code.findAll({ where: { snippet: snippet.id } });
  const historys = snippet.codes.map(c => ({
    file_id: c.id,
    change_id: change.id,
    snippet: c.snippet,
    pre_filename: c.filename,
    filename: c.filename,
    pre_content: '',
    content: c.content,
    modify_date: c.create_time
  }));
  await History.bulkCreate(historys);
}

main();