import { AppDataSource } from '../database/data-source'
import { CommentEntity } from '../database/entities/CommentEntity'
import { SnippetEntity } from '../database/entities/SnippetEntity'
import App from './App'
import AccountModule from './Account'
import ActivityModule from './Activity'

const __error__ = Object.assign(
  { notexisted: App.error.existed('评论', false) },
  App.error
)

interface SessionLike {
  account_login?: Record<string, unknown>
}

class CommentModule extends App {
  session: SessionLike
  safeKey: string[]
  account: AccountModule
  activity: ActivityModule

  constructor(session: SessionLike) {
    super()
    this.session = session
    this.name = '评论'
    this.account = new AccountModule(session)
    this.activity = new ActivityModule(session)
    this.safeKey = ['id', 'create_time', 'update_time'].concat(App.getEntityKeys(CommentEntity))
  }

  get error() {
    return __error__
  }

  async new(data: Record<string, unknown>) {
    try {
      data.username = this.account.user.username

      const comment = App.filter(await super.createRecord(data, CommentEntity), this.safeKey)
      let targetUser = ''
      if (data.reply) {
        const repo = AppDataSource.getRepository(CommentEntity)
        const replyComment = await repo.findOne({ where: { id: data.reply as string } })
        if (replyComment) targetUser = replyComment.username
      } else {
        const snippetRepo = AppDataSource.getRepository(SnippetEntity)
        const snippet = await snippetRepo.findOne({ where: { id: data.snippet as string } })
        if (snippet) targetUser = snippet.username
      }
      this.activity.comment(comment, this.account.user.username as string, targetUser)
      return comment
    } catch (err) {
      if ((err as any).isdefine) throw err
      throw this.error.db(err)
    }
  }

  async set(data: Record<string, unknown>) {
    try {
      data.username = undefined
      data.snippet = undefined
      data.reply = undefined

      const comment = App.filter(
        await super.updateRecord(data, CommentEntity, (d) => {
          if ((d as any).username !== this.account.user.username) throw this.error.unauthorized
          return true
        }),
        this.safeKey
      )
      return comment
    } catch (err) {
      if ((err as any).isdefine) throw err
      throw this.error.db(err)
    }
  }

  async del(data: Record<string, unknown>) {
    try {
      data.username = this.account.user.username
      const repo = AppDataSource.getRepository(CommentEntity)
      const comment = await repo.findOne({ where: data as any })
      await repo.delete(data as any)
      this.activity.removeComment(data, this.account.user.username as string)
      return comment ? comment.id : null
    } catch (err) {
      if ((err as any).isdefine) throw err
      throw this.error.db(err)
    }
  }

  async remove(snippet: string, onlyData?: boolean) {
    if (!onlyData) return
    try {
      const repo = AppDataSource.getRepository(CommentEntity)
      await repo.delete({ snippet })
      return true
    } catch (err) {
      if ((err as any).isdefine) throw err
      throw this.error.db(err)
    }
  }

  async get(snippet: string, onlyData: boolean = false) {
    try {
      const repo = AppDataSource.getRepository(CommentEntity)
      const comments = await repo.find({ where: { snippet } })
      if (!comments) throw this.error.notexisted as any
      const mapped = comments.map((d) => App.filter(d as unknown as Record<string, unknown>, this.safeKey))
      if (onlyData) return mapped
      return mapped
    } catch (err) {
      if ((err as any).isdefine) throw err
      throw this.error.db(err)
    }
  }

  async query(
    data: { query?: Record<string, unknown>; index?: number; count?: number; order?: any[]; fields?: string[] },
    onlyData: boolean = false
  ) {
    const ops = {
      username: App.ops.equal,
      snippet: App.ops.in,
      create_time: App.ops.less
    }

    try {
      const queryData = await super.findAll(data, CommentEntity, ops)
      if (onlyData) return queryData
      queryData.data = queryData.data.map((q) => App.filter(q, this.safeKey))
      return queryData
    } catch (err) {
      if ((err as any).isdefine) throw err
      throw this.error.db(err)
    }
  }

  async count(
    data: Record<string, unknown>,
    onlyData: boolean = false
  ) {
    const ops = {
      username: App.ops.equal,
      snippet: App.ops.in,
      create_time: App.ops.less
    }

    try {
      const total = await super.countBy(data, CommentEntity, ops, 'snippet')
      if (onlyData) return total
      return total
    } catch (err) {
      if ((err as any).isdefine) throw err
      throw this.error.db(err)
    }
  }
}

export default CommentModule
