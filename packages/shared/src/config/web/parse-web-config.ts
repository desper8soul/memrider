import { z } from 'zod';

import { formatZodConfigError } from '../common/format-config-error';
import { webConfigSchema, type WebConfig } from './web-config.schema';

export function parseWebConfig(
  config: Record<string, unknown> = process.env,
): WebConfig {
  try {
    return webConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(formatZodConfigError(error));
    }
    throw error;
  }
}
