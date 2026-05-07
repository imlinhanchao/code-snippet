// eslint-disable-next-line @typescript-eslint/no-var-requires
const modules = require('../modules.js')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const model = require('../model')
const Activity = modules.activity

async function main(): Promise<void> {
  await snippetActivity()
  await starActivity()
  await commentActivity()
  await followActivity()
}

async function snippetActivity(): Promise<void> {
  console.log('重建代码片段创建信息流')
  const snippets = await model.snippet.findAll()
  const activity = new Activity()
  for (const snip of snippets) {
    snip.codes = await model.code.findAll({ where: { snippet: snip.id } })
    await activity.create(snip, snip.username)
  }
}

async function starActivity(): Promise<void> {
  const stars = await model.fav.findAll()
  const activity = new Activity()
  for (const star of stars) {
    const snippet = await model.snippet.findOne({ where: { id: star.snippet } })
    await activity.star(snippet, star.username)
  }
}

async function commentActivity(): Promise<void> {
  const comments = await model.comment.findAll()
  const activity = new Activity()
  for (const comment of comments) {
    await activity.comment(comment, comment.username)
  }
}

async function followActivity(): Promise<void> {
  const follows = await model.follow.findAll()
  const activity = new Activity()
  for (const follow of follows) {
    await activity.follow(follow)
  }
}

void main()
