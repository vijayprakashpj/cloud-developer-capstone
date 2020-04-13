resource "aws_s3_bucket" "attachments_bucket" {
  bucket            = "${var.attachmentsBucket}-${var.env}"
  acl               = "public-read"

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["*"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_policy" "attachments_bucket_policy" {
  bucket    = aws_s3_bucket.attachments_bucket.id

  policy            = <<EOF
{
  "Version": "2012-10-17",
  "Id": "TodoAttachmentsBucketPolicy",
  "Statement": [
    {
      "Sid": "PublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "${aws_s3_bucket.attachments_bucket.arn}/*"
    }
  ]
}
  EOF
}

resource "aws_s3_bucket_notification" "attachments_notification" {
  bucket      = aws_s3_bucket.attachments_bucket.id

  queue {
    queue_arn = aws_sqs_queue.attachments_notification.arn
    events    = [
      "s3:ObjectCreated:*",
      "s3:ObjectRemoved:*"
    ]
  }
}
