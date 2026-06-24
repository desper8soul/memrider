import { AuthProviderId } from '@memrider/shared';

/** Normalized identity from any auth provider (before DB lookup). */
export interface AuthIdentity {
  authProvider: AuthProviderId;
  externalUserId: string;
  email: string | null;
  roles: string[];
}
