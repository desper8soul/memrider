output "user_pool_id" {
  value       = aws_cognito_user_pool.main.id
  description = "Cognito User Pool ID."
}

output "client_id" {
  value       = aws_cognito_user_pool_client.web.id
  description = "OAuth app client ID."
}

output "client_secret" {
  value       = aws_cognito_user_pool_client.web.client_secret
  description = "OAuth app client secret."
  sensitive   = true
}

output "domain_prefix" {
  value       = aws_cognito_user_pool_domain.main.domain
  description = "Cognito Hosted UI domain prefix."
}

output "hosted_ui_base_url" {
  value       = "https://${aws_cognito_user_pool_domain.main.domain}.auth.${data.aws_region.current.name}.amazoncognito.com"
  description = "Cognito Hosted UI base URL."
}

output "region" {
  value       = data.aws_region.current.name
  description = "AWS region."
}

output "app_url" {
  value       = var.app_url
  description = "Configured application base URL."
}

data "aws_region" "current" {}
