import { AppDataSource } from '../database/data-source'
import {
  ObjectLiteral,
  Repository,
  FindManyOptions,
  In,
  Like,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Between,
  FindOperator
} from 'typeorm'

export class AppError extends Error {
  state: number
  msg: string
  data: unknown
  isdefine: boolean = true

  constructor(state: number, message: string, data?: unknown) {
    super(message)
    this.state = state
    this.msg = message
    this.data = data
    if (process.env.NODE_ENV !== 'development') {
      this.stack = undefined
    }
  }

  toJSON() {
    return {
      state: this.state,
      msg: this.message,
      data: this.data || ''
    }
  }

  toString() {
    return JSON.stringify(this.toJSON())
  }
}

export type RspFn = (msg: string, data?: unknown, customizeTip?: boolean) => object

interface RspDef {
  fun: typeof App.ok
  name: string
  msg: string
}

export type QueryResult<T = Record<string, unknown>> = {
  data: T[]
  total: number
}

export class App {
  name: string = ''

  constructor(rsps: RspDef[] = []) {
    const allRsps: RspDef[] = rsps.concat([
      { fun: App.ok, name: 'okquery', msg: '查询成功' },
      { fun: App.ok, name: 'okcreate', msg: '创建成功' },
      { fun: App.ok, name: 'okupdate', msg: '更新成功' },
      { fun: App.ok, name: 'okdelete', msg: '删除成功' }
    ])

    for (const rsp of allRsps) {
      ;(this as Record<string, unknown>)[rsp.name] = function (data?: unknown) {
        return rsp.fun(rsp.msg, data, true)
      }
    }
  }

  // Dynamic response methods (set in constructor)
  okquery!: (data?: unknown) => object
  okcreate!: (data?: unknown) => object
  okupdate!: (data?: unknown) => object
  okdelete!: (data?: unknown) => object

  get error() {
    return App.error
  }

  // Generic count grouped by field
  async countBy<T extends ObjectLiteral>(
    data: Record<string, unknown>,
    Entity: new () => T,
    ops: Record<string, string>,
    field: string = 'id'
  ): Promise<Array<{ count: number; [key: string]: unknown }>> {
    const repo = AppDataSource.getRepository(Entity)
    const where = App.buildWhere(data, ops)
    const qb = repo
      .createQueryBuilder('e')
      .select(`e.${field}`, field)
      .addSelect('COUNT(e.id)', 'count')
      .where(where as any)
      .groupBy(`e.${field}`)

    const result = await qb.getRawMany()
    return result.map((r) => ({
      count: Number(r.count),
      [field]: r[field]
    }))
  }

  // Generic paginated query
  async findAll<T extends ObjectLiteral>(
    data: {
      query?: Record<string, unknown>
      index?: number
      count?: number
      order?: Array<string | [string, 'ASC' | 'DESC']>
      fields?: string[]
    },
    Entity: new () => T,
    ops: Record<string, string>
  ): Promise<QueryResult> {
    const allKeys = App.getEntityKeys(Entity)

    if (!App.haskeys(data, ['index', 'count'])) {
      throw App.error.param
    }

    const query = App.filter(data.query || {}, allKeys)
    const where = App.buildWhere(query, ops)

    const orderArr = data.order || []
    if (!orderArr.find((o) => o === 'create_time' || (Array.isArray(o) && o[0] === 'create_time'))) {
      orderArr.push(['create_time', 'DESC'])
    }
    const order = App.buildOrder(orderArr, allKeys)

    const repo = AppDataSource.getRepository(Entity)
    const total = await repo.count({ where: where as any })

    const findOpts: FindManyOptions<T> = { where: where as any, order: order as any }
    const offset = parseInt(String(data.index)) || 0
    findOpts.skip = offset

    if (Number(data.count) > 0) {
      findOpts.take = parseInt(String(data.count))
    }

    const datalist = await repo.find(findOpts)
    const fields = data.fields || allKeys
    const mapped = datalist.map((d) => App.filter(d as unknown as Record<string, unknown>, fields))

    return { data: mapped, total }
  }

