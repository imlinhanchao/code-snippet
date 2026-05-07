import { AppDataSource } from '../database/data-source'
import { AccountEntity } from '../database/entities/AccountEntity'
import { TokenEntity } from '../database/entities/TokenEntity'
import { FollowEntity } from '../database/entities/FollowEntity'
import App from './App'
import ActivityModule from './Activity'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import nodemailer from 'nodemailer'
import { In } from 'typeorm'

let configData: Record<string, any> = {}
try {
  configData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'config.json'), 'utf8'))
} catch {
  // config not ready
}

const __salt: string = configData?.base?.salt || ''
const __tpl: Record<string, { data: string; path: string }> = {
  verify: {
    data: '',
    path: path.join(process.cwd(), 'frontend', 'assets', 'verify_mail.html')
  },
  forget: {
    data: '',
    path: ''
  }
}

const __error__ = Object.assign(
  {
    verify: App.error.reg('帐号或密码错误！'),
    captcha: App.error.reg('验证码错误！'),
    existed: App.error.existed('帐号'),
    existedmail: App.error.existed('邮箱'),
    notexisted: App.error.existed('帐号', false),
    notverify: App.error.existed('验证已失效', false, true),
    usertooshort: App.error.reg('用户名太短！'),
    passtooshort: App.error.reg('密码太短！')
  },
  App.error
)

interface SessionLike {
  account_login?: Record<string, unknown>
  captcha?: string
}

class AccountModule extends App {
  session: SessionLike
  safeKey: string[]
  activity: ActivityModule

  constructor(session: SessionLike) {
    super([
      { fun: App.success, name: 'oklogin', msg: '登录成功' },
      { fun: App.success, name: 'oklogout', msg: '登出成功' },
      { fun: App.success, name: 'okget', msg: '获取成功' },
      { fun: App.success, name: 'oksend', msg: '发送成功' },
      { fun: App.success, name: 'okverify', msg: '验证成功' },
      { fun: App.success, name: 'okfollow', msg: '关注成功' }
    ])
    this.session = session
    this.activity = new ActivityModule(session)
    this.name = '用户'
    this.safeKey = ['id'].concat(
      App.getEntityKeys(AccountEntity).filter((k) => k !== 'passwd')
    )
  }

  // Dynamic response methods
  oklogin!: (data?: unknown) => object
  oklogout!: (data?: unknown) => object
  okget!: (data?: unknown) => object
  oksend!: (data?: unknown) => object
  okverify!: (data?: unknown) => object
  okfollow!: (data?: unknown) => object

  get error() {
    return __error__
  }

  static get cache(): Record<string, number> {
    return { avatar: 86900 }
  }

  get islogin(): boolean {
    return !!(this.session && this.session.account_login)
  }

  get user(): Record<string, unknown> {
    if (!this.islogin) throw this.error.nologin
    return this.session.account_login!
  }

  async login(data: Record<string, unknown>): Promise<object> {
    const keys = ['username', 'passwd']
    if (!App.haskeys(data, keys)) throw this.error.param

    if ((data.username as string).length < 5) throw this.error.usertooshort as any
    if ((data.passwd as string).length < 5) throw this.error.passtooshort as any

    data = App.filter(data, keys)

    try {
      const account = await this.exist(data.username as string, true)
      if (!account) throw this.error.verify as any

      const sha256 = crypto.createHash('sha256')
      const passwd = sha256.update((data.passwd as string) + __salt).digest('hex')
      if ((account as any).passwd !== passwd) throw this.error.verify as any

      ;(account as any).lastlogin = Math.floor(Date.now() / 1000)
      const repo = AppDataSource.getRepository(AccountEntity)
      await repo.save(account as any)

      this.session.account_login = App.filter(
        account as Record<string, unknown>,
        ['id'].concat(App.getEntityKeys(AccountEntity))
      )
      return this.oklogin(App.filter(this.session.account_login, this.safeKey))
    } catch (err) {
      if ((err as any).isdefine) throw err
      throw this.error.network(err)
    }
  }

  async logout(): Promise<object> {
    this.session.account_login = undefined
    return this.oklogout(null)
  }

  async create(data: Record<string, unknown>, onlyData: boolean = false): Promise<unknown> {
    const keys = ['username', 'passwd']
    if (!App.haskeys(data, keys)) throw this.error.param

    const allKeys = App.getEntityKeys(AccountEntity)
    data = App.filter(data, allKeys.concat(['captcha']))

    try {
      if (this.session.captcha !== data.captcha) throw this.error.captcha as any

      if (data.email) {
        const repo = AppDataSource.getRepository(AccountEntity)
        const existing = await repo.findOne({ where: { email: data.email as string } })
        if (existing) throw this.error.existedmail as any
      }

      data.nickname = data.username
      data.lastlogin = Math.floor(Date.now() / 1000)
      const sha256 = crypto.createHash('sha256')
      data.passwd = sha256.update((data.passwd as string) + __salt).digest('hex')
      data.email = data.email || ''
      data.motto = data.motto || ''
      data.avatar = data.avatar || ''
      data.company = data.company || ''
      data.location = data.location || ''
      data.url = data.url || ''
      data.verify = false

      const account = await super.createRecord(data, AccountEntity, 'username')
      if (onlyData) return account
      return this.okcreate(App.filter(account, this.safeKey))
    } catch (err) {
      if ((err as any).isdefine) throw err
      throw this.error.db(err)
    }
  }

