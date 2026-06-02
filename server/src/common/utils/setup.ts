import { ServiceUnavailableException } from '@nestjs/common';

import { RuntimeConfigService } from '../config/runtime-config.service';

export function assertConfigured(configService: RuntimeConfigService) {
  if (!configService.isConfigured) {
    throw new ServiceUnavailableException({
      code: 'SETUP_REQUIRED',
      message: 'Application is not configured yet.',
    });
  }
}
