export const snippets = [
  {
    name: 'Basic Input JSON',
    description: 'Parse input as JSON',
    code: '$input.json("$")'
  },
  {
    name: 'Escape JavaScript',
    description: 'Escape string for JavaScript',
    code: '$util.escapeJavaScript($input.body)'
  },
  {
    name: 'URL Encode',
    description: 'URL encode a string',
    code: '$util.urlEncode($input.params("param"))'
  },
  {
    name: 'Base64 Encode',
    description: 'Base64 encode a string',
    code: '$util.base64Encode($input.body)'
  },
  {
    name: 'Get Query Parameter',
    description: 'Get a query string parameter',
    code: '$input.params("paramName")'
  },
  {
    name: 'Get Path Parameter',
    description: 'Get a path parameter',
    code: '$input.params("path.paramName")'
  },
  {
    name: 'Get Header',
    description: 'Get a request header',
    code: '$input.params("header.headerName")'
  },
  {
    name: 'Context Request ID',
    description: 'Get the request ID from context',
    code: '$context.requestId'
  },
  {
    name: 'Context User ID',
    description: 'Get user ID from Cognito claims',
    code: '$context.authorizer.claims.sub'
  },
  {
    name: 'Conditional Block',
    description: 'Simple if-else condition',
    code: '#if($input.params("param"))\n  "paramExists": true\n#else\n  "paramExists": false\n#end'
  },
  {
    name: 'Loop Through Array',
    description: 'Iterate over an array',
    code: '#foreach($item in $input.json("$.items"))\n  "$item.id": "$item.name"#if($foreach.hasNext),#end\n#end'
  },
  {
    name: 'Set Variable',
    description: 'Set a template variable',
    code: '#set($myVar = $input.json("$.someValue"))\n$myVar'
  },
  {
    name: 'Error Response',
    description: 'Standard error response format',
    code: '{\n  "error": {\n    "code": "$input.params(\'status\')",\n    "message": "$util.escapeJavaScript($input.body)",\n    "requestId": "$context.requestId"\n  }\n}'
  },
  {
    name: 'Success Response',
    description: 'Standard success response format',
    code: '{\n  "success": true,\n  "data": $input.json("$"),\n  "timestamp": "$context.requestTime",\n  "requestId": "$context.requestId"\n}'
  },
  {
    name: 'Invoke Step Function',
    description: 'Invoke a Step Function with idempotency key and stringified body',
    code: `{
  "stateMachineArn": "arn:aws:states:REGION:ACCOUNT_ID:stateMachine:YourStateMachineName",
  "name": "$context.requestTimeEpoch",
  "input": "{\\"idempotency_key\\": \\"$input.params().header['X-Idempotency-Key']\\", \\"request_body\\": $util.escapeJavaScript($input.body) }"
}`
  }
];

