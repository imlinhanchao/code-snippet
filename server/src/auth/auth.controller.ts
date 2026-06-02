import { Controller, Get, Req } from '@nestjs/common';

import { AuthService } from './auth.service';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('session')
  getSession(@Req() request: Request) {
    return this.authService.getSession(request as never);
  }
}