  async update(data: Record<string, unknown>): Promise<object> {
    const keys = ['username']
    if (!App.haskeys(data, keys)) throw this.error.param

    const allKeys = App.getEntityKeys(AccountEntity)
    data = App.filter(data, allKeys.concat(['id', 'oldpasswd']))

    try {
      const account = await this.info(true, allKeys) as Record<string, unknown>
      if (account.username !== data.username) throw this.error.limited

      data.username = undefined
      if (data.passwd) {
        const sha256 = crypto.createHash('sha256')
        const passwd = sha256.update((data.oldpasswd as string) + __salt).digest('hex')
        if (account.passwd !== passwd) throw this.error.verify as any
        const sha256b = crypto.createHash('sha256')
        data.passwd = sha256b.update((data.passwd as string) + __salt).digest('hex')
      }

      if (data.email && data.email !== account.email) {
        const repo = AppDataSource.getRepository(AccountEntity)
        const existing = await repo.findOne({ where: { email: data.email as string } })
        if (existing) throw this.error.existedmail as any
        data.verify = false
        const tokenRepo = AppDataSource.getRepository(TokenEntity)
        tokenRepo.delete({ username: account.username as string }).catch(() => {})
      }

      return this.okupdate(App.filter(await super.updateRecord(data, AccountEntity), this.safeKey))
    } catch (err) {
      if ((err as any).isdefine) throw err
      throw this.error.db(err)
    }
  }

  async exist(username: string, onlyData: boolean = false): Promise<unknown> {
    try {
      const repo = AppDataSource.getRepository(AccountEntity)
      const data = await repo.findOne({ where: { username } })
      if (onlyData) return data
      return this.okget(data ? App.filter(data as unknown as Record<string, unknown>, this.safeKey) : null)
    } catch (err) {
      if ((err as any).isdefine) throw err
      throw this.error.db(err)
    }
  }

  async exists(data: Record<string, unknown>): Promise<object> {
    const repo = AppDataSource.getRepository(AccountEntity)
    const account = await repo.findOne({
      where: data as any,
      select: ['id'] as any
    })
    return this.okget(!!account)
  }

  async avatar(username: string): Promise<object> {
    const repo = AppDataSource.getRepository(AccountEntity)
    const account = await repo.findOne({
      where: { username },
      select: ['avatar'] as any
    })
    return this.okget(account ? account.avatar : '')
  }

  async info(onlyData: boolean = false, fields?: string[]): Promise<unknown> {
    if (!this.islogin) throw this.error.nologin
    const repo = AppDataSource.getRepository(AccountEntity)
    const data = await repo.findOne({ where: { username: this.user.username as string } })
    if (!data) throw this.error.nologin
    const keys = fields || this.safeKey
    if (onlyData) return App.filter(data as unknown as Record<string, unknown>, keys)
    return this.okget(App.filter(data as unknown as Record<string, unknown>, keys))
  }

  async follow(data: Record<string, unknown>): Promise<object> {
    if (!this.islogin) throw this.error.nologin
    if (!App.haskeys(data, ['target'])) throw this.error.param

    const followRepo = AppDataSource.getRepository(FollowEntity)
    const existing = await followRepo.findOne({
      where: { username: this.user.username as string, target: data.target as string }
    })
    if (!existing) {
      const entity = new FollowEntity()
      entity.username = this.user.username as string
      entity.target = data.target as string
      await followRepo.save(entity)
      this.activity.follow(data, this.user.username as string)
    }
    return this.okfollow(null)
  }

  async unfollow(data: Record<string, unknown>): Promise<object> {
    if (!this.islogin) throw this.error.nologin
    if (!App.haskeys(data, ['target'])) throw this.error.param
    const followRepo = AppDataSource.getRepository(FollowEntity)
    await followRepo.delete({ username: this.user.username as string, target: data.target as string })
    this.activity.unfollow(data, this.user.username as string)
    return this.okget(null)
  }

  async isFollow(usernames: string[]): Promise<Record<string, boolean>> {
    if (!this.islogin || usernames.length === 0) return {}
    const followRepo = AppDataSource.getRepository(FollowEntity)
    const follows = await followRepo.find({
      where: { username: this.user.username as string, target: In(usernames) }
    })
    const result: Record<string, boolean> = {}
    follows.forEach((f) => { result[f.target] = true })
    return result
  }

  async following(data: { index?: number; count?: number } = {}): Promise<object> {
    const { index = 0, count = 20 } = data
    if (!this.islogin) throw this.error.nologin
    try {
      const followRepo = AppDataSource.getRepository(FollowEntity)
      const follows = await followRepo.find({
        where: { username: this.user.username as string },
        skip: index,
        take: count
      })
      const accountRepo = AppDataSource.getRepository(AccountEntity)
      const accounts = await accountRepo.find({
        where: { username: In(follows.map((f) => f.target)) }
      })
      return this.okget(accounts.map((a) => App.filter(a as unknown as Record<string, unknown>, this.safeKey)))
    } catch (err) {
      if ((err as any).isdefine) throw err
      throw this.error.db(err)
    }
  }

