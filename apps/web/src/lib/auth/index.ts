import { cognitoOAuthClient, decodeOAuthState } from './cognito-oauth.client';

export { ACCESS_TOKEN_COOKIE } from './constants';

export function getOAuthClient() {
  return cognitoOAuthClient;
}

export { decodeOAuthState };
