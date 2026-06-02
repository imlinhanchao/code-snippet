import { Controller, Get, Param } from '@nestjs/common';

import { AccountService } from './account.service';

@Controller('api/v1/accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get(':username/summary')
  getSummary(@Param('username') username: string) {
    return this.accountService.getSummary(username);
  }
}
