import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ACCESS_TOKEN_COOKIE, getOAuthClient } from '@/lib/auth';

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  return NextResponse.redirect(getOAuthClient().buildLogoutUrl());
}
