import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as session from 'express-session';
import * as path from 'path';

import { AppModule } from './app.module';
import { RuntimeConfigService } from './common/config/runtime-config.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

declare const require: {
  (name: string): unknown;
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const runtimeConfigService = new RuntimeConfigService();
  const config = runtimeConfigService.config;
  const fileStoreFactory = require('session-file-store') as (
    sessionLib: typeof session,
  ) => new (...args: unknown[]) => session.Store;
  const FileStore = fileStoreFactory(session);

  app.use(
    session({
      name: config.base.identityKey || '_WEB_SESSION_ID_MIGRATION',
      secret: config.base.secret || 'code-snippet-migration-secret',
      resave: false,
      saveUninitialized: false,
      store: new FileStore({
        path: path.resolve(process.cwd(), 'sessions'),
      }),
      cookie: {
        maxAge: 60 * 60 * 24 * 1000 * 365,
      },
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = Number(process.env.PORT || 3001);
  await app.listen(port);
}

bootstrap();
