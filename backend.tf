terraform {
  backend "s3" {
    bucket         = "vtl-terraform-bucket"
    key            = "vtl-emulator/terraform.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "vtl-terraform-lock"
    encrypt        = true
  }
}
