resource "aws_sqs_queue" "attachments_notification" {
  name                        = "${var.attachmentsQueue}-${var.env}"
  visibility_timeout_seconds  = 900
}

resource "aws_sqs_queue_policy" "attachments_notification_iam_policy" {
  queue_url     = aws_sqs_queue.attachments_notification.id
  policy        = <<EOF
{
  "Version": "2012-10-17",
  "Id": "QueuePolicy",
  "Statement": [
    {
      "Sid": "S3Notification",
      "Effect": "Allow",
      "Action": [
        "sqs:SendMessage"
      ],
      "Principal": "*",
      "Resource": "${aws_sqs_queue.attachments_notification.arn}"
    }
  ]
}
  EOF
}
