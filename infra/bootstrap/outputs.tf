output "aws_region" {
  value = var.aws_region
}

output "state_bucket_name" {
  value = aws_s3_bucket.terraform_state.id
}

output "account_id" {
  value = local.account_id
}
