import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountModule } from './account/account.module';
import { AuthModule } from './auth/auth.module';
import { RuntimeConfigService } from './common/config/runtime-config.service';
import { CommentModule } from './comment/comment.module';
import { ConfigModule } from './config/config.module';
import { createEntitySchemas } from './database/entity-schemas';
import { FavModule } from './fav/fav.module';
import { SnippetModule } from './snippet/snippet.module';

const runtimeConfigService = new RuntimeConfigService();
const runtimeConfig = runtimeConfigService.config;
const entities = Object.values(createEntitySchemas(runtimeConfig.db.prefix));

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: runtimeConfig.db.host || 'localhost',
      port: runtimeConfig.db.port,
      username: runtimeConfig.db.user || 'root',
      password: runtimeConfig.db.password || '',
      database: runtimeConfig.db.database || 'code',
      synchronize: false,
      logging: runtimeConfig.db.logging,
      entities,
    }),
    ConfigModule,
    AuthModule,
    AccountModule,
    SnippetModule,
    CommentModule,
    FavModule,
  ],
})
export class AppModule {}
