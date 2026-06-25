import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { webConfig } from '@/lib/config/web-config';
import {
  ACCESS_TOKEN_COOKIE,
  decodeOAuthState,
  getOAuthClient,
} from '@/lib/auth';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const error = request.nextUrl.searchParams.get('error');
  const state = request.nextUrl.searchParams.get('state');

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, request.url),
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
  }

  try {
    const { accessToken, idToken } =
      await getOAuthClient().exchangeAuthorizationCode(code);
    const cookieStore = await cookies();
    cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60,
    });

    const syncResponse = await fetch(`${webConfig.apiUrl}/auth/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ idToken }),
    });

    if (!syncResponse.ok) {
      console.error(
        'Profile sync failed:',
        syncResponse.status,
        await syncResponse.text(),
      );
    }

    const nextPath = decodeOAuthState(state);
    return NextResponse.redirect(new URL(nextPath, webConfig.appUrl));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'auth_failed';
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(message)}`, request.url),
    );
  }
}
