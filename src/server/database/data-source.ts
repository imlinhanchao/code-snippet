import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { dbConfig } from './config'
import { AccountEntity } from './entities/AccountEntity'
import { SnippetEntity } from './entities/SnippetEntity'
import { CodeEntity } from './entities/CodeEntity'
import { CommentEntity } from './entities/CommentEntity'
import { FavEntity } from './entities/FavEntity'
import { ActivityEntity } from './entities/ActivityEntity'
import { HistoryEntity } from './entities/HistoryEntity'
import { ChangeEntity } from './entities/ChangeEntity'
import { FollowEntity } from './entities/FollowEntity'
import { TokenEntity } from './entities/TokenEntity'

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: (dbConfig as any).host || 'localhost',
  port: (dbConfig as any).port || 3306,
  username: (dbConfig as any).user || 'root',
  password: (dbConfig as any).password || '',
  database: (dbConfig as any).database || 'code',
  synchronize: false,
  logging: (dbConfig as any).logging || false,
  entities: [
    AccountEntity,
    SnippetEntity,
    CodeEntity,
    CommentEntity,
    FavEntity,
    ActivityEntity,
    HistoryEntity,
    ChangeEntity,
    FollowEntity,
    TokenEntity
  ],
  charset: 'utf8mb4'
})

let initPromise: Promise<DataSource> | null = null

export async function ensureAppDataSourceInitialized(): Promise<DataSource> {
  if (AppDataSource.isInitialized) return AppDataSource
  if (!initPromise) {
    initPromise = AppDataSource.initialize().finally(() => {
      initPromise = null
    })
  }
  return initPromise
}
