import { Entity, Column, PrimaryColumn, BeforeInsert, BeforeUpdate } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { getTableName } from '../config'

@Entity({ name: getTableName('code') })
export class CodeEntity {
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

  @Column('varchar', { length: 50 })
  filename: string = ''

  @Column('text', { nullable: true })
  content: string = ''

  @Column('varchar', { length: 36 })
  snippet: string = ''

  @Column('int', { default: 0 })
  order: number = 0

  @Column('text', { nullable: true })
  input: string = ''

  @Column('varchar', { length: 64, default: '' })
  command: string = ''

  @Column('tinyint', { default: 0 })
  execute: boolean = false

  @Column('int', { nullable: true, default: 0 })
  create_time: number = 0

  @Column('int', { nullable: true, default: 0 })
  update_time: number = 0
}
