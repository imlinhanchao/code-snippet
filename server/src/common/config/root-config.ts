import * as path from 'path';

export interface RuntimeConfigShape {
  configured: boolean;
  base: {
    name: string;
    port: number;
    domain: string;
    preview_url: string;
    preview_domain: string;
    cnzz: string;
    identityKey: string;
    secret: string;
    salt: string;
    glot: string;
  };
  file: {
    upload: string;
    fileurl: string;
    maxSize: number;
  };
  mail: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      account: string;
      pass: string;
    };
  };
  db: {
    host: string;
    user: string;
    password: string;
    database: string;
    dialect: 'mysql';
    prefix: string;
    port: number;
    logging: boolean;
  };
  paths?: {
    root: string;
    userConfig: string;
  };
}

function loadConfigModule() {
  const target = path.resolve(__dirname, '../../../../config');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(target) as {
    loadRuntimeConfig?: () => RuntimeConfigShape;
    toPersistedConfig?: (config: RuntimeConfigShape) => Record<string, unknown>;
  } & RuntimeConfigShape;
}

export function loadRootConfig(): RuntimeConfigShape {
  const configModule = loadConfigModule();
  if (typeof configModule.loadRuntimeConfig === 'function') {
    return configModule.loadRuntimeConfig();
  }
  return configModule;
}

export function toPersistedRootConfig(config: RuntimeConfigShape) {
  const configModule = loadConfigModule();
  if (typeof configModule.toPersistedConfig === 'function') {
    return configModule.toPersistedConfig(config);
  }
  return config;
}
