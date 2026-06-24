import {
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '@memrider/journal';
import type { AuthIdentity } from './domain/auth-identity';
import type { AuthenticatedUser } from './domain/authenticated-user';
import {
  AUTH_TOKEN_VERIFIER,
  type AuthTokenVerifier,
} from './providers/auth-provider.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_TOKEN_VERIFIER) private readonly tokenVerifier: AuthTokenVerifier,
    private readonly usersService: UsersService,
  ) {}

  async authenticateBearerToken(token: string): Promise<AuthenticatedUser> {
    const identity = await this.tokenVerifier.verifyAccessToken(token);
    return this.resolveUser(identity);
  }

  async syncProfileFromIdToken(
    accessToken: string,
    idToken: string,
  ): Promise<AuthenticatedUser> {
    const accessIdentity = await this.tokenVerifier.verifyAccessToken(accessToken);
    const idIdentity = await this.tokenVerifier.verifyIdToken(idToken);

    if (accessIdentity.externalUserId !== idIdentity.externalUserId) {
      throw new UnauthorizedException('ID token does not match access token');
    }

    return this.resolveUser({
      ...accessIdentity,
      email: idIdentity.email,
    });
  }

  private async resolveUser(identity: AuthIdentity): Promise<AuthenticatedUser> {
    const user = await this.usersService.findOrCreateFromAuth(identity);
    return {
      id: user.id,
      email: user.email,
      roles: identity.roles,
    };
  }
}
