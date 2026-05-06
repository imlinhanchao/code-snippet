import { AppDataSource } from '../database/data-source'
import { SnippetEntity } from '../database/entities/SnippetEntity'
import { ChangeEntity } from '../database/entities/ChangeEntity'
import { HistoryEntity } from '../database/entities/HistoryEntity'
import App from './App'
import AccountModule from './Account'
import CodeModule from './Code'
import FavModule from './Fav'
import CommentModule from './Comment'
import ActivityModule from './Activity'
import GlotApp from './Glot'
import { In } from 'typeorm'

const __error__ = Object.assign(
  { notexisted: App.error.existed('Snippet', false) },
  App.error
)

interface SessionLike {
  account_login?: Record<string, unknown>
}

class SnippetModule extends App {
  session: SessionLike
  saftKey: string[]
  account: AccountModule
  code: CodeModule
  fav: FavModule
  comment: CommentModule
  activity: ActivityModule

  constructor(session: SessionLike) {
    super([{ fun: App.ok, name: 'okrun', msg: '执行成功' }])
    this.session = session
    this.name = 'Snippet'
    this.account = new AccountModule(session)
    this.code = new CodeModule(session)
    this.fav = new FavModule(session)
    this.comment = new CommentModule(session)
    this.activity = new ActivityModule(session)
    this.saftKey = ['id', 'create_time', 'update_time'].concat(App.getEntityKeys(SnippetEntity))
  }

  // Dynamic methods
  okrun!: (data?: unknown) => object

  get error() {
    return __error__
  }

  async new(data: Record<string, unknown>, onlyData: boolean = false): Promise<unknown> {
    try {
      data.username = this.account.user.username
      if (!App.haskeys(data, ['codes'])) throw this.error.param

      let snippet = App.filter(await super.createRecord(data, SnippetEntity), this.saftKey)
      ;(data.codes as any[]).forEach((c: any) => {
        c.snippet = snippet.id
        c.filename = c.filename.trim()
        c.content = c.content.replace(/\t/g, '    ')
      })
      snippet.codes = await this.code.create(data.codes as any[])

      const changeRepo = AppDataSource.getRepository(ChangeEntity)
      const changeEntity = new ChangeEntity()
      Object.assign(changeEntity, {
        snippet: snippet.id,
        description: snippet.description,
        language: snippet.language,
        input: snippet.input,
        command: snippet.command,
        execute: snippet.execute
      })
      const change = await changeRepo.save(changeEntity)

      const historyRepo = AppDataSource.getRepository(HistoryEntity)
      const histories = (snippet.codes as any[]).map((c: any) => {
        const h = new HistoryEntity()
        Object.assign(h, { ...c, change_id: change.id })
        return h
      })
      await historyRepo.save(histories)

      if (onlyData) return snippet
      this.activity.create(snippet, this.account.user.username as string)
      return this.okcreate(snippet)
    } catch (err) {
      if ((err as any).isdefine) throw err
      throw this.error.db(err)
    }
  }

  async set(data: Record<string, unknown>): Promise<unknown> {
    try {
      data.username = undefined
      data.fork_from = undefined
      data.private = undefined

      if (!App.haskeys(data, ['codes'])) throw this.error.param

      let snippet = App.filter(
        await super.updateRecord(data, SnippetEntity, (d: any) => {
          if (d.username !== this.account.user.username) throw this.error.unauthorized
          return true
        }),
        this.saftKey
      )

      ;(data.codes as any[]).forEach((c: any) => {
        c.snippet = data.id
        c.filename = c.filename.trim()
        c.content = c.content.replace(/\t/g, '    ')
      })

      const existingCodes = await this.code.get(data.id as string)
      const codes_id = existingCodes.map((c: any) => c.id)
      let createCodes = (data.codes as any[]).filter((c: any) => !c.id)
      data.codes = (data.codes as any[]).filter((c: any) => codes_id.includes(c.id))

      const removeCodes = (data.codes as any[]).filter((c: any) => c.remove)
      data.codes = (data.codes as any[]).filter((c: any) => !c.remove)

      const history: any[] = []
      history.push(...(await this.code.remove(removeCodes)))
      history.push(...(await this.code.create(createCodes)))
      history.push(...(await this.code.update(data.codes as any[])))

      if (history.length > 0) {
        const changeRepo = AppDataSource.getRepository(ChangeEntity)
        const changeEntity = new ChangeEntity()
        Object.assign(changeEntity, {
          snippet: data.id,
          description: data.description,
          language: data.language,
          input: data.input,
          command: data.command,
          execute: data.execute
        })
        const change = await changeRepo.save(changeEntity)

        const historyRepo = AppDataSource.getRepository(HistoryEntity)
        const histories = history.map((h: any) => {
          const he = new HistoryEntity()
          Object.assign(he, { ...h, change_id: change.id })
          return he
        })
        await historyRepo.save(histories)
      }

      snippet.codes = (await this.code.get(data.id as string)).map((d: any) =>
        App.filter(d, this.code.saftKey.filter((k) => k !== 'snippet'))
      )

      return this.okupdate(snippet)
    } catch (err) {
      if ((err as any).isdefine) throw err
      throw this.error.db(err)
    }
  }

