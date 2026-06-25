#!/usr/bin/env bash
# One-time bootstrap: S3 remote state bucket.
# Bootstrap state stays local (infra/bootstrap/terraform.tfstate).
#
# Usage:
#   pnpm infra:bootstrap
#
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BOOTSTRAP_DIR="${ROOT_DIR}/infra/bootstrap"
TFVARS="${BOOTSTRAP_DIR}/terraform.tfvars"

# shellcheck source=scripts/lib/terraform-aws-credentials.sh
source "${ROOT_DIR}/scripts/lib/terraform-aws-credentials.sh"
# shellcheck source=scripts/lib/terraform-backend.sh
source "${ROOT_DIR}/scripts/lib/terraform-backend.sh"

if ! command -v terraform >/dev/null 2>&1; then
  echo "terraform not found. See infra/README.md" >&2
  exit 1
fi

if ! command -v aws >/dev/null 2>&1; then
  echo "aws CLI not found (needed for state migration checks)." >&2
  exit 1
fi

terraform_ensure_aws_credentials

if [[ ! -f "$TFVARS" ]]; then
  cat >&2 <<EOF
Missing ${TFVARS}

Copy and edit:
  cp infra/bootstrap/terraform.tfvars.example infra/bootstrap/terraform.tfvars
EOF
  exit 1
fi

echo "Applying Terraform bootstrap (S3 remote state bucket)..." >&2
terraform -chdir="$BOOTSTRAP_DIR" init -input=false
terraform -chdir="$BOOTSTRAP_DIR" apply

COGNITO_TF_DIR="${ROOT_DIR}/infra/stacks/cognito"
terraform_write_cognito_backend_hcl

echo "" >&2
echo "Remote state ready." >&2
echo "  Bucket: $(terraform -chdir="$BOOTSTRAP_DIR" output -raw state_bucket_name)" >&2
echo "  Locking: S3 native lock files (use_lockfile in stack backend.hcl)" >&2
echo "" >&2
echo "Next:" >&2
echo "  cp infra/stacks/cognito/env/dev.tfvars.example infra/stacks/cognito/env/dev.tfvars" >&2
echo "  pnpm cognito:setup" >&2
