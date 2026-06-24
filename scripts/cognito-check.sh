#!/usr/bin/env bash
# Verifies Cognito env vars are present for local dev (AUTH_PROVIDER=cognito).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=scripts/lib/load-root-env.sh
source "${ROOT_DIR}/scripts/lib/load-root-env.sh"

missing=()

for key in \
  COGNITO_USER_POOL_ID \
  COGNITO_CLIENT_ID \
  COGNITO_CLIENT_SECRET \
  NEXT_PUBLIC_COGNITO_DOMAIN \
  NEXT_PUBLIC_COGNITO_CLIENT_ID \
  NEXT_PUBLIC_COGNITO_REGION \
  NEXT_PUBLIC_APP_URL; do
  value="$(get_root_env "$key" || true)"
  if [[ -z "$value" ]]; then
    missing+=("$key")
  fi
done

if ((${#missing[@]} == 0)); then
  exit 0
fi

cat >&2 <<EOF
Cognito is not configured for local dev. Missing in .env:
$(printf '  - %s\n' "${missing[@]}")

One-time setup (requires Terraform + AWS credentials):
  See infra/README.md

  pnpm infra:bootstrap
  cp infra/stacks/cognito/env/dev.tfvars.example infra/stacks/cognito/env/dev.tfvars
  pnpm cognito:setup
  pnpm cognito:user you@example.com 'YourDevPassword1!'
  pnpm dev

See README → Authentication and infra/README.md.
EOF
exit 1
