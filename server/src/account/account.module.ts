import { Module } from '@nestjs/common';

import { RuntimeConfigService } from '../common/config/runtime-config.service';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
  controllers: [AccountController],
  providers: [AccountService, RuntimeConfigService],
  exports: [AccountService],
})
export class AccountModule {}
