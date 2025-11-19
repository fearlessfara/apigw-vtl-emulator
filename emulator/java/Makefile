.PHONY: help deploy test test-local clean destroy check-env

# Default target
help:
	@echo "VTL Compliance Testing Makefile"
	@echo ""
	@echo "Available targets:"
	@echo "  make deploy          - Deploy CDK stack to AWS"
	@echo "  make test            - Run AWS integration tests (requires deployment)"
	@echo "  make test-local      - Run local VTL tests only (no AWS required)"
	@echo "  make test-all        - Deploy and run all tests"
	@echo "  make destroy         - Destroy CDK stack"
	@echo "  make clean           - Clean build artifacts"
	@echo "  make check-env        - Check if AWS credentials and CDK are configured"
	@echo ""
	@echo "Environment variables:"
	@echo "  RUN_AWS_TESTS=true   - Enable AWS integration tests"
	@echo "  API_URL=<url>        - API Gateway URL (auto-set after deploy)"

# Check if required tools and credentials are available
check-env:
	@echo "Checking prerequisites..."
	@command -v aws-vault >/dev/null 2>&1 || { echo "❌ aws-vault not found. Install: brew install aws-vault"; exit 1; }
	@command -v npx >/dev/null 2>&1 || { echo "❌ npx not found. Install Node.js"; exit 1; }
	@echo "✅ Prerequisites check passed"

# Compile test classes
compile:
	@echo "Compiling test classes..."
	mvn test-compile -DskipTests

# Deploy CDK stack
deploy: check-env compile
	@echo "🚀 Deploying CDK stack..."
	@aws-vault exec personal --no-session -- npx cdk deploy --require-approval never
	@echo ""
	@echo "✅ Deployment complete!"
	@echo "📝 Set API_URL environment variable from the CDK output above"
	@echo "   Or run: export API_URL=$$(make get-api-url)"

# Run local tests only (no AWS required)
test-local:
	@echo "🧪 Running local VTL tests..."
	mvn test -Dtest=VTLFileBasedTest

# Run AWS integration tests
test: check-env
	@if [ -z "$$RUN_AWS_TESTS" ] || [ "$$RUN_AWS_TESTS" != "true" ]; then \
		echo "⚠️  RUN_AWS_TESTS not set to 'true'. Skipping AWS tests."; \
		echo "   Set RUN_AWS_TESTS=true and API_URL=<your-api-url> to run AWS tests."; \
		exit 0; \
	fi
	@if [ -z "$$API_URL" ]; then \
		echo "❌ API_URL not set. Get it from 'make deploy' output or run: make get-api-url"; \
		exit 1; \
	fi
	@echo "🧪 Running AWS integration tests..."
	@echo "   API_URL: $$API_URL"
	RUN_AWS_TESTS=true API_URL=$$API_URL mvn test -Dtest=AWSApiGatewayFileBasedIntegrationTest

# Deploy and run all tests
test-all: deploy
	@echo ""
	@echo "🧪 Running all tests..."
	@API_URL=$$(make get-api-url 2>/dev/null | tr -d '\n' | tr -d ' ') && \
		echo "   API_URL: $$API_URL" && \
		RUN_AWS_TESTS=true API_URL=$$API_URL mvn test -Dtest=AWSApiGatewayFileBasedIntegrationTest

# Destroy CDK stack
destroy: check-env
	@echo "🗑️  Destroying CDK stack..."
	@read -p "Are you sure you want to destroy the stack? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		aws-vault exec personal --no-session -- npx cdk destroy --force; \
	else \
		echo "Cancelled."; \
	fi

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	mvn clean
	@echo "✅ Clean complete"

# Get API URL from CloudFormation stack outputs
get-api-url:
	@aws-vault exec personal --no-session -- aws cloudformation describe-stacks --stack-name VtlComparisonStack --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' --output text 2>/dev/null | tr -d '\n' | tr -d ' '

