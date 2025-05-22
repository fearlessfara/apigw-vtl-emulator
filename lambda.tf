module "lambda_vtl_emulator" {
  source = "terraform-aws-modules/lambda/aws"

  function_name = "vtl-emulator"
  handler       = "lambda.handler"
  runtime       = "nodejs22.x"
  source_path   = "${path.module}/emulator"

  memory_size                             = 512
  timeout                                 = 5
  publish                                 = false
  create_current_version_allowed_triggers = false

  allowed_triggers = {
    apigw = {
      service    = "apigateway"
      source_arn = "${module.api_gateway.api_execution_arn}/*/*"
    }
  }
}
