resource "aws_cognito_user_pool" "main" {
  name = var.pool_name

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  tags = var.tags
}

resource "aws_cognito_user_pool_domain" "main" {
  domain       = var.domain_prefix
  user_pool_id = aws_cognito_user_pool.main.id
}

resource "aws_cognito_user_pool_client" "web" {
  name         = var.client_name
  user_pool_id = aws_cognito_user_pool.main.id

  generate_secret = true

  callback_urls = ["${var.app_url}/auth/callback"]
  logout_urls   = [var.app_url]

  allowed_oauth_flows                  = ["code"]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_scopes                 = ["openid", "email", "profile"]
  supported_identity_providers         = ["COGNITO"]

  explicit_auth_flows = [
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH",
  ]

  prevent_user_existence_errors = "ENABLED"
  enable_token_revocation       = true
}

resource "aws_cognito_user_pool_ui_customization" "hosted_ui" {
  user_pool_id = aws_cognito_user_pool.main.id

  css        = file("${path.module}/assets/hosted-ui.css")
  image_file = filebase64("${path.module}/assets/logo.png")

  depends_on = [
    aws_cognito_user_pool_domain.main,
    aws_cognito_user_pool_client.web,
  ]
}
