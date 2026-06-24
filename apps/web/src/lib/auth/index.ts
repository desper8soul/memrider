import { cognitoOAuthClient, decodeOAuthState } from './cognito-oauth.client';

export function getOAuthClient() {
  return cognitoOAuthClient;
}

export { decodeOAuthState };
export const ACCESS_TOKEN_COOKIE = 'memrider_access_token';

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}
