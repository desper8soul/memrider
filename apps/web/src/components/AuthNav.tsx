'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AuthUserSchema, type AuthUser } from '@memrider/shared/schemas';

export function AuthNav() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const res = await fetch('/api/memrider/auth/me', { cache: 'no-store' });
        if (!res.ok) {
          if (!cancelled) setUser(null);
          return;
        }
        const data = AuthUserSchema.parse(await res.json());
        if (!cancelled) setUser(data);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <span className="meta">…</span>;
  }

  if (user) {
    return (
      <>
        <span className="meta">{user.email ?? user.id}</span>
        <Link href="/auth/logout">Sign out</Link>
      </>
    );
  }

  return <Link href="/login">Sign in</Link>;
}
