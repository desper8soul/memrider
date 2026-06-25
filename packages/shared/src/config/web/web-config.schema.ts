import { z } from 'zod';
import { match } from 'ts-pattern';

import { AuthProviderId, AwsRegion } from '../common/app-config.enum';

export const webConfigSchema = z
  .object({
    AUTH_PROVIDER: z.nativeEnum(AuthProviderId),
    NEXT_PUBLIC_API_URL: z.string().min(1),
    NEXT_PUBLIC_APP_URL: z.string().min(1),
    NEXT_PUBLIC_COGNITO_DOMAIN: z.string(),
    NEXT_PUBLIC_COGNITO_CLIENT_ID: z.string(),
    NEXT_PUBLIC_COGNITO_REGION: z.nativeEnum(AwsRegion),
    COGNITO_CLIENT_SECRET: z.string().optional(),
  })
  .superRefine((config, ctx) => {
    match(config.AUTH_PROVIDER)
      .with(AuthProviderId.Cognito, () => {
        if (!config.NEXT_PUBLIC_COGNITO_DOMAIN) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              'NEXT_PUBLIC_COGNITO_DOMAIN is required when AUTH_PROVIDER=cognito. Run: pnpm cognito:setup (see README Authentication).',
            path: ['NEXT_PUBLIC_COGNITO_DOMAIN'],
          });
        }
        if (!config.NEXT_PUBLIC_COGNITO_CLIENT_ID) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              'NEXT_PUBLIC_COGNITO_CLIENT_ID is required when AUTH_PROVIDER=cognito. Run: pnpm cognito:setup (see README Authentication).',
            path: ['NEXT_PUBLIC_COGNITO_CLIENT_ID'],
          });
        }
      })
      .exhaustive();
  });

export type WebConfig = z.infer<typeof webConfigSchema>;
