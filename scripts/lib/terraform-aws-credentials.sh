#!/usr/bin/env bash
# Export AWS CLI v2 login session credentials for Terraform (no-op if unavailable).
terraform_ensure_aws_credentials() {
  if command -v aws >/dev/null 2>&1 && aws configure export-credentials --format env >/dev/null 2>&1; then
    eval "$(aws configure export-credentials --format env)"
  fi
}
