# apigw-vtl-emulator (Java)

> Java implementation of AWS API Gateway VTL (Velocity Template Language) Emulator

A complete, fully-tested implementation of AWS API Gateway's VTL processor for JVM applications. Built on [Apache Velocity](https://velocity.apache.org/) and Jackson.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Complete AWS API Gateway VTL support** — `$input.*`, `$context.*`, `$util.*`, and VTL directives
- **Java 17+** — runs on modern JVMs
- **Fully tested** — shares the same VTL test suite as the TypeScript implementation

## Installation

### Maven

```xml
<dependency>
  <groupId>dev.vtlemulator</groupId>
  <artifactId>apigw-vtl-emulator</artifactId>
  <version>1.3.0</version>
</dependency>
```

### Gradle

```kotlin
implementation("dev.vtlemulator:apigw-vtl-emulator:1.3.0")
```

## Quick Start

```java
import dev.vtlemulator.engine.VTLProcessor;

VTLProcessor processor = new VTLProcessor();

String template = """
    {
      "message": $input.json('$.message'),
      "requestId": "$context.requestId",
      "stage": "$context.stage"
    }
    """;

String inputBody = "{\"message\":\"Hello, World!\"}";

String context = """
    {
      "requestId": "test-123",
      "stage": "prod",
      "httpMethod": "POST"
    }
    """;

String result = processor.process(template, inputBody, context);
// {"message":"Hello, World!","requestId":"test-123","stage":"prod"}
```

## API

```java
VTLProcessor processor = new VTLProcessor();

// template + context JSON only (empty input body)
processor.process(template, contextJson);

// template + input body + context JSON
processor.process(template, inputBody, contextJson);
```

## Building from Source

```bash
cd emulator/java
mvn clean test
mvn clean package
```

Optional fat JAR with bundled dependencies:

```bash
mvn clean package -Pstandalone
# target/apigw-vtl-emulator-1.3.0-standalone.jar
```

## Related Packages

| Platform | Coordinates |
|----------|-------------|
| npm | [`apigw-vtl-emulator`](https://www.npmjs.com/package/apigw-vtl-emulator) |
| Maven | `dev.vtlemulator:apigw-vtl-emulator` |

Both implementations share the same VTL compatibility test suite.

## License

MIT — see [LICENSE](LICENSE).