  // Generic create
  async createRecord<T extends ObjectLiteral>(
    data: Record<string, unknown>,
    Entity: new () => T,
    unique?: string | string[] | null
  ): Promise<Record<string, unknown>> {
    const keys = App.getEntityKeys(Entity)
    const filtered = App.filter(data, keys)
    const repo = AppDataSource.getRepository(Entity)

    if (unique) {
      const where: Record<string, unknown> = {}
      if (typeof unique === 'string') where[unique] = filtered[unique]
      else if (Array.isArray(unique)) unique.forEach((u) => { where[u] = filtered[u] })
      const existing = await repo.findOne({ where: where as any })
      if (existing) {
        throw App.error.existed(this.name)
      }
    }

    filtered['id'] = undefined
    const entity = Object.assign(new Entity(), filtered)
    const saved = await repo.save(entity)

    const allKeys = ['id'].concat(keys).concat(['create_time', 'update_time'])
    return App.filter(saved as unknown as Record<string, unknown>, allKeys)
  }

  // Generic update
  async updateRecord<T extends ObjectLiteral>(
    data: Record<string, unknown>,
    Entity: new () => T,
    preUpdate?: ((record: T) => boolean) | null,
    unique: string = 'id'
  ): Promise<Record<string, unknown>> {
    const keys = App.getEntityKeys(Entity)
    const allKeys = ['id'].concat(keys).concat(['create_time', 'update_time'])

    if (!App.haskeys(data, [unique])) {
      throw App.error.param
    }

    const filtered = App.filter(data, allKeys)
    const repo = AppDataSource.getRepository(Entity)

    const where: Record<string, unknown> = {}
    where[unique] = filtered[unique]
    const record = await repo.findOne({ where: where as any })

    if (!record) {
      throw App.error.existed(this.name, false)
    }

    if (!preUpdate || preUpdate(record)) {
      filtered[unique] = undefined
      App.updateObj(record as unknown as Record<string, unknown>, filtered, allKeys)
      const saved = await repo.save(record)
      return App.filter(saved as unknown as Record<string, unknown>, allKeys)
    } else {
      throw App.error.limited
    }
  }

  // Generic delete
  async deleteRecord<T extends ObjectLiteral>(
    data: Record<string, unknown>,
    Entity: new () => T,
    preDelete?: ((record: T) => boolean) | null,
    unique: string = 'id'
  ): Promise<Record<string, unknown>> {
    if (!App.haskeys(data, [unique])) {
      throw App.error.param
    }

    const filtered = App.filter(data, [unique])
    const repo = AppDataSource.getRepository(Entity)

    const where: Record<string, unknown> = {}
    where[unique] = filtered[unique]
    const record = await repo.findOne({ where: where as any })

    if (!record) {
      throw App.error.existed(this.name, false)
    }

    if (!preDelete || preDelete(record)) {
      await repo.delete(where as any)
      return record as unknown as Record<string, unknown>
    } else {
      throw App.error.limited
    }
  }

  // --- Static utilities ---

  static filter<T extends Record<string, unknown>>(
    data: T | null | undefined,
    keys: string[]
  ): Record<string, unknown> {
    if (!data) return {}
    const result: Record<string, unknown> = {}
    for (const key of keys) {
      if (key in (data as object)) {
        result[key] = (data as Record<string, unknown>)[key]
      }
    }
    return result
  }

  static haskeys(data: Record<string, unknown> | null | undefined, keys: string[]): boolean {
    if (!data) return false
    return keys.every((k) => data[k] !== undefined && data[k] !== null && data[k] !== '')
  }

  static hasone(data: Record<string, unknown>, keys: string[]): boolean {
    if (!data) return false
    return keys.some((k) => data[k] !== undefined && data[k] !== null && data[k] !== '')
  }

  static onlykeys(data: Record<string, unknown>, keys: string[]): boolean {
    if (!data) return false
    return Object.keys(data).every((k) => keys.includes(k))
  }

  static isSame(
    data1: Record<string, unknown>,
    data2: Record<string, unknown>,
    keys: string[] | null = null
  ): boolean {
    const allKeys = keys || Array.from(new Set([...Object.keys(data1), ...Object.keys(data2)]))
    return allKeys.every((k) => data1[k] === data2[k])
  }

  static updateObj(
    oldData: Record<string, unknown>,
    newData: Record<string, unknown>,
    keys: string[],
    bcreate: boolean = false
  ): Record<string, unknown> {
    if (!oldData || !newData) throw App.error.param
    for (const key of keys) {
      if (!bcreate && oldData[key] === undefined) continue
      if (newData[key] === undefined) continue
      oldData[key] = newData[key]
      if (typeof oldData[key] === 'string') {
        oldData[key] = (oldData[key] as string).replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')
      }
    }
    return oldData
  }

