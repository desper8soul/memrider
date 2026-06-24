variable "aws_region" {
  type        = string
  description = "AWS region for the Terraform state bucket and lock table."
  default     = "eu-central-1"
}

variable "project_name" {
  type        = string
  description = "Short project name used in resource names."
  default     = "memrider"
}
