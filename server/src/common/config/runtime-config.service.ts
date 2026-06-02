import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

import { loadRootConfig, RuntimeConfigShape, toPersistedRootConfig } from './root-config';

@Injectable()
export class RuntimeConfigService {
  get config(): RuntimeConfigShape {
    return loadRootConfig();
  }

  get isConfigured(): boolean {
    return this.config.configured;
  }

  get tablePrefix(): string {
    return this.config.db.prefix;
  }

  get userConfigPath(): string {
    return this.config.paths?.userConfig || '';
  }

  getTableName(name: string): string {
    return `${this.tablePrefix}${name}`;
  }

  save(config: RuntimeConfigShape) {
    fs.writeFileSync(this.userConfigPath, JSON.stringify(toPersistedRootConfig(config), null, 2));
  }
}
