import 'server-only';

import { parseWebConfig } from '@memrider/shared/web-config';

const raw = parseWebConfig();

export const webConfig = {
  apiUrl: raw.NEXT_PUBLIC_API_URL,
  appUrl: raw.NEXT_PUBLIC_APP_URL,
  cognito: {
    domain: raw.NEXT_PUBLIC_COGNITO_DOMAIN,
    clientId: raw.NEXT_PUBLIC_COGNITO_CLIENT_ID,
    region: raw.NEXT_PUBLIC_COGNITO_REGION,
    clientSecret: raw.COGNITO_CLIENT_SECRET,
  },
} as const;
