# All Request Parameters Test

Tests $input.params() with foreach loops to iterate over all parameter types.

## Template
Uses #foreach to iterate over path, querystring, and header parameters.

## Input
Empty JSON object.

## Context
Contains params with path, querystring, and header values.

## Expected Behavior
- Should include all three parameter types
- AWS will include additional headers (CloudFront, etc.) which is expected

