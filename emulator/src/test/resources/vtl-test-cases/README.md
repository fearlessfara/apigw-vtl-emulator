# VTL Test Cases

This directory contains file-based test cases for the VTL emulator. Each test case is defined in its own folder with the following structure:

## Test Case Structure

Each test case folder should contain:

- **`template.vtl`** (required): The VTL template to test
- **`input.json`** (optional): The request body/input JSON. Defaults to `{}` if not present
- **`context.json`** (optional): The context variables as JSON. Defaults to `{}` if not present
- **`setup.json`** (required for AWS integration tests): Endpoint configuration for AWS API Gateway
  ```json
  {
    "endpoint": "/my-endpoint/{pathParam}",
    "method": "POST",
    "pathParams": {
      "pathParam": "value"
    },
    "queryParams": {
      "queryParam": "value"
    },
    "headers": {
      "Custom-Header": "value"
    }
  }
  ```
- **`README.md`** (optional): Description of what the test case validates

## Adding a New Test Case

To add a new test case:

1. Create a new folder under `vtl-test-cases/` with a descriptive name (e.g., `my-new-test`)
2. Add `template.vtl` with your VTL template
3. Add `input.json` if your test needs input data
4. Add `context.json` if your test needs context variables
5. Add `setup.json` if you want to test against AWS API Gateway (see structure above)
6. Optionally add `README.md` to document the test case

The test suite will automatically discover and run your test case!

**Note**: `setup.json` is only needed for AWS integration tests. Local tests (`VTLFileBasedTest`) don't require it.

## Running Tests

### Local Tests (No AWS Required)
```bash
mvn test -Dtest=VTLFileBasedTest
```

### AWS Integration Tests (Requires AWS Deployment)
```bash
export RUN_AWS_TESTS=true
export API_URL=https://your-api-id.execute-api.region.amazonaws.com/prod
mvn test -Dtest=AWSApiGatewayFileBasedIntegrationTest
```

## Current Test Cases

- **context-variables**: Tests mapping of $context variables
- **all-params**: Tests $input.params() with foreach loops
- **subsection**: Tests subsection of method request
- **jsonpath**: Tests JSONPath expression evaluation
- **jsonpath-size**: Tests JSONPath with .size() method
- **photo-album**: Tests complex foreach transformations
- **util-functions**: Tests $util functions (base64, url, escapeJavaScript)

