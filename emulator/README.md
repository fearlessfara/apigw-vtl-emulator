# VTL Processor Implementations

This directory contains two published implementations of AWS API Gateway VTL (Velocity Template Language) processor:

1. **Java Implementation** — JVM library on Maven Central (`dev.vtlemulator:apigw-vtl-emulator`)
2. **TypeScript Implementation** — npm package (`apigw-vtl-emulator`)

## Directory Structure

```
emulator/
├── java/                           # Java implementation (Maven)
│   ├── src/
│   │   ├── main/java/dev/vtlemulator/engine/
│   │   │   ├── VTLProcessor.java
│   │   │   ├── InputFunctions.java
│   │   │   ├── ContextFunctions.java
│   │   │   └── UtilFunctions.java
│   │   └── test/
│   │       ├── java/               # Unit tests
│   │       └── resources/vtl-test-cases/  # File-based test cases
│   ├── pom.xml
│   └── README.md
│
└── typescript/                     # TypeScript implementation (Velocits)
    ├── src/
    │   ├── engine/
    │   │   ├── VTLProcessor.ts
    │   │   ├── InputFunctions.ts
    │   │   ├── ContextFunctions.ts
    │   │   └── UtilFunctions.ts
    │   └── index.ts
    ├── tests/
    │   ├── unit/                   # Unit tests
    │   └── vtl-test-cases/         # File-based test cases (shared)
    ├── dist/                       # Built output
    ├── package.json
    └── tsconfig.json
```

## Overview

Both implementations provide complete AWS API Gateway VTL compatibility, including:

- **VTL Template Processing**: Parse and execute VTL templates
- **Input Functions**: `$input.json()`, `$input.params()`, `$input.body`, `$input.path()`
- **Context Functions**: `$context` variables (request metadata, identity, authorizer claims)
- **Utility Functions**: `$util` functions (string manipulation, encoding, JSON processing)

## Java Implementation

### Installation

```xml
<dependency>
  <groupId>dev.vtlemulator</groupId>
  <artifactId>apigw-vtl-emulator</artifactId>
  <version>1.2.0</version>
</dependency>
```

See [java/README.md](java/README.md) for full documentation.

### Prerequisites

- Java 17 or higher
- Maven 3.6 or higher

### Building

```bash
cd java
mvn clean package
```

### Running Tests

```bash
mvn test
```

### Usage

```java
import dev.vtlemulator.engine.VTLProcessor;

VTLProcessor processor = new VTLProcessor();
String result = processor.process(template, inputBody, contextJson);
```

## TypeScript Implementation

### Installation

```bash
npm install apigw-vtl-emulator
```

See [typescript/README.md](typescript/README.md) for full documentation.

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Building

```bash
cd typescript
npm install
npm run build
```

### Running Tests

```bash
npm test
```

### Usage

```typescript
import { VTLProcessor } from 'apigw-vtl-emulator';

const processor = new VTLProcessor();
const result = processor.process(template, inputBody, contextJson);
```

## Comparison

| Feature | Java | TypeScript (Velocits) |
|---------|------|----------------------|
| **Runtime** | JVM (Java 17+) | Node.js / browser |
| **Registry** | Maven Central | npm |
| **AWS Compatibility** | Full | Full |
| **Best for** | JVM backends, integration tests | Browser UI, Node.js apps |

## Test Suite

Both implementations share the same comprehensive test suite located in `java/src/test/resources/vtl-test-cases/`:

- 21+ file-based test cases
- Unit tests for all custom functions
- AWS API Gateway integration tests
- Edge case testing

### Running Tests Against Both Implementations

```bash
# Java tests
cd java && mvn test

# TypeScript tests (uses same test cases)
cd typescript && npm test
```

## Supported VTL Features

### Input Functions
- `$input.json(path)` - Parse JSON from input body using JSONPath
- `$input.params(name)` - Get parameter from request (path, query, header)
- `$input.body` - Raw request body as string
- `$input.path(path)` - Navigate input data structure
- `$input.headers(name)` - Get request header
- `$input.size()` - Get size of input array/object

### Context Variables
- `$context.requestId` - Unique request identifier
- `$context.accountId` - AWS account ID
- `$context.apiId` - API Gateway ID
- `$context.stage` - API Gateway stage
- `$context.requestTime` - Request timestamp
- `$context.requestTimeEpoch` - Request timestamp in epoch format
- `$context.httpMethod` - HTTP method
- `$context.resourcePath` - Resource path
- `$context.identity.*` - Identity information (sourceIp, userAgent, etc.)
- `$context.authorizer.*` - Authorizer claims

### Utility Functions
- `$util.escapeJavaScript(string)` - Escape string for JavaScript
- `$util.urlEncode(string)` - URL encode string
- `$util.urlDecode(string)` - URL decode string
- `$util.base64Encode(string)` - Base64 encode string
- `$util.base64Decode(string)` - Base64 decode string
- `$util.parseJson(jsonString)` - Parse JSON string

### Control Structures
- `#if(condition)`, `#elseif(condition)`, `#else` - Conditional blocks
- `#foreach($item in $collection)` - Loop over collections
- `#set($variable = value)` - Set variables
- `#break` - Break from loops
- `#stop` - Stop template processing
- `#end` - End blocks

## Frontend Integration

The frontend uses the TypeScript implementation via the `apigw-vtl-emulator` npm package.

## Development

### Adding New Features

1. Implement in both Java and TypeScript
2. Add test cases to `java/src/test/resources/vtl-test-cases/`
3. Run tests for both implementations
4. Update documentation

### Maintaining Compatibility

Both implementations must pass the same test suite to ensure AWS API Gateway compatibility. When making changes:

1. Update both implementations
2. Run full test suite
3. Verify frontend works with the TypeScript engine

## License

MIT — see LICENSE files in each implementation directory.
