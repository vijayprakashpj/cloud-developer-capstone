terraform {
  required_version = ">= 0.12.9"  # https://github.com/hashicorp/terraform/releases
  backend "s3" {
    bucket         = "terraform-state-699472179837"
    key            = "terraform/udacity-todo.tfstate"
    dynamodb_table = "terraform_locks"
    region         = "eu-central-1"
  }
}

provider "aws" {
  version = "~> 2.31.0"
  region  = var.region
}