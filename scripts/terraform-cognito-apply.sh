#!/usr/bin/env bash
# Apply Cognito Terraform for an environment and sync dev outputs to .env.
#
# Usage:
#   pnpm cognito:setup              # dev (default)
#   bash scripts/terraform-cognito-apply.sh staging
#
set -euo pipefail

ENV="${1:-dev}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=scripts/lib/terraform-aws-credentials.sh
source "${ROOT_DIR}/scripts/lib/terraform-aws-credentials.sh"
# shellcheck source=scripts/lib/terraform-cognito-stack.sh
source "${ROOT_DIR}/scripts/lib/terraform-cognito-stack.sh"

if ! command -v terraform >/dev/null 2>&1; then
  cat >&2 <<'EOF'
terraform not found.

Install: https://developer.hashicorp.com/terraform/install
WSL example:
  wget -O /tmp/terraform.zip https://releases.hashicorp.com/terraform/1.9.8/terraform_1.9.8_linux_amd64.zip
  unzip -q /tmp/terraform.zip -d /tmp && sudo mv /tmp/terraform /usr/local/bin/
EOF
  exit 1
fi

terraform_ensure_aws_credentials
cognito_tf_select_workspace "$ENV"

echo "Applying Terraform for environment: ${ENV}" >&2
terraform -chdir="$COGNITO_TF_DIR" apply -var-file="env/${ENV}.tfvars"

bash "${ROOT_DIR}/scripts/terraform-cognito-sync-env.sh" "$ENV"

echo "" >&2
echo "Next: pnpm cognito:user you@example.com 'YourDevPassword1!'" >&2
echo "Then:  docker compose up -d && pnpm dev" >&2
