// eslint-disable-next-line @typescript-eslint/no-var-requires
const model = require('../model')

async function main(): Promise<void> {
  console.log('重建代码片段创建历史')
  const snippets = await model.snippet.findAll()
  for (const snippet of snippets) {
    await snippetChange(snippet.dataValues)
  }
}

async function snippetChange(snippet: any): Promise<void> {
  const change = await model.change.create({
    snippet: snippet.id,
    ...snippet,
    id: undefined
  })
  snippet.codes = await model.code.findAll({ where: { snippet: snippet.id } })
  const historys = snippet.codes.map((c: any) => ({
    file_id: c.id,
    change_id: change.id,
    snippet: c.snippet,
    pre_filename: c.filename,
    filename: c.filename,
    pre_content: '',
    content: c.content,
    modify_date: c.create_time
  }))
  await model.history.bulkCreate(historys)
}

void main()
