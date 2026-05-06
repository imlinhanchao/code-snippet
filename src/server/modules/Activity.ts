import { AppDataSource } from '../database/data-source'
import { ActivityEntity } from '../database/entities/ActivityEntity'
import { CodeEntity } from '../database/entities/CodeEntity'
import { AccountEntity } from '../database/entities/AccountEntity'
import App from './App'
import { In } from 'typeorm'

const __error__ = Object.assign({}, App.error)

interface SessionLike {
  account_login?: Record<string, unknown>
}

class ActivityModule extends App {
  session: SessionLike

  constructor(session: SessionLike) {
    super([{ fun: App.ok, name: 'okget', msg: '获取成功' }])
    this.session = session
    this.name = '活动'
  }

  // Dynamic methods set by constructor
  okget!: (data?: unknown) => object

  get error() {
    return __error__
  }

  async create(data: Record<string, unknown>, user: string): Promise<void> {
    if (!App.haskeys(data, ['id', 'private'])) throw this.error.param
    const repo = AppDataSource.getRepository(ActivityEntity)
    const entity = new ActivityEntity()
    Object.assign(entity, {
      username: user,
      type: 0,
      private: data.private || false,
      snippet: data.id,
      source: JSON.stringify(data),
      description: (data.codes as any)?.[0]?.filename || '',
      notice: '',
      create_time: data.create_time
    })
    repo.save(entity).catch(() => {})
  }

  async star(data: Record<string, unknown>, user: string): Promise<void> {
    if (!App.haskeys(data, ['id'])) throw this.error.param
    let name = (data.codes as any)?.[0]?.filename
    if (!name) {
      const codeRepo = AppDataSource.getRepository(CodeEntity)
      const code = await codeRepo.findOne({
        where: { snippet: data.id as string },
        order: { order: 'ASC' }
      })
      if (code) name = code.filename
    }
    const repo = AppDataSource.getRepository(ActivityEntity)
    const entity = new ActivityEntity()
    Object.assign(entity, {
      username: user,
      type: 1,
      private: false,
      snippet: data.id,
      source: JSON.stringify(data),
      target: data.username,
      description: name || '',
      notice: data.username,
      create_time: data.create_time
    })
    repo.save(entity).catch(() => {})
  }

  async unstar(data: Record<string, unknown>, user: string): Promise<void> {
    if (!App.haskeys(data, ['id'])) throw this.error.param
    const repo = AppDataSource.getRepository(ActivityEntity)
    repo.delete({ username: user, type: 1, snippet: data.id as string }).catch(() => {})
  }

  fork(data: Record<string, unknown>, user: string): void {
    if (!App.haskeys(data, ['id', 'fork_from'])) throw this.error.param
    const repo = AppDataSource.getRepository(ActivityEntity)
    const entity = new ActivityEntity()
    Object.assign(entity, {
      username: user,
      type: 2,
      private: false,
      snippet: data.id,
      source: JSON.stringify(data),
      target: data.username,
      description: (data.codes as any)?.[0]?.filename || '',
      notice: '',
      create_time: data.create_time
    })
    repo.save(entity).catch(() => {})
  }

  removeSnippet(data: Record<string, unknown>): void {
    if (!App.haskeys(data, ['id'])) throw this.error.param
    const repo = AppDataSource.getRepository(ActivityEntity)
    repo.delete({ snippet: data.id as string }).catch(() => {})
  }

  comment(data: Record<string, unknown>, user: string, notice: string): void {
    if (!App.haskeys(data, ['snippet', 'reply'])) throw this.error.param
    const repo = AppDataSource.getRepository(ActivityEntity)
    const entity = new ActivityEntity()
    Object.assign(entity, {
      username: user,
      type: data.reply ? 3 : 4,
      private: false,
      snippet: data.snippet,
      source: JSON.stringify(data),
      target: data.reply,
      notice: notice || '',
      description: data.reply ? 'reply_comment' : 'comment_snippet',
      create_time: data.create_time
    })
    repo.save(entity).catch(() => {})
  }

