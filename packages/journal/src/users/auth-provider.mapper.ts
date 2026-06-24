import { AuthProvider } from '@memrider/database';
import { AuthProviderId } from '@memrider/shared';
import { match } from 'ts-pattern';

export function toPrismaAuthProvider(id: AuthProviderId): AuthProvider {
  return match(id)
    .with(AuthProviderId.Cognito, () => AuthProvider.cognito)
    .exhaustive();
}
