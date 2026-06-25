import { getOAuthClient } from '@/lib/auth';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const loginUrl = getOAuthClient().buildAuthorizeUrl(next ?? '/write');

  return (
    <>
      <h1>Sign in</h1>
      <p className="lead">Sign in to access your personal memories.</p>
      {error && <p className="error">{error}</p>}
      <a href={loginUrl}>Sign in</a>
    </>
  );
}
