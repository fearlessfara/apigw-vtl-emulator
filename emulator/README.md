# apigw-vtl-emulator

**apigw-vtl-emulator** is a JavaScript library for evaluating [Apache Velocity Template Language (VTL)](https://velocity.apache.org/engine/1.7/user-guide.html) templates, simulating AWS API Gateway's integration request/response mapping behavior.

It uses `velocityjs` under the hood with custom method handlers to emulate `$input`, `$context`, and `$util` — matching AWS's behavior as closely as possible.

---

## 📦 Installation

```bash
npm install apigw-vtl-emulator
# or
pnpm add apigw-vtl-emulator
```

CDN (ESM module):

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/apigw-vtl-emulator@1.0.3/dist/index.mjs"></script>
```

---

## 🧪 Usage

```js
import { renderVTL } from 'apigw-vtl-emulator';

const template = `
{
  "message": "Hello, $input.path('$.name')",
  "isAdult": #if($input.json('$.age') >= 18) true #else false #end
}
`;

const event = {
  pathParameters: { name: "Alice" },
  body: JSON.stringify({ age: 22 }),
};

const output = renderVTL(template, event);
console.log(output);
```

Output:

```json
{
  "message": "Hello, Alice",
  "isAdult": true
}
```

---

## ⚙️ Features

- Emulates AWS API Gateway VTL behavior (`$input`, `$util`, `$context`)
- Supports conditionals, loops, JSONPath, encoding, and more
- Runs in **Node.js** and **modern browsers**
- Zero backend dependency — excellent for portability and privacy
- Ships with:
    - **ESM**: `dist/index.mjs`
    - **UMD**: `dist/index.umd.js` (global: `VTL`)

---

## 🛠 API

### `renderVTL(template: string, event: object): string`

- **template**: VTL template string
- **event**: Mock API Gateway request-style object

Returns: Rendered string output

---

## 📁 Project Structure

- `src/engine.js` — Main entry that parses and renders templates
- `src/handlers.js` — Implements method mappings for AWS-style `$input`, `$util`, `$context`
- `tests/` — Unit tests verifying handler correctness and output matching

---

## 🧪 Tests

To run tests:

```bash
npm test
```

Tests use Mocha plus Chai and live in the `tests/` directory.

---

## 🤝 Contributing

Contributions are welcome!

- Code lives in `src/`
- Tests go in `tests/`
- Please use real-world API Gateway payloads for input where possible

All PRs must include tests to be accepted.

---

## 📝 License

MIT — © 2025 [Christian Gennaro Faraone](https://github.com/fearlessfara)