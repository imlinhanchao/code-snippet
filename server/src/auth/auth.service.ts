import { Injectable } from '@nestjs/common';

import { RuntimeConfigService } from '../common/config/runtime-config.service';

type RequestWithSession = {
  session?: {
    account_login?: {
      id: string;
      username: string;
      nickname: string;
      email: string;
      avatar: string;
    };
  };
};

@Injectable()
export class AuthService {
  constructor(private readonly runtimeConfigService: RuntimeConfigService) {}

  getSession(request: RequestWithSession) {
    if (!this.runtimeConfigService.isConfigured) {
      return {
        configured: false,
        user: null,
      };
    }

    return {
      configured: true,
      user: request.session?.account_login || null,
    };
  }
}