  static buildWhere(
    query: Record<string, unknown>,
    ops: Record<string, string>
  ): Record<string, unknown> {
    const where: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue
      const op = ops[key]
      if (!op) {
        where[key] = value
        continue
      }
      switch (op) {
        case '~': // IN
          where[key] = In(Array.isArray(value) ? (value as string[]) : [value as string])
          break
        case '$': // LIKE
          where[key] = Like(`%${value}%`)
          break
        case '!$': // NOT LIKE
          where[key] = Not(Like(`%${value}%`))
          break
        case '<': // less than
          where[key] = LessThan(value)
          break
        case '<=':
          where[key] = LessThanOrEqual(value)
          break
        case '>':
          where[key] = MoreThan(value)
          break
        case '>=':
          where[key] = MoreThanOrEqual(value)
          break
        case '!=':
          where[key] = Not(value)
          break
        case '<>': // between
          if (Array.isArray(value) && value.length === 2) {
            where[key] = Between(value[0] as number, value[1] as number)
          }
          break
        default: // '='
          where[key] = value
      }
    }
    return where
  }

  // Legacy where() for backwards compat — wraps buildWhere
  static where(
    query: Record<string, unknown>,
    ops: Record<string, string>
  ): Record<string, unknown> {
    return App.buildWhere(query, ops)
  }

  static buildOrder(
    order: Array<string | [string, 'ASC' | 'DESC']>,
    keys: string[]
  ): Record<string, 'ASC' | 'DESC'> {
    const result: Record<string, 'ASC' | 'DESC'> = {}
    for (const item of order) {
      let field: string
      let dir: 'ASC' | 'DESC' = 'ASC'
      if (Array.isArray(item) && item.length === 2 && ['ASC', 'DESC'].includes(item[1])) {
        field = item[0]
        dir = item[1] as 'ASC' | 'DESC'
      } else if (typeof item === 'string') {
        field = item
      } else {
        continue
      }
      if (!keys.includes(field)) continue
      result[field] = dir
    }
    return result
  }

  static order(
    order: Array<string | [string, 'ASC' | 'DESC']>,
    keys: string[]
  ): Record<string, 'ASC' | 'DESC'> {
    return App.buildOrder(order, keys)
  }

  static get ops() {
    return {
      equal: '=',
      notEqual: '!=',
      less: '<',
      lessOrEqual: '<=',
      greater: '>',
      greaterOrEqual: '>=',
      notLike: '!$',
      like: '$',
      between: '<>',
      notBetween: '!<>',
      in: '~'
    }
  }

  static res(data: unknown, msg: string = ''): object {
    return { state: 0, msg, data }
  }

  static ok(action: string, data?: unknown, customizeTip: boolean = false): object {
    return {
      state: 0,
      msg: action + (customizeTip ? '' : '成功！'),
      data
    }
  }

  static err(err: unknown): object {
    if ((err as AppError).isdefine) {
      return err as AppError
    }
    // Log full error internally but don't expose details to client
    console.warn((err as Error).message)
    if ((err as Error).stack) console.warn((err as Error).stack)
    return App.error.server()
  }

  static get error() {
    return {
      __count: 9,
      init(errorCode: number) {
        this.__count = errorCode
      },
      reg(msg: string, fn?: ((data: unknown) => unknown) | null): AppError | ((data: unknown) => AppError) {
        const errorCode = this.__count++
        if (fn) {
          return function (data: unknown) {
            return new AppError(errorCode, msg, fn(data))
          }
        }
        return new AppError(errorCode, msg)
      },
      existed(obj: string, exist: boolean = true, customizeTip: boolean = false): AppError {
        return new AppError(1, obj + (customizeTip ? '' : (exist ? '已存在！' : '不存在！')))
      },
      param: new AppError(2, '接口参数错误！'),
      query: new AppError(3, '无效查询条件！'),
      db(err: unknown): AppError {
        return new AppError(4, '数据库错误：' + err)
      },
      network(err: unknown): AppError {
        return new AppError(5, '网络错误：' + err)
      },
      limited: new AppError(6, '权限不足'),
      unauthorized: new AppError(7, '越权请求'),
      nologin: new AppError(8, '你没有登录或登录信息已过期！'),
      server(err?: unknown, stack?: unknown): AppError {
        if (err) console.warn(err)
        if (stack) console.warn(stack)
        return new AppError(-1, '服务器错误！' + (err ? err : ''))
      }
    }
  }

  // Helper: get entity column keys
  static getEntityKeys<T extends ObjectLiteral>(Entity: new () => T): string[] {
    const instance = new Entity()
    return Object.keys(instance).filter((k) => !['id', 'create_time', 'update_time'].includes(k))
  }
}

export default App
