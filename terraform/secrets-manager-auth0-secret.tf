resource "aws_kms_key" "auth0_kms_key" {
  description   = "KMS key to encrypt Auth0 secret"
  policy        = <<EOF
{
    "Version": "2012-10-17",
    "Id": "key-default-1",
    "Statement": [
        {
            "Sid": "Allow administration of the key",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::${data.aws_caller_identity.default.account_id}:root"
            },
            "Action": "kms:*",
            "Resource": "*"
        }
    ]
}
  EOF
}

resource "aws_kms_alias" "auth0_kms_key_alias" {
  name              = "alias/auth0KeyId-${var.env}"
  target_key_id     = aws_kms_key.auth0_kms_key.id
}


resource "aws_secretsmanager_secret" "auth0" {
  name          = "${var.auth0SecretId}-${var.env}"
  description   = "Auth0 Key ID"
  kms_key_id    = aws_kms_key.auth0_kms_key.id
}
