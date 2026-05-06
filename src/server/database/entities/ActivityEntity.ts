import { Entity, Column, PrimaryColumn, BeforeInsert, BeforeUpdate } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { getTableName } from '../config'

@Entity({ name: getTableName('activity') })
export class ActivityEntity {
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

  @Column('int', { default: 0 })
  type: number = 0

  @Column('tinyint', { default: 0 })
  private: boolean = false

  @Column('varchar', { length: 36, default: '' })
  snippet: string = ''

  @Column('text', { nullable: true })
  source: string = ''

  @Column('varchar', { length: 36, default: '' })
  target: string = ''

  @Column('varchar', { length: 20, default: '' })
  notice: string = ''

  @Column('tinyint', { default: 0 })
  readed: boolean = false

  @Column('varchar', { length: 1024, default: '' })
  description: string = ''

  @Column('int', { nullable: true, default: 0 })
  create_time: number = 0

  @Column('int', { nullable: true, default: 0 })
  update_time: number = 0
}
