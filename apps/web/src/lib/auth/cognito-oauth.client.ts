import type { OAuthClient } from "./oauth-client.interface";

function getCognitoOAuthConfig() {
  return {
    domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN ?? "",
    clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? "",
    region: process.env.NEXT_PUBLIC_COGNITO_REGION ?? "us-east-1",
    clientSecret: process.env.COGNITO_CLIENT_SECRET,
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  };
}

function assertConfigured(): void {
  const { domain, clientId } = getCognitoOAuthConfig();
  if (!domain || !clientId) {
    throw new Error(
      "OAuth provider is not configured. Run: pnpm cognito:setup (see README Authentication).",
    );
  }
}

function cognitoBaseUrl(): string {
  const { domain, region } = getCognitoOAuthConfig();
  return `https://${domain}.auth.${region}.amazoncognito.com`;
}

function sanitizeNextPath(nextPath: string): string {
  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/write";
  }
  return nextPath;
}

function encodeOAuthState(nextPath: string): string {
  return Buffer.from(sanitizeNextPath(nextPath)).toString("base64url");
}

function decodeOAuthState(state: string | null): string {
  if (!state) return "/write";
  try {
    return sanitizeNextPath(Buffer.from(state, "base64url").toString("utf8"));
  } catch {
    return "/write";
  }
}

export const cognitoOAuthClient: OAuthClient = {
  providerId: "cognito",

  buildAuthorizeUrl(nextPath: string) {
    assertConfigured();
    const { clientId, appUrl } = getCognitoOAuthConfig();
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: `${appUrl}/auth/callback`,
      scope: "openid email profile",
      state: encodeOAuthState(nextPath),
    });
    return `${cognitoBaseUrl()}/oauth2/authorize?${params}`;
  },

  buildLogoutUrl() {
    assertConfigured();
    const { clientId, appUrl } = getCognitoOAuthConfig();
    const params = new URLSearchParams({
      client_id: clientId,
      logout_uri: appUrl,
    });
    return `${cognitoBaseUrl()}/logout?${params}`;
  },

  async exchangeAuthorizationCode(code: string) {
    assertConfigured();
    const { clientId, appUrl, clientSecret } = getCognitoOAuthConfig();
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      code,
      redirect_uri: `${appUrl}/auth/callback`,
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    if (clientSecret) {
      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
        "base64",
      );
      headers.Authorization = `Basic ${credentials}`;
    }

    const response = await fetch(`${cognitoBaseUrl()}/oauth2/token`, {
      method: "POST",
      headers,
      body,
    });

    if (!response.ok) {
      throw new Error(`OAuth token exchange failed: ${await response.text()}`);
    }

    const payload = (await response.json()) as {
      access_token?: string;
      id_token?: string;
    };
    if (!payload.access_token || !payload.id_token) {
      throw new Error('OAuth token response missing access_token or id_token');
    }

    return {
      accessToken: payload.access_token,
      idToken: payload.id_token,
    };
  },
};

export { decodeOAuthState };