  async del(data: Record<string, unknown>): Promise<unknown> {
    try {
      const info = await super.deleteRecord(data, SnippetEntity, (d: any) => {
        if (d.username !== this.account.user.username) throw this.error.unauthorized
        return true
      })
      await this.activity.removeSnippet(data)
      await this.code.del(data.id as string)
      await this.fav.remove(data.id as string, true)
      await this.comment.remove(data.id as string, true)
      const changeRepo = AppDataSource.getRepository(ChangeEntity)
      await changeRepo.delete({ snippet: data.id as string })
      return this.okdelete((info as any).id)
    } catch (err) {
      if ((err as any).isdefine) throw err
      throw this.error.db(err)
    }
  }

  async fork(data: Record<string, unknown>): Promise<unknown> {
    try {
      if (!App.haskeys(data, ['id'])) throw this.error.param

      let snippet = await this.get(data.id as string, true) as Record<string, unknown>

      if (snippet.private && (!this.account.islogin || snippet.username !== this.account.user.username)) {
        throw this.error.limited
      }

      snippet.fork_from = snippet.id
      delete snippet.id
      snippet = await this.new(snippet, true) as Record<string, unknown>
      this.activity.fork(snippet, this.account.user.username as string)
      return this.okcreate(snippet)
    } catch (err) {
      if ((err as any).isdefine) throw err
      throw this.error.db(err)
    }
  }

  async get(id: string, onlyData: boolean = false): Promise<unknown> {
    const snippetRepo = AppDataSource.getRepository(SnippetEntity)
    const info = await snippetRepo.findOne({ where: { id } })

    if (!info) throw this.error.notexisted as any

    if ((info as any).private && (!this.account.islogin || (info as any).username !== this.account.user.username)) {
      throw this.error.limited
    }

    const infoObj = info as unknown as Record<string, unknown>
    infoObj.codes = await this.code.get(id)
    infoObj.stared =
      this.account.islogin &&
      ((await this.fav.query(
        { query: { username: this.account.user.username, snippet: [info.id] }, index: 0, count: 1 },
        true
      )) as any).total > 0

    if (infoObj.fork_from) {
      try {
        infoObj.fork = await this.get(infoObj.fork_from as string, true)
      } catch {
        infoObj.fork = null
      }
    }

    const extendKeys = ['codes', 'stared', 'fork']
    if (onlyData) return App.filter(infoObj, this.saftKey.concat(extendKeys))
    return this.okquery(App.filter(infoObj, this.saftKey.concat(extendKeys)))
  }

