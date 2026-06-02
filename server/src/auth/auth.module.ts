import { Module } from '@nestjs/common';

import { RuntimeConfigService } from '../common/config/runtime-config.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, RuntimeConfigService],
  exports: [AuthService],
})
export class AuthModule {}
