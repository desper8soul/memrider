import { ConfigService } from '@nestjs/config';

import type { AppConfig } from './app-config.schema';
import { parseAppConfig } from './parse-app-config';
import { AppConfigService } from './app-config.service';

/** Build AppConfigService for scripts without bootstrapping Nest (seed, eval CLI). */
export function createAppConfigServiceFromEnv(
  env: Record<string, unknown> = process.env,
): AppConfigService {
  const config = parseAppConfig(env);
  const configService = {
    get: <K extends keyof AppConfig>(key: K) => config[key],
  } as ConfigService<AppConfig, true>;

  return new AppConfigService(configService);
}