  async changes(
    data: Record<string, unknown>,
    onlyData: boolean = false
  ): Promise<unknown> {
    if (!App.haskeys(data, ['id'])) throw this.error.param
    const { index = 0, count = 20 } = data

    try {
      const changeRepo = AppDataSource.getRepository(ChangeEntity)
      const changeSaftKey = ['id', 'create_time'].concat(App.getEntityKeys(ChangeEntity))

      let changes = await changeRepo.find({
        where: { snippet: data.id as string },
        order: { create_time: 'DESC' },
        skip: Number(index),
        take: Number(count) + 1
      })

      const changesMapped = changes.map((d) =>
        App.filter(d as unknown as Record<string, unknown>, changeSaftKey)
      )

      const historyRepo = AppDataSource.getRepository(HistoryEntity)
      const historySaftKey = ['id'].concat(App.getEntityKeys(HistoryEntity))
      const historys = await historyRepo.find({
        where: { change_id: In(changesMapped.map((c) => c.id as string)) },
        order: { modify_date: 'DESC' }
      })

      changesMapped.forEach((c) => {
        c.historys = historys
          .filter((h) => h.change_id === c.id)
          .map((h) => App.filter(h as unknown as Record<string, unknown>, historySaftKey))
      })

      if (onlyData) return changesMapped
      return this.okquery(changesMapped)
    } catch (err) {
      if ((err as any).isdefine) throw err
      throw this.error.db(err)
    }
  }

  async query(
    data: {
      query?: Record<string, unknown>
      index?: number
      count?: number
      order?: any[]
      fields?: string[]
    },
    onlyData: boolean = false
  ): Promise<unknown> {
    const ops = {
      id: App.ops.in,
      fork_from: App.ops.in,
      title: App.ops.like,
      description: App.ops.like,
      username: App.ops.equal,
      private: App.ops.equal,
      create_time: App.ops.less
    }

    if (this.account.islogin && data.query?.username === this.account.user.username) {
      if (data.query) data.query.private = undefined
    } else {
      if (!data.query) data.query = {}
      data.query.private = false
    }

    try {
      let queryData = await super.findAll(data, SnippetEntity, ops)

      data.fields = data.fields || ['codes', 'stars', 'fork', 'forks', 'comments'].concat(this.saftKey)
      const ids = queryData.data.map((b) => b.id as string)

      if (data.fields.includes('codes')) {
        const codes = await this.code.getAll(ids, true)
        ;(codes as any[]).sort((a: any, b: any) => a.order - b.order)
        queryData.data.forEach((d) => {
          ;(d as any).codes = (codes as any[]).filter((c: any) => c.snippet === d.id)
        })
      }

      if (data.fields.includes('stars')) {
        const stars = await this.fav.getAll(ids, true)
        queryData.data.forEach((d) => {
          const star = (stars as any[]).filter((s: any) => s.snippet === d.id)
          ;(d as any).stars = star.length
          ;(d as any).stared =
            this.account.islogin &&
            star.length > 0 &&
            star.find((s: any) => s.username === this.account.user.username) !== undefined
        })
      }

      if (data.fields.includes('comments')) {
        const comments = await this.comment.count({ snippet: ids }, true) as any[]
        queryData.data.forEach((d) => {
          const comment = comments.find((c: any) => c.snippet === d.id)
          ;(d as any).comments = comment ? comment.count : 0
        })
      }

      const fork_ids = queryData.data.map((b) => b.fork_from as string).filter((d) => d && d !== '')
      if (data.fields.includes('fork_from') && fork_ids.length > 0) {
        const snippets = (await this.query(
          { query: { id: fork_ids }, index: 0, count: -1, fields: ['id', 'codes', 'username'] },
          true
        )) as any
        queryData.data.forEach((d) => {
          if (!d.fork_from || d.fork_from === '') return
          ;(d as any).fork = snippets.data.find((s: any) => s.id === d.fork_from)
        })
      }

      if (data.fields.includes('forks')) {
        const forks = await super.countBy({ fork_from: ids }, SnippetEntity, ops, 'fork_from')
        queryData.data.forEach((d) => {
          const f = forks.find((f) => f['fork_from'] === d.id)
          ;(d as any).forks = f ? f.count : 0
        })
      }

      if (onlyData) return queryData
      return this.okquery(queryData)
    } catch (err) {
      if ((err as any).isdefine) throw err
      throw this.error.db(err)
    }
  }

  async execute(data: Record<string, unknown>): Promise<unknown> {
    const keys = ['language', 'codes', 'command']
    if (!App.haskeys(data, keys)) throw this.error.param

    const result = await GlotApp.compiler(
      data.language as string,
      data.codes as any[],
      (data.input as string) || '',
      data.command as string
    )
    return this.okrun(result)
  }
}

export default SnippetModule
