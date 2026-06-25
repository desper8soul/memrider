#!/usr/bin/env bash
# Shared paths and workspace selection for the Cognito Terraform stack.
#
# Usage (source from other scripts):
#   source scripts/lib/terraform-cognito-stack.sh
#   cognito_tf_select_workspace dev
#   terraform -chdir="$COGNITO_TF_DIR" plan -var-file="$COGNITO_TF_VAR_FILE"
#
set -euo pipefail

cognito_tf_init() {
  local env="${1:?environment required}"

  COGNITO_TF_ENV="$env"
  COGNITO_TF_DIR="${ROOT_DIR}/infra/stacks/cognito"
  COGNITO_TF_VAR_FILE="${COGNITO_TF_DIR}/env/${env}.tfvars"

  if [[ ! -f "$COGNITO_TF_VAR_FILE" ]]; then
    cat >&2 <<EOF
Missing ${COGNITO_TF_VAR_FILE}

Copy and edit:
  cp infra/stacks/cognito/env/${env}.tfvars.example infra/stacks/cognito/env/${env}.tfvars
EOF
    exit 1
  fi
}

cognito_tf_select_workspace() {
  local env="${1:?environment required}"
  cognito_tf_init "$env"

  # shellcheck source=scripts/lib/terraform-backend.sh
  source "${ROOT_DIR}/scripts/lib/terraform-backend.sh"
  terraform_cognito_init_backend

  if terraform -chdir="$COGNITO_TF_DIR" workspace select "$env" >/dev/null 2>&1; then
    return 0
  fi

  terraform -chdir="$COGNITO_TF_DIR" workspace new "$env" >/dev/null
}
