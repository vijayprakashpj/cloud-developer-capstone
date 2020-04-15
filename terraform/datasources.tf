data "aws_caller_identity" "default" {}

data "aws_sqs_queue" "attachments_notification_data" {
  name = "${var.attachmentsQueue}-${var.env}"
}