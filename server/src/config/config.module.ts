import { Module } from '@nestjs/common';

import { RuntimeConfigService } from '../common/config/runtime-config.service';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';

@Module({
  controllers: [ConfigController],
  providers: [ConfigService, RuntimeConfigService],
  exports: [ConfigService, RuntimeConfigService],
})
export class ConfigModule {}