  async follower(data: { index?: number; count?: number } = {}): Promise<object> {
    const { index = 0, count = 20 } = data
    if (!this.islogin) throw this.error.nologin
    try {
      const followRepo = AppDataSource.getRepository(FollowEntity)
      const follows = await followRepo.find({
        where: { target: this.user.username as string },
        skip: index,
        take: count
      })
      const accountRepo = AppDataSource.getRepository(AccountEntity)
      const accounts = await accountRepo.find({
        where: { username: In(follows.map((f) => f.username)) }
      })
      return this.okget(accounts.map((a) => App.filter(a as unknown as Record<string, unknown>, this.safeKey)))
    } catch (err) {
      if ((err as any).isdefine) throw err
      throw this.error.db(err)
    }
  }

  async activities(data: Record<string, unknown> = {}): Promise<object> {
    const followRepo = AppDataSource.getRepository(FollowEntity)
    const follows = await followRepo.find({
      where: { username: this.user.username as string }
    }).then((fs) => fs.map((f) => f.target))
    return await this.activity.list({ ...data, follows } as any, this.user.username as string) as object
  }

  async makereaded(data: Record<string, unknown>): Promise<object> {
    return await this.activity.readed(data, this.user.username as string) as object
  }

  async query(
    query: Record<string, unknown>,
    fields: string[] | null = null,
    onlyData: boolean = false
  ): Promise<unknown> {
    const ops = {
      id: App.ops.in,
      username: App.ops.in
    }
    const filtered = App.filter(query, Object.keys(ops))
    try {
      const data = {
        index: 0,
        count: -1,
        query: filtered,
        fields: fields || this.safeKey.filter((k) => !['email'].includes(k))
      }
      const queryData = await super.findAll(data, AccountEntity, ops)
      const isFollow = await this.isFollow(queryData.data.map((d) => d.username as string))
      queryData.data.forEach((d) => {
        ;(d as any).isfollow = !!isFollow[d.username as string]
      })
      if (onlyData) return queryData
      return this.okquery(queryData)
    } catch (err) {
      throw err
    }
  }

  async sendverify(data: Record<string, unknown>, _onlyData: boolean = false): Promise<object> {
    const keys = ['username', 'email']
    if (!App.haskeys(data, keys)) throw this.error.param

    try {
      const account = await this.info(true) as Record<string, unknown>
      if (account.username !== data.username) throw this.error.limited

      const sha256 = crypto.createHash('sha256')
      const token = sha256
        .update((data.email as string) + new Date().getTime() + __salt)
        .digest('hex')

      const tokenRepo = AppDataSource.getRepository(TokenEntity)
      await tokenRepo.delete({ username: data.username as string })
      const tokenEntity = new TokenEntity()
      tokenEntity.username = data.username as string
      tokenEntity.token = token
      await tokenRepo.save(tokenEntity)

      const transporter = nodemailer.createTransport(configData.mail)
      const info = await transporter.sendMail({
        from: `"${configData.base?.name}" <${configData.mail?.auth?.user}>`,
        to: data.email as string,
        subject: '[Code Snippet] Please verify your email address',
        html: this.__makemail({ ...account, token, domain: configData.base?.domain }, 'verify')
      })

      return this.oksend(info)
    } catch (err) {
      throw err
    }
  }

  async verify(data: Record<string, unknown>, _onlyData: boolean = false): Promise<object> {
    const keys = ['username', 'token']
    if (!App.haskeys(data, keys)) throw this.error.param

    try {
      const tokenRepo = AppDataSource.getRepository(TokenEntity)
      const token = await tokenRepo.findOne({
        where: { username: data.username as string, token: data.token as string }
      })

      const yesterday = Math.floor((Date.now() - 86400000) / 1000)
      if (!token || token.create_time < yesterday) throw this.error.notverify as any

      const accountRepo = AppDataSource.getRepository(AccountEntity)
      const account = await accountRepo.findOne({ where: { username: data.username as string } })
      if (!account) throw this.error.notexisted as any
      account.verify = true
      await accountRepo.save(account)
      await tokenRepo.delete({ username: data.username as string })

      return this.okverify(data.username)
    } catch (err) {
      throw err
    }
  }

  __makemail(data: Record<string, unknown>, type: string): string {
    if (!__tpl[type]) return ''
    if (!__tpl[type].data && __tpl[type].path) {
      try {
        __tpl[type].data = fs.readFileSync(__tpl[type].path).toString()
      } catch {
        return ''
      }
    }
    let tpl = __tpl[type].data
    Object.keys(data).forEach((k) => {
      const value = String(data[k])
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
      tpl = tpl.replace(new RegExp(`{{${k}}}`, 'g'), value)
    })
    return tpl
  }
}

export default AccountModule
