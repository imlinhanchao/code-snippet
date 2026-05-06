import { Entity, Column, PrimaryColumn, BeforeInsert, BeforeUpdate } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { getTableName } from '../config'

@Entity({ name: getTableName('account') })
export class AccountEntity {
  @PrimaryColumn('varchar', { length: 36 })
  id: string = ''

  @BeforeInsert()
  generateId() {
    if (!this.id) this.id = uuidv4()
    const now = Math.floor(Date.now() / 1000)
    if (!this.create_time) this.create_time = now
    this.update_time = now
  }

  @BeforeUpdate()
  updateTimestamp() {
    this.update_time = Math.floor(Date.now() / 1000)
  }

  @Column('varchar', { length: 20 })
  username: string = ''

  @Column('varchar', { length: 20 })
  nickname: string = ''

  @Column('varchar', { length: 64 })
  passwd: string = ''

  @Column('varchar', { length: 100 })
  email: string = ''

  @Column('varchar', { length: 50, default: '' })
  company: string = ''

  @Column('varchar', { length: 20, default: '' })
  location: string = ''

  @Column('varchar', { length: 260, default: '' })
  url: string = ''

  @Column('varchar', { length: 200, default: '' })
  motto: string = ''

  @Column('varchar', { length: 200, default: '' })
  avatar: string = ''

  @Column('tinyint', { default: 0 })
  verify: boolean = false

  @Column('int', { nullable: true, default: 0 })
  lastlogin: number = 0

  @Column('int', { nullable: true, default: 0 })
  create_time: number = 0

  @Column('int', { nullable: true, default: 0 })
  update_time: number = 0
}
