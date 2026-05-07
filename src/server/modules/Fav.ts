import { AppDataSource } from '../database/data-source'
import { FavEntity } from '../database/entities/FavEntity'
import { SnippetEntity } from '../database/entities/SnippetEntity'
import App from './App'
import ActivityModule from './Activity'
import AccountModule from './Account'
import { In } from 'typeorm'

const __error__ = Object.assign(
  { existed: App.error.existed('已收藏过', true, true) },
  App.error
)

interface SessionLike {
  account_login?: Record<string, unknown>
}

class FavModule extends App {
  session: SessionLike
  safeKey: string[]
  account: AccountModule
  activity: ActivityModule

  constructor(session: SessionLike) {
    super()
    this.session = session
    this.name = '收藏'
    this.account = new AccountModule(session)
    this.activity = new ActivityModule(session)
    this.safeKey = ['id', 'create_time', 'update_time'].concat(App.getEntityKeys(FavEntity))
  }

  get error() {
    return __error__
  }

  async new(data: Record<string, unknown>) {
    try {
      data.username = this.account.user.username

      if (!App.haskeys(data, ['snippet'])) throw this.error.param
      const snippetRepo = AppDataSource.getRepository(SnippetEntity)
      const snippet = await snippetRepo.findOne({ where: { id: data.snippet as string } })
      if (!snippet) throw this.error.param

      const fav = App.filter(await super.createRecord(data, FavEntity, ['username', 'snippet']), this.safeKey)
      this.activity.star(snippet as unknown as Record<string, unknown>, this.account.user.username as string)
      return fav
    } catch (err) {
      if ((err as any).isdefine) throw err
      throw this.error.db(err)
    }
  }

  async del(data: Record<string, unknown>) {
    try {
      data.username = this.account.user.username
      const repo = AppDataSource.getRepository(FavEntity)
      await repo.delete(data as any)
    } catch (err) {
      if ((err as any).isdefine) throw err
      throw this.error.db(err)
    }
  }

  async remove(snippet: string, onlyData?: boolean) {
    if (!onlyData) return
    try {
      const repo = AppDataSource.getRepository(FavEntity)
      await repo.delete({ snippet })
      return true
    } catch (err) {
      if ((err as any).isdefine) throw err
      throw this.error.db(err)
    }
  }

  async get(snippet: string, onlyData: boolean = false) {
    try {
      const repo = AppDataSource.getRepository(FavEntity)
      const favs = await repo.find({ where: { snippet } })
      const mapped = favs.map((d) => App.filter(d as unknown as Record<string, unknown>, this.safeKey))
      if (onlyData) return mapped
      return mapped
    } catch (err) {
      if ((err as any).isdefine) throw err
      throw this.error.db(err)
    }
  }

  async getAll(snippets: string[], _onlyData?: boolean): Promise<Record<string, unknown>[]> {
    try {
      const repo = AppDataSource.getRepository(FavEntity)
      const favs = await repo.find({ where: { snippet: In(snippets) } })
      return favs.map((d) => App.filter(d as unknown as Record<string, unknown>, this.safeKey))
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
      const queryData = await super.findAll(data, FavEntity, ops)
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
      const total = await super.countBy(data, FavEntity, ops, 'snippet')
      if (onlyData) return total
      return total
    } catch (err) {
      if ((err as any).isdefine) throw err
      throw this.error.db(err)
    }
  }
}

export default FavModule
