import { Module } from '@nestjs/common';

import { RuntimeConfigService } from '../common/config/runtime-config.service';
import { SnippetController } from './snippet.controller';
import { SnippetService } from './snippet.service';

@Module({
  controllers: [SnippetController],
  providers: [SnippetService, RuntimeConfigService],
  exports: [SnippetService],
})
export class SnippetModule {}
