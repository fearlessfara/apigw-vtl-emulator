# @fearlessfara/apigw-vtl-emulator

> TypeScript/JavaScript implementation of AWS API Gateway VTL (Velocity Template Language) Emulator

A complete, fully-tested implementation of AWS API Gateway's VTL processor that works in both Node.js and browser environments. Built on top of [`@fearlessfara/velocits`](https://github.com/fearlessfara/velocits), a TypeScript port of Apache Velocity.

[![npm version](https://badge.fury.io/js/@fearlessfara%2Fapigw-vtl-emulator.svg)](https://www.npmjs.com/package/@fearlessfara/apigw-vtl-emulator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

✨ **Complete AWS API Gateway VTL Support**
- All `$input.*` functions (`json`, `path`, `body`, `params`, etc.)
- Full `$context.*` variables (identity, authorizer, request metadata)
- All `$util.*` methods (base64, URL encoding, JSON parsing, etc.)
- Complete VTL directives (`#if`, `#foreach`, `#set`, etc.)

🚀 **Universal Support**
- Works in Node.js (≥16.0.0)
- Works in browsers (via bundlers like Vite, Webpack, etc.)
- Zero dependencies (except `@fearlessfara/velocits`)
- TypeScript support out of the box

✅ **Fully Tested**
- 44+ comprehensive test cases
- 100% AWS API Gateway compatibility
- Same test suite as the Java implementation

## Installation

```bash
npm install @fearlessfara/apigw-vtl-emulator
```

## Quick Start

### Basic Usage

```typescript
import { VTLProcessor } from '@fearlessfara/apigw-vtl-emulator';

const processor = new VTLProcessor();

// Define your VTL template
const template = `
{
  "message": $input.json('$.message'),
  "requestId": "$context.requestId",
  "stage": "$context.stage"
}
`;

// Input body (raw JSON string)
const inputBody = JSON.stringify({
  message: 'Hello, World!'
});

// Context (AWS API Gateway context)
const context = JSON.stringify({
  requestId: 'test-123',
  stage: 'prod',
  httpMethod: 'POST'
});

// Process the template
const result = processor.process(template, inputBody, context);
console.log(result);
// Output: {"message":"Hello, World!","requestId":"test-123","stage":"prod"}
```

### Node.js Example

```javascript
const { VTLProcessor } = require('@fearlessfara/apigw-vtl-emulator');

const processor = new VTLProcessor();
const result = processor.process(
  '$input.json("$")',
  '{"name":"John"}',
  '{}'
);
console.log(result); // {"name":"John"}
```

### Browser Example (React)

```tsx
import { VTLProcessor } from '@fearlessfara/apigw-vtl-emulator';
import { useState } from 'react';

function VTLEditor() {
  const [result, setResult] = useState('');
  const processor = new VTLProcessor();

  const handleRender = () => {
    const output = processor.process(
      template,
      inputBody,
      context
    );
    setResult(output);
  };

  return (
    <div>
      <button onClick={handleRender}>Render</button>
      <pre>{result}</pre>
    </div>
  );
}
```

## API Reference

### `VTLProcessor`

Main processor class for VTL templates.

#### `constructor()`

Creates a new VTL processor instance.

```typescript
const processor = new VTLProcessor();
```

#### `process(template, inputBody?, context?): string`

Processes a VTL template with the given input and context.

**Parameters:**
- `template` (string): The VTL template to process
- `inputBody` (string, optional): Raw input body as JSON string (default: `''`)
- `context` (string, optional): Context variables as JSON string (default: `'{}'`)

**Returns:** Processed template output as string

**Example:**
```typescript
const result = processor.process(
  'Hello $input.json("$.name")',
  '{"name":"World"}',
  '{}'
);
```

## Supported VTL Features

### Input Functions (`$input.*`)

- `$input.json(path)` - Parse JSON using JSONPath
- `$input.path(path)` - Get object for native VTL manipulation
- `$input.body` - Raw request body as string
- `$input.params(name)` - Get parameter (searches path → query → header)
- `$input.params()` - Get all parameters
- `$input.headers(name)` - Get specific header
- `$input.size()` - Get size of input array/object

### Context Variables (`$context.*`)

**Request Properties:**
- `$context.requestId`
- `$context.accountId`
- `$context.apiId`
- `$context.stage`
- `$context.httpMethod`
- `$context.requestTime`
- `$context.requestTimeEpoch`
- `$context.resourcePath`

**Identity:**
- `$context.identity.sourceIp`
- `$context.identity.userAgent`
- `$context.identity.accountId`
- `$context.identity.apiKey`
- And more...

**Authorizer:**
- `$context.authorizer.principalId`
- `$context.authorizer.claims`

### Utility Functions (`$util.*`)

- `$util.escapeJavaScript(string)` - Escape for JavaScript
- `$util.base64Encode(string)` - Base64 encode
- `$util.base64Decode(string)` - Base64 decode
- `$util.urlEncode(string)` - URL encode
- `$util.urlDecode(string)` - URL decode
- `$util.parseJson(string)` - Parse JSON string

### Control Structures

- `#if(condition)`, `#elseif(condition)`, `#else`
- `#foreach($item in $collection)`
- `#set($variable = value)`
- `#break`, `#stop`
- `#end`

## Advanced Examples

### Complex Template with Foreach

```velocity
{
  "items": [
    #foreach($item in $input.path('$.items'))
    {
      "id": "$item.id",
      "name": "$item.name",
      "index": $foreach.index
    }#if($foreach.hasNext),#end
    #end
  ]
}
```

### Conditional Logic

```velocity
#set($role = $context.authorizer.claims.role)
{
  "user": "$context.identity.user",
  "access": #if($role == "admin")"full"#else"limited"#end
}
```

### Parameter Mapping

```velocity
{
  "pathParam": "$input.params('id')",
  "queryParam": "$input.params('filter')",
  "header": "$input.headers('Authorization')"
}
```

## TypeScript Support

Full TypeScript definitions are included:

```typescript
import {
  VTLProcessor,
  InputFunctions,
  ContextFunctions,
  UtilFunctions
} from '@fearlessfara/apigw-vtl-emulator';

const processor: VTLProcessor = new VTLProcessor();
```

## Comparison with Java Implementation

This package provides identical functionality to the AWS API Gateway VTL processor:

| Feature | This Package | AWS API Gateway |
|---------|-------------|-----------------|
| Load Time | ~100ms | N/A |
| Bundle Size | ~500KB | N/A |
| Node.js Support | ✅ | ❌ |
| Browser Support | ✅ | ❌ |
| AWS Compatibility | ✅ 100% | ✅ |
| Test Coverage | 44+ tests | N/A |

## Testing

The package includes comprehensive tests:

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage
npm run test:coverage
```

## Building

```bash
# Build for both ESM and CJS
npm run build

# Build ESM only
npm run build:esm

# Build CJS only
npm run build:cjs

# Type check
npm run type-check
```

## Related Projects

- [`@fearlessfara/velocits`](https://github.com/fearlessfara/velocits) - TypeScript implementation of Apache Velocity
- [VTL Emulator Web App](https://github.com/fearlessfara/apigw-vtl-emulator) - Browser-based VTL testing tool

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Christian Faraone

## Support

- 🐛 [Report a bug](https://github.com/fearlessfara/apigw-vtl-emulator/issues)
- 💡 [Request a feature](https://github.com/fearlessfara/apigw-vtl-emulator/issues)
- 📖 [Documentation](https://github.com/fearlessfara/apigw-vtl-emulator)
