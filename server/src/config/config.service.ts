import { Injectable } from '@nestjs/common';

import { RuntimeConfigService } from '../common/config/runtime-config.service';
import { UpdateConfigDto } from './dto/update-config.dto';

@Injectable()
export class ConfigService {
  constructor(private readonly runtimeConfigService: RuntimeConfigService) {}

  status() {
    const config = this.runtimeConfigService.config;
    return {
      configured: config.configured,
      site: {
        name: config.base.name,
        domain: config.base.domain,
        previewDomain: config.base.preview_domain,
      },
    };
  }

  save(payload: UpdateConfigDto) {
    const current = this.runtimeConfigService.config;
    const next = {
      ...current,
      base: { ...current.base, ...(payload.base || {}) },
      file: { ...current.file, ...(payload.file || {}) },
      mail: {
        ...current.mail,
        ...(payload.mail || {}),
        auth: {
          ...current.mail.auth,
          ...(payload.mail?.auth || {}),
        },
      },
      db: { ...current.db, ...(payload.db || {}) },
      configured: true,
    };

    if (next.mail.auth.user && !next.mail.auth.account) {
      next.mail.auth.account = next.mail.auth.user;
    }

    this.runtimeConfigService.save(next);

    return this.status();
  }
}
