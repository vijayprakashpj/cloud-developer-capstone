output "auth0_secret_arn" {
  value = aws_secretsmanager_secret.auth0.arn
}

output "auth0_kms_key_arn" {
  value = aws_kms_key.auth0_kms_key.arn
}
