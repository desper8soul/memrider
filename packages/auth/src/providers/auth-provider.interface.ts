import type { AuthIdentity } from '../domain/auth-identity';

export const AUTH_TOKEN_VERIFIER = Symbol('AUTH_TOKEN_VERIFIER');

/** Verifies access tokens and maps provider claims to a normalized identity. */
export interface AuthTokenVerifier {
  readonly providerId: string;
  verifyAccessToken(token: string): Promise<AuthIdentity>;
  verifyIdToken(token: string): Promise<AuthIdentity>;
}
