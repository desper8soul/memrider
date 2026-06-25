import { z } from 'zod';

import { formatZodConfigError } from '../common/format-config-error';
import { appConfigSchema, type AppConfig } from './app-config.schema';

export function parseAppConfig(config: Record<string, unknown> = process.env): AppConfig {
  try {
    return appConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(formatZodConfigError(error));
    }
    throw error;
  }
}
