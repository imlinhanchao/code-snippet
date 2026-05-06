import { AppDataSource } from '../database/data-source'
import { CodeEntity } from '../database/entities/CodeEntity'
import { HistoryEntity } from '../database/entities/HistoryEntity'
import App from './App'
import { In } from 'typeorm'

const __error__ = Object.assign(
  { notexisted: App.error.existed('代码', false) },
  App.error
)

interface SessionLike {
  account_login?: Record<string, unknown>
}

interface CodeLike {
  id?: string
  filename: string
  content: string
  snippet: string
  order?: number
  input?: string
  command?: string
  execute?: boolean
  remove?: boolean
}

interface HistoryLike {
  file_id: string
  snippet: string
  pre_filename: string
  filename: string
  pre_content: string
  content: string
  modify_date: number
  change_id?: string
}

class CodeModule extends App {
  session: SessionLike
  safeKey: string[]

  constructor(session: SessionLike) {
    super([])
    this.session = session
    this.name = '代码'
    this.safeKey = ['id', 'create_time', 'update_time'].concat(App.getEntityKeys(CodeEntity))
  }

  get error() {
    return __error__
  }

  async create(codes: CodeLike[]): Promise<HistoryLike[]> {
    try {
      if (codes.length <= 0) return []
      const repo = AppDataSource.getRepository(CodeEntity)
      const toSave = codes.map((c) => {
        const e = new CodeEntity()
        Object.assign(e, { ...c, id: undefined })
        return e
      })
      const saved = await repo.save(toSave)
      return saved.map((c) => ({
        file_id: c.id,
        snippet: c.snippet,
        pre_filename: c.filename,
        filename: c.filename,
        pre_content: '',
        content: c.content,
        modify_date: Math.floor(Date.now() / 1000)
      }))
    } catch (err) {
      if ((err as any).isdefine) throw err
      throw this.error.db(err)
    }
  }

  async update(codes: CodeLike[]): Promise<HistoryLike[]> {
    try {
      if (codes.length <= 0) return []
      const ids = codes.map((c) => c.id as string)
      const repo = AppDataSource.getRepository(CodeEntity)
      const data = await repo.find({ where: { id: In(ids) } })

      const keys: (keyof CodeEntity)[] = ['filename', 'content', 'order', 'input', 'command', 'execute']
      const historys: HistoryLike[] = []

      for (const item of data) {
        const newData = codes.find((c) => c.id === item.id)
        if (!newData) continue
        if (App.isSame(item as unknown as Record<string, unknown>, newData as unknown as Record<string, unknown>, keys as string[])) continue
        const history: HistoryLike = {
          file_id: item.id,
          snippet: item.snippet,
          pre_filename: item.filename,
          filename: newData.filename,
          pre_content: item.content,
          content: newData.content,
          modify_date: Math.floor(Date.now() / 1000)
        }
        keys.forEach((k) => {
          (item as any)[k] = (newData as any)[k]
        })
        await repo.save(item)
        historys.push(history)
      }
      return historys
    } catch (err) {
      if ((err as any).isdefine) throw err
      throw this.error.db(err)
    }
  }

  async del(snippet: string): Promise<void> {
    try {
      const codeRepo = AppDataSource.getRepository(CodeEntity)
      const historyRepo = AppDataSource.getRepository(HistoryEntity)
      await codeRepo.delete({ snippet })
      await historyRepo.delete({ snippet })
    } catch (err) {
      if ((err as any).isdefine) throw err
      throw this.error.db(err)
    }
  }

  async remove(codes: CodeLike[]): Promise<HistoryLike[]> {
    try {
      if (codes.length <= 0) return []
      const repo = AppDataSource.getRepository(CodeEntity)
      const ids = codes.map((c) => c.id as string)
      await repo.delete({ id: In(ids) })
      return codes.map((c) => ({
        file_id: c.id as string,
        snippet: c.snippet,
        filename: c.filename,
        pre_content: c.content,
        content: '',
        pre_filename: c.filename,
        modify_date: Math.floor(Date.now() / 1000)
      }))
    } catch (err) {
      if ((err as any).isdefine) throw err
      throw this.error.db(err)
    }
  }

  async get(snippet: string): Promise<Record<string, unknown>[]> {
    try {
      const repo = AppDataSource.getRepository(CodeEntity)
      const codes = await repo.find({
        where: { snippet },
        order: { order: 'ASC' }
      })
      return codes.map((d) => App.filter(d as unknown as Record<string, unknown>, this.safeKey))
    } catch (err) {
      if ((err as any).isdefine) throw err
      throw this.error.db(err)
    }
  }

  async getAll(snippets: string[], _onlyData?: boolean): Promise<Record<string, unknown>[]> {
    try {
      const repo = AppDataSource.getRepository(CodeEntity)
      const codes = await repo.find({ where: { snippet: In(snippets) } })
      return codes.map((d) => App.filter(d as unknown as Record<string, unknown>, this.safeKey))
    } catch (err) {
      if ((err as any).isdefine) throw err
      throw this.error.db(err)
    }
  }

  async query(
    data: { query?: Record<string, unknown>; index?: number; count?: number; order?: any[]; fields?: string[] },
    onlyData: boolean = false
  ): Promise<unknown> {
    const ops = {
      filename: App.ops.like,
      content: App.ops.like,
      snippet: App.ops.equal,
      create_time: App.ops.less
    }

    try {
      const queryData = await super.findAll(data, CodeEntity, ops)
      if (onlyData) return queryData
      queryData.data = queryData.data.map((q) => App.filter(q, this.safeKey))
      return this.okquery(queryData)
    } catch (err) {
      if ((err as any).isdefine) throw err
      throw this.error.db(err)
    }
  }
}

export default CodeModule
