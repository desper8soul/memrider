output "user_pool_id" {
  value = module.cognito.user_pool_id
}

output "client_id" {
  value = module.cognito.client_id
}

output "client_secret" {
  value     = module.cognito.client_secret
  sensitive = true
}

output "domain_prefix" {
  value = module.cognito.domain_prefix
}

output "region" {
  value = module.cognito.region
}

output "app_url" {
  value = module.cognito.app_url
}

output "hosted_ui_base_url" {
  value = module.cognito.hosted_ui_base_url
}
