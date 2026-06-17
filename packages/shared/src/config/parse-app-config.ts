import { z } from 'zod';

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

function formatZodConfigError(error: z.ZodError): string {
  const issues = error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
  return `Config validation failed:\n${issues.join('\n')}`;
}
