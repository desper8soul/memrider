provider "aws" {
  region = var.aws_region
}

module "cognito" {
  source = "../../modules/cognito"

  pool_name     = var.pool_name
  domain_prefix = var.domain_prefix
  app_url       = var.app_url

  tags = {
    Project     = "memrider"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
