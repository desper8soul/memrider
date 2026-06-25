#!/usr/bin/env bash
# Remote state backend helpers (S3 from infra/bootstrap).
#
# Usage (source after ROOT_DIR is set):
#   source scripts/lib/terraform-backend.sh
#   terraform_write_cognito_backend_hcl
#   terraform_cognito_init_backend
#
set -euo pipefail

TERRAFORM_BOOTSTRAP_DIR="${ROOT_DIR}/infra/bootstrap"

terraform_bootstrap_ready() {
  terraform -chdir="$TERRAFORM_BOOTSTRAP_DIR" output -raw state_bucket_name >/dev/null 2>&1
}

terraform_write_cognito_backend_hcl() {
  if ! terraform_bootstrap_ready; then
    echo "Bootstrap outputs not found. Run: pnpm infra:bootstrap" >&2
    exit 1
  fi

  local bucket region
  bucket="$(terraform -chdir="$TERRAFORM_BOOTSTRAP_DIR" output -raw state_bucket_name)"
  region="$(terraform -chdir="$TERRAFORM_BOOTSTRAP_DIR" output -raw aws_region)"

  cat >"${COGNITO_TF_DIR}/backend.hcl" <<EOF
bucket               = "${bucket}"
key                  = "cognito/terraform.tfstate"
workspace_key_prefix = "env"
region               = "${region}"
use_lockfile         = true
encrypt              = true
EOF

  echo "Wrote ${COGNITO_TF_DIR}/backend.hcl" >&2
}

terraform_cognito_init_backend() {
  local backend_hcl="${COGNITO_TF_DIR}/backend.hcl"

  if [[ ! -f "$backend_hcl" ]]; then
    terraform_write_cognito_backend_hcl
  fi

  local -a init_args=(-backend-config="$backend_hcl" -input=false)
  local local_state="${COGNITO_TF_DIR}/terraform.tfstate.d/${COGNITO_TF_ENV}/terraform.tfstate"

  if [[ -f "$local_state" ]]; then
    local bucket remote_key
    bucket="$(terraform -chdir="$TERRAFORM_BOOTSTRAP_DIR" output -raw state_bucket_name)"
    remote_key="env/${COGNITO_TF_ENV}/cognito/terraform.tfstate"
    if ! aws s3api head-object --bucket "$bucket" --key "$remote_key" >/dev/null 2>&1; then
      echo "Migrating local Terraform state to S3 (workspace ${COGNITO_TF_ENV})..." >&2
      init_args+=(-migrate-state -force-copy)
    fi
  fi

  terraform -chdir="$COGNITO_TF_DIR" init "${init_args[@]}"
}
