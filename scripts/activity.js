const modules = require('../modules.js');
const model = require('../model');
const Activity = modules.activity;

// 补充/重建信息流
async function main() {
  await SnippetActivity();
  await StarActivity();
  await CommentActivity();
  await FollowActivity();
}

async function SnippetActivity() {
  console.log('重建代码片段创建信息流');
  const Snippet = model.snippet;
  const snippets = await Snippet.findAll();
  const activity = new Activity();
  for (let snip of snippets) {
    snip.codes = await model.code.findAll({ where: { snippet: snip.id } });
    await activity.create(snip, snip.username);
  }
}

async function StarActivity() {
  const Fav = model.fav;
  const stars = await Fav.findAll();
  const activity = new Activity();
  for (let star of stars) {
    const snippet = await model.snippet.findOne({ where: { id: star.snippet } });
    await activity.star(snippet, star.username);
  }
}

async function CommentActivity() {
  const Comment = model.comment;
  const comments = await Comment.findAll();
  const activity = new Activity();
  for (let comment of comments) {
    await activity.comment(comment, comment.username);
  }
}

async function FollowActivity() {
  const Follow = model.follow;
  const follows = await Follow.findAll();
  const activity = new Activity();
  for (let follow of follows) {
    await activity.follow(follow);
  }
}

main();