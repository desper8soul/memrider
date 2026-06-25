#!/usr/bin/env bash
# Create a Cognito login for local dev (after pnpm cognito:setup).
#
# Usage:
#   pnpm cognito:user you@example.com 'YourDevPassword1!'
#   # or set COGNITO_DEV_EMAIL + COGNITO_DEV_PASSWORD in .env
#
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=scripts/lib/load-root-env.sh
source "${ROOT_DIR}/scripts/lib/load-root-env.sh"

EMAIL="${1:-$(get_root_env COGNITO_DEV_EMAIL 2>/dev/null || true)}"
PASSWORD="${2:-$(get_root_env COGNITO_DEV_PASSWORD 2>/dev/null || true)}"

POOL_ID="$(get_root_env COGNITO_USER_POOL_ID || true)"
REGION="$(get_root_env NEXT_PUBLIC_COGNITO_REGION || echo us-east-1)"

if ! command -v aws >/dev/null 2>&1; then
  echo "aws CLI not found. Install AWS CLI v2 (see README → Local Cognito workflow)." >&2
  exit 1
fi

if [[ -z "$POOL_ID" ]]; then
  echo "COGNITO_USER_POOL_ID is empty. Run: pnpm cognito:setup" >&2
  exit 1
fi

if [[ -z "$EMAIL" || -z "$PASSWORD" ]]; then
  cat >&2 <<'EOF'
Usage:
  pnpm cognito:user you@example.com 'YourDevPassword1!'

Or add to .env (gitignored):
  COGNITO_DEV_EMAIL=you@example.com
  COGNITO_DEV_PASSWORD=YourDevPassword1!
EOF
  exit 1
fi

echo "Creating Cognito user ${EMAIL} in pool ${POOL_ID}..." >&2

if aws cognito-idp admin-get-user \
  --region "$REGION" \
  --user-pool-id "$POOL_ID" \
  --username "$EMAIL" >/dev/null 2>&1; then
  echo "User already exists — setting permanent password." >&2
else
  aws cognito-idp admin-create-user \
    --region "$REGION" \
    --user-pool-id "$POOL_ID" \
    --username "$EMAIL" \
    --user-attributes "Name=email,Value=${EMAIL}" "Name=email_verified,Value=true" \
    --message-action SUPPRESS >/dev/null
  echo "User created." >&2
fi

aws cognito-idp admin-set-user-password \
  --region "$REGION" \
  --user-pool-id "$POOL_ID" \
  --username "$EMAIL" \
  --password "$PASSWORD" \
  --permanent >/dev/null

DOMAIN="$(get_root_env NEXT_PUBLIC_COGNITO_DOMAIN || true)"
echo "" >&2
echo "Ready. Sign in at http://localhost:3000/login" >&2
if [[ -n "$DOMAIN" ]]; then
  echo "Hosted UI: https://${DOMAIN}.auth.${REGION}.amazoncognito.com/login" >&2
fi
echo "Email: ${EMAIL}" >&2
