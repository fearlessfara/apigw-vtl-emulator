# VTL Processor (Java)

A Java-based Apache Velocity Template Language (VTL) processor for AWS API Gateway mapping templates.

## Overview

This project provides a Java implementation of VTL processing that can be used to test and validate AWS API Gateway mapping templates. It supports all the standard VTL functions and context variables that are available in AWS API Gateway.

## Features

- **VTL Template Processing**: Parse and execute VTL templates with full AWS API Gateway compatibility
- **Input Functions**: Support for `$input.json()`, `$input.params()`, `$input.body`, `$input.path()`
- **Context Functions**: Access to `$context` variables including request metadata, identity, and authorizer claims
- **Utility Functions**: Complete implementation of `$util` functions for string manipulation, encoding, and JSON processing
- **CheerpJ Integration**: Can be compiled to WebAssembly for browser-based execution

## Project Structure

```
emulator/
├── src/
│   ├── main/
│   │   └── java/
│   │       └── com/
│   │           └── example/
│   │               ├── VTLProcessor.java      # Main VTL processing engine
│   │               ├── ContextFunctions.java  # Context variable handling
│   │               ├── InputFunctions.java    # Input data processing
│   │               └── UtilFunctions.java     # Utility functions
│   └── test/
│       └── java/
│           └── com/
│               └── example/
│                   └── [Test files]
├── target/
│   └── vtl-processor.jar                      # Compiled JAR file
├── pom.xml                                    # Maven configuration
└── README.md                                  # This file
```

## Building

### Prerequisites

- Java 11 or higher
- Maven 3.6 or higher

### Build Commands

```bash
# Compile the project
mvn compile

# Run tests
mvn test

# Package into JAR
mvn package

# Clean build
mvn clean package
```

The compiled JAR file will be available at `target/vtl-processor.jar`.

## Usage

### Java API

```java
import dev.vtlemulator.engine.VTLProcessor;

VTLProcessor processor = new VTLProcessor();

// Process a VTL template
String template = "$input.json('$.name')";
String input = "{\"name\": \"John Doe\"}";
String context = "{\"requestId\": \"123\"}";

String result = processor.process(template, input, context);
System.out.println(result); // Output: John Doe
```

### CheerpJ Integration

The JAR file can be loaded in a web browser using CheerpJ:

```javascript
// Initialize CheerpJ
await cheerpjInit({version: 17});

// Load the JAR
const lib = await cheerpjRunLibrary('/emulator/target/vtl-processor.jar');

// Get the VTLProcessor class
const VTLProcessorClass = await lib.dev.vtlemulator.engine.VTLProcessor;

// Create an instance
const processor = await new VTLProcessorClass();

// Process templates
const result = await processor.process(template, input, context);
```

## Supported VTL Features

### Input Functions
- `$input.json(path)` - Parse JSON from input body using JSONPath
- `$input.params(name)` - Get parameter from request (query, path, header)
- `$input.body` - Raw request body as string
- `$input.path(path)` - Get path parameter

### Context Variables
- `$context.requestId` - Unique request identifier
- `$context.accountId` - AWS account ID
- `$context.apiId` - API Gateway ID
- `$context.stage` - API Gateway stage
- `$context.requestTime` - Request timestamp
- `$context.requestTimeEpoch` - Request timestamp in epoch format
- `$context.httpMethod` - HTTP method
- `$context.resourcePath` - Resource path
- `$context.authorizer.claims` - Cognito JWT claims
- `$context.identity.sourceIp` - Client source IP
- `$context.identity.userAgent` - Client user agent

### Utility Functions
- `$util.escapeJavaScript(string)` - Escape string for JavaScript
- `$util.urlEncode(string)` - URL encode string
- `$util.urlDecode(string)` - URL decode string
- `$util.base64Encode(string)` - Base64 encode string
- `$util.base64Decode(string)` - Base64 decode string
- `$util.parseJson(jsonString)` - Parse JSON string
- `$util.toJson(object)` - Convert object to JSON string

### Control Structures
- `#if(condition)` - Conditional blocks
- `#elseif(condition)` - Else if conditions
- `#else` - Else blocks
- `#foreach(item in collection)` - Loop over collections
- `#set($variable = value)` - Set variables
- `#end` - End blocks
- `#break` - Break from loops
- `#stop` - Stop template processing

## Testing

Run the test suite to verify functionality:

```bash
mvn test
```

Tests cover:
- Basic VTL syntax
- Input function processing
- Context variable access
- Utility function operations
- Conditional and loop structures
- Error handling

## Integration

This VTL processor is designed to be integrated into web applications using CheerpJ, providing a complete VTL testing environment in the browser. It's used by the main VTL Emulator application to provide accurate VTL processing capabilities.

## License

This project is part of the VTL Emulator suite and follows the same licensing terms.