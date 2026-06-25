variable "environment" {
  type        = string
  description = "Deployment environment (dev, staging, prod). Also selects the Terraform workspace."
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be dev, staging, or prod."
  }
}

variable "aws_region" {
  type        = string
  description = "AWS region for Cognito."
}

variable "pool_name" {
  type        = string
  description = "Cognito User Pool name."
}

variable "domain_prefix" {
  type        = string
  description = "Globally unique Cognito domain prefix (e.g. memrider-dev-yourname)."
}

variable "app_url" {
  type        = string
  description = "Public app base URL (no trailing slash). Used for OAuth callback/logout URLs."
}
