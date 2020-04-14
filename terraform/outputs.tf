output "auth0_secret_arn" {
  value = aws_secretsmanager_secret.auth0.arn
}

output "auth0_kms_key_arn" {
  value = aws_kms_key.auth0_kms_key.arn
}

output "sqs_queue_url" {
  value = data.aws_sqs_queue.attachments_notification_data.url
}