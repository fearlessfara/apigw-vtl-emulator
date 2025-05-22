module "api_gateway" {
  source  = "terraform-aws-modules/apigateway-v2/aws"
  version = "5.3.0"

  name          = "vtl-emulator"
  description   = "VTL emulator HTTP API Gateway"
  protocol_type = "HTTP"

  cors_configuration = {
    allow_origins = ["*"]
    allow_methods = ["*"]
    allow_headers = ["*"]
  }

  create_domain_records = false
  create_domain_name    = false

  routes = {
    "POST /vtl" = {

      integration = {
        uri                    = module.lambda_vtl_emulator.lambda_function_arn
        payload_format_version = "2.0"
        timeout_milliseconds   = 12000
      }
    }
  }

  tags = {
    "vtl" : "vtl"
  }
}

output "api_url" {
  description = "Invoke URL for the VTL emulator API"
  value       = module.api_gateway.api_endpoint
}

