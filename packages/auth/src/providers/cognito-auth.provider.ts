import { AuthProviderId } from '@memrider/shared';
import type { AppConfigService } from '@memrider/shared';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import type { AuthIdentity } from '../domain/auth-identity';
import type { AuthTokenVerifier } from './auth-provider.interface';

interface CognitoAccessClaims {
  sub: string;
  'cognito:groups'?: string[];
}

interface CognitoIdClaims {
  sub: string;
  email?: string;
  'cognito:groups'?: string[];
}

export class CognitoAuthProvider implements AuthTokenVerifier {
  readonly providerId = AuthProviderId.Cognito;

  private accessVerifier: ReturnType<typeof CognitoJwtVerifier.create> | null =
    null;
  private idVerifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;

  constructor(private readonly appConfigService: AppConfigService) {}

  async verifyAccessToken(token: string): Promise<AuthIdentity> {
    const claims = (await this.getAccessVerifier().verify(
      token,
    )) as CognitoAccessClaims;

    return {
      authProvider: this.providerId,
      externalUserId: claims.sub,
      email: null,
      roles: claims['cognito:groups'] ?? [],
    };
  }

  async verifyIdToken(token: string): Promise<AuthIdentity> {
    const claims = (await this.getIdVerifier().verify(token)) as CognitoIdClaims;

    return {
      authProvider: this.providerId,
      externalUserId: claims.sub,
      email: claims.email ?? null,
      roles: claims['cognito:groups'] ?? [],
    };
  }

  private getAccessVerifier() {
    if (!this.accessVerifier) {
      const { userPoolId, clientId } = this.appConfigService.auth.cognito;
      this.accessVerifier = CognitoJwtVerifier.create({
        userPoolId,
        tokenUse: 'access',
        clientId,
      });
    }

    return this.accessVerifier;
  }

  private getIdVerifier() {
    if (!this.idVerifier) {
      const { userPoolId, clientId } = this.appConfigService.auth.cognito;
      this.idVerifier = CognitoJwtVerifier.create({
        userPoolId,
        tokenUse: 'id',
        clientId,
      });
    }

    return this.idVerifier;
  }
}
