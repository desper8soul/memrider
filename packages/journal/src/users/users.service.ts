import { Injectable } from '@nestjs/common';
import { PrismaService } from '@memrider/database/lib';
import { AuthProviderId } from '@memrider/shared';

import { toPrismaAuthProvider } from './auth-provider.mapper';

export interface AuthUserIdentity {
  authProvider: AuthProviderId;
  externalUserId: string;
  email?: string | null;
}

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findOrCreateFromAuth(identity: AuthUserIdentity) {
    const authProvider = toPrismaAuthProvider(identity.authProvider);

    return this.prismaService.client.user.upsert({
      where: {
        authProvider_externalUserId: {
          authProvider,
          externalUserId: identity.externalUserId,
        },
      },
      create: {
        authProvider,
        externalUserId: identity.externalUserId,
        email: identity.email ?? undefined,
      },
      update: {
        ...(identity.email ? { email: identity.email } : {}),
        deletedAt: null,
      },
    });
  }

  async softDelete(userId: string) {
    return this.prismaService.client.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
  }
}
