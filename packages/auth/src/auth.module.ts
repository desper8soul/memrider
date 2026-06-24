import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JournalModule } from '@memrider/journal';
import { AppConfigService } from '@memrider/shared/config';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { AUTH_TOKEN_VERIFIER } from './providers/auth-provider.interface';
import { CognitoAuthProvider } from './providers/cognito-auth.provider';

@Global()
@Module({
  imports: [JournalModule],
  providers: [
    AuthService,
    AuthGuard,
    {
      provide: AUTH_TOKEN_VERIFIER,
      useFactory: (appConfigService: AppConfigService) =>
        new CognitoAuthProvider(appConfigService),
      inject: [AppConfigService],
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