  removeComment(data: Record<string, unknown>, user: string): void {
    if (!App.haskeys(data, ['id'])) throw this.error.param
    const repo = AppDataSource.getRepository(ActivityEntity)
    repo
      .createQueryBuilder()
      .delete()
      .where('username = :user AND type IN (:...types) AND source = :source', {
        user,
        types: [3, 4],
        source: data.id
      })
      .execute()
      .catch(() => {})
  }

  async follow(data: Record<string, unknown>, user: string): Promise<void> {
    if (!App.haskeys(data, ['target'])) throw this.error.param
    const accountRepo = AppDataSource.getRepository(AccountEntity)
    const account = await accountRepo.findOne({ where: { username: data.target as string } })
    if (!account) return
    const safeAccount = App.filter(
      account as unknown as Record<string, unknown>,
      Object.keys(account).filter((k) => k !== 'passwd')
    )
    const repo = AppDataSource.getRepository(ActivityEntity)
    const entity = new ActivityEntity()
    Object.assign(entity, {
      username: user,
      type: 5,
      private: false,
      snippet: '',
      source: JSON.stringify(safeAccount),
      notice: data.target,
      description: data.target,
      create_time: data.create_time
    })
    repo.save(entity).catch(() => {})
  }

  unfollow(data: Record<string, unknown>, user: string): void {
    if (!App.haskeys(data, ['target'])) throw this.error.param
    const repo = AppDataSource.getRepository(ActivityEntity)
    repo.delete({ username: user, type: 5, notice: data.target as string }).catch(() => {})
  }

  async readed(data: Record<string, unknown>, user: string): Promise<object> {
    const filtered = App.filter(data, ['id'])
    const repo = AppDataSource.getRepository(ActivityEntity)
    const where: Record<string, unknown> = {
      notice: user,
      readed: false
    }
    if (filtered.id) where.id = filtered.id
    await repo
      .createQueryBuilder()
      .update(ActivityEntity)
      .set({ readed: true } as any)
      .where({ ...where, type: In([3, 4]) })
      .execute()
    return this.okget(true)
  }

  async list(
    data: {
      lastTime?: number
      count?: number
      follows?: string[]
      type?: string
    },
    username: string
  ): Promise<object> {
    const { lastTime = Date.now() / 1000, count = 20, follows = [], type } = data

    const repo = AppDataSource.getRepository(ActivityEntity)
    const qb = repo.createQueryBuilder('a')

    if (type) {
      const types = type.split(',').map((t) => Number(t))
      if (types.length === 1) {
        qb.andWhere('a.type = :type', { type: types[0] })
      } else {
        qb.andWhere('a.type IN (:...types)', { types })
      }
    }

    if (lastTime) {
      qb.andWhere('a.create_time < :lastTime', { lastTime })
    }

    qb.andWhere('a.private = :private', { private: false })

    const conditions: string[] = []
    const params: Record<string, unknown> = {}

    if (follows.length > 0) {
      conditions.push('a.username IN (:...follows)')
      params.follows = follows
    }
    conditions.push('a.notice = :notice')
    params.notice = username

    if (conditions.length > 0) {
      qb.andWhere(`(${conditions.join(' OR ')})`, params)
    }

    qb.orderBy('a.create_time', 'DESC').limit(count)

    const results = await qb.getMany()
    const saftKey = ['id', 'create_time', 'update_time'].concat(
      App.getEntityKeys(ActivityEntity)
    )
    return this.okget(
      results.map((v) => {
        const item = v as unknown as Record<string, unknown>
        if (item.source) {
          try {
            item.source = JSON.parse(item.source as string)
          } catch {
            item.source = null
          }
        }
        return App.filter(item, saftKey)
      })
    )
  }
}

export default ActivityModule
