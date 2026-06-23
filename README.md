# VTL Emulator

**VTL Emulator** is a browser-based editor and emulator
for [Apache Velocity Template Language (VTL)](https://velocity.apache.org/engine/1.7/user-guide.html), designed to
simulate AWS API Gateway integration request/response templates.

---

## 🔍 What is this?

This tool lets you:

- Write and preview VTL templates live
- Simulate `$input`, `$util`, and `$context` variables
- Render and debug request/response flows
- Manage variables for headers, query params, stage variables, and paths
- Quickly test conditional blocks, loops, and transformations
- Use the built-in Velocits TypeScript engine for fast browser-side rendering without engine switching setup

---

## 🌐 Try it online

👉 **[https://vtlemulator.dev](https://vtlemulator.dev)**

⚠️ **No data is ever sent to any backend.** Everything runs 100% in your browser. Perfect for privacy-sensitive
workflows.

---

## 🚀 Engine

The VTL Emulator ships two published engine implementations:

| Platform | Package | Best for |
|----------|---------|----------|
| **TypeScript** (browser UI) | [`apigw-vtl-emulator`](https://www.npmjs.com/package/apigw-vtl-emulator) on npm | Browser and Node.js |
| **Java** | `dev.vtlemulator:apigw-vtl-emulator` on Maven Central | JVM backends and integration tests |

The frontend uses the TypeScript engine. Both implementations share the same VTL compatibility test suite.

### TypeScript (npm)

```bash
npm install apigw-vtl-emulator
```

### Java (Maven)

```xml
<dependency>
  <groupId>dev.vtlemulator</groupId>
  <artifactId>apigw-vtl-emulator</artifactId>
  <version>1.3.0</version>
</dependency>
```

See [`emulator/README.md`](./emulator/README.md) for engine development and usage details.

---

## 📁 Repository Structure

This repository contains:

| Path               | Description                                      |
|--------------------|--------------------------------------------------|
| `/index.html`      | Redirect page to the new website                |
| `/frontend/`       | React-based frontend application                 |
| `/emulator/`       | VTL engines published to npm and Maven Central     |
| `/img.png`         | Screenshot used in documentation                 |
| `/CONTRIBUTING.md` | Contribution guide for engine and UI development |

You can contribute to either the visual interface or the evaluation engine.

---

## 🧰 Features

- 🖊️ Monaco-based editor with syntax highlighting and autocompletion
- 📦 Snippets for common AWS API Gateway use-cases
- 📄 Compare VTL templates side-by-side
- 📥 Import/export template configurations
- 🎨 Light/Dark theme toggle
- 📋 Output preview with copy/share/download support
- 🔍 Debug panel showing render steps

---

## 📘 Screenshots

### Main Interface

The VTL Emulator provides a clean, intuitive interface with a Monaco-based code editor, real-time rendering, and comprehensive debugging tools.

![Main Interface](docs/screenshot-main.png)

### Variables Management

Easily manage query string parameters, path parameters, headers, and stage variables through an organized interface.

![Variables Tab](docs/screenshot-variables.png)

### Code Snippets Library

Access a comprehensive library of pre-built VTL snippets for common AWS API Gateway use cases, including input parsing, error handling, and Step Functions integration.

![Snippets Library](docs/screenshot-snippets.png)

### Example Usage

Here's a simple example showing how to use the VTL Emulator:

**1. Write your VTL template** - Create a template that processes input data and generates a response:

![Example Template](docs/example-template.png)

**2. Configure your input body** - Add JSON data that will be processed by the template:

![Example Body](docs/example-body.png)

**3. Render and view output** - Click the Render button to see the processed output:

![Example Output](docs/example-output.png)

The example above shows a VTL template that:
- Parses JSON input using `$util.parseJson($input.json('$'))` to convert the input string to a JSON object
- Accesses parsed input fields like `$inputRoot.name` and `$inputRoot.userId`
- Uses context variables like `$context.requestTime` for request metadata
- Generates a formatted JSON response with status code and body containing the processed data

---

## 🚀 Quick Start (for the UI)

The frontend is a React + Vite application. To run it locally:

```bash
git clone https://github.com/fearlessfara/apigw-vtl-emulator.git
cd apigw-vtl-emulator/frontend
npm install
npm run dev
```

Run UI smoke tests:

```bash
npx playwright install chromium
npm run test:e2e
```

Build for production:

```bash
npm run build
```

Or visit the live version at **[https://vtlemulator.dev](https://vtlemulator.dev)**

## 🧱 Frontend Stack

- React 19 + Vite
- Monaco Editor
- Radix UI primitives (dialog, dropdown, tabs, accordion)
- Custom CSS design system (no Bootstrap runtime/components)
- Playwright smoke tests for core user flows

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for full guidelines on contributing to either the UI or engine.

---

## 📝 License

MIT — © 2025 [Christian Gennaro Faraone](https://github.com/fearlessfara)
