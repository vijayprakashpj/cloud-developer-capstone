resource "aws_dynamodb_table" "todo" {
  name              = "${var.todosTableName}-${var.env}"
  billing_mode      = "PAY_PER_REQUEST"
  hash_key          = "todoId"
  range_key         = "userId"

  attribute {
    name = "todoId"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  global_secondary_index {
    name            = "${var.todosIndexName}-${var.env}"
    hash_key        = "userId"
    projection_type = "ALL"
  }

  local_secondary_index {
    name            = "${var.todosLocalIndexName}-${var.env}"
    hash_key        = "todoId"
    projection_type = "ALL"
  }
}
