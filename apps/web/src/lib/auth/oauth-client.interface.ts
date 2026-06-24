/** OAuth tokens returned after authorization code exchange. */
export interface OAuthTokens {
  accessToken: string;
  idToken: string;
}

/** OAuth client for browser-based login (web app only). */
export interface OAuthClient {
  readonly providerId: string;
  buildAuthorizeUrl(nextPath: string): string;
  buildLogoutUrl(): string;
  exchangeAuthorizationCode(code: string): Promise<OAuthTokens>;
}
