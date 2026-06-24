#!/usr/bin/env bash
# Sync Cognito Terraform outputs into repo root .env (dev) or print them (staging/prod).
#
# Usage:
#   bash scripts/terraform-cognito-sync-env.sh dev
#
set -euo pipefail

ENV="${1:-dev}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env"
# shellcheck source=scripts/lib/terraform-cognito-stack.sh
source "${ROOT_DIR}/scripts/lib/terraform-cognito-stack.sh"

if ! command -v terraform >/dev/null 2>&1; then
  echo "terraform not found." >&2
  exit 1
fi

cognito_tf_select_workspace "$ENV"

if ! terraform -chdir="$COGNITO_TF_DIR" output -raw user_pool_id >/dev/null 2>&1; then
  echo "No Terraform outputs for workspace ${ENV}. Run: pnpm cognito:setup" >&2
  exit 1
fi

POOL_ID="$(terraform -chdir="$COGNITO_TF_DIR" output -raw user_pool_id)"
CLIENT_ID="$(terraform -chdir="$COGNITO_TF_DIR" output -raw client_id)"
CLIENT_SECRET="$(terraform -chdir="$COGNITO_TF_DIR" output -raw client_secret)"
DOMAIN_PREFIX="$(terraform -chdir="$COGNITO_TF_DIR" output -raw domain_prefix)"
REGION="$(terraform -chdir="$COGNITO_TF_DIR" output -raw region)"
APP_URL="$(terraform -chdir="$COGNITO_TF_DIR" output -raw app_url)"
HOSTED_UI="$(terraform -chdir="$COGNITO_TF_DIR" output -raw hosted_ui_base_url)"

ENV_BLOCK="$(cat <<EOF
# --- Cognito (from Terraform: infra/stacks/cognito, workspace ${ENV}) ---
AUTH_PROVIDER=cognito
COGNITO_USER_POOL_ID=${POOL_ID}
COGNITO_CLIENT_ID=${CLIENT_ID}

NEXT_PUBLIC_COGNITO_DOMAIN=${DOMAIN_PREFIX}
NEXT_PUBLIC_COGNITO_CLIENT_ID=${CLIENT_ID}
NEXT_PUBLIC_COGNITO_REGION=${REGION}
NEXT_PUBLIC_APP_URL=${APP_URL}
COGNITO_CLIENT_SECRET=${CLIENT_SECRET}
EOF
)"

if [[ "$ENV" != "dev" ]]; then
  echo "$ENV_BLOCK"
  echo ""
  echo "Hosted UI: ${HOSTED_UI}/login"
  exit 0
fi

touch "$ENV_FILE"
python3 - "$ENV_FILE" "$ENV_BLOCK" <<'PY'
import re
import sys

env_path, block = sys.argv[1], sys.argv[2]
text = open(env_path, encoding="utf-8").read()
for line in block.strip().splitlines():
    if line.startswith("#") or "=" not in line:
        continue
    key = line.split("=", 1)[0]
    pattern = re.compile(rf"^{re.escape(key)}=.*$", re.MULTILINE)
    if pattern.search(text):
        text = pattern.sub(line, text)
    else:
        text = text.rstrip() + "\n" + line + "\n"
open(env_path, "w", encoding="utf-8").write(text)
print(f"Updated {env_path}", file=sys.stderr)
PY

echo "Hosted UI: ${HOSTED_UI}/login" >&2
