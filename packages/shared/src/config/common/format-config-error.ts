import { z } from 'zod';

export function formatZodConfigError(error: z.ZodError): string {
  const issues = error.issues.map(
    (issue) => `${issue.path.join('.')}: ${issue.message}`,
  );
  return `Config validation failed:\n${issues.join('\n')}`;
}
