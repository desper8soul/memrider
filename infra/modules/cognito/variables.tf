variable "pool_name" {
  type        = string
  description = "Cognito User Pool name."
}

variable "domain_prefix" {
  type        = string
  description = "Hosted UI domain prefix (globally unique within the region)."
}

variable "client_name" {
  type        = string
  description = "App client name."
  default     = "memrider-web"
}

variable "app_url" {
  type        = string
  description = "Public app base URL (no trailing slash). Used for OAuth callback/logout URLs."
}

variable "tags" {
  type        = map(string)
  description = "Tags applied to supported resources."
  default     = {}
}
