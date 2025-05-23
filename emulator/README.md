# apigw-vtl-emulator

**apigw-vtl-emulator** is a frontend-compatible JavaScript library that evaluates [Apache Velocity Template Language (VTL)](https://velocity.apache.org/engine/1.7/user-guide.html) templates in the browser or Node.js, simulating AWS API Gateway's mapping template behavior.

It uses `velocityjs` with custom method handlers to closely match how AWS handles `$input`, `$context`, and `$util` in integration request/response templates.

---

## 📦 Installation

```bash
npm install apigw-vtl-emulator
# or
pnpm add apigw-vtl-emulator
```

CDN:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/apigw-vtl-emulator@1.0.0/dist/vtl.mjs"></script>
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

- Emulates `$input`, `$util`, `$context` as in AWS API Gateway
- Works in **browsers** and **Node.js**
- No external backend — great for privacy and portability
- Ships as both ESM (`vtl.mjs`) and UMD (`vtl.umd.js`)

---

## 🛠 API

### `renderVTL(template: string, event: object): string`

- **template**: VTL template string.
- **event**: Mocked API Gateway event object.

---

## 📁 Project Structure

- `src/engine.js`: Main entry for rendering templates.
- `src/handlers.js`: Custom method handlers to simulate `$input`, `$util`, and `$context`.

---

## 🧪 Tests

To run tests:

```bash
npm test
```

Tests live in `tests/` and cover rendering correctness and handler behaviors.

---

## 🤝 Contributing

Merge requests are welcome!

- Add features or bug fixes in `src/`
- Include tests for all changes in `tests/`
- Use realistic API Gateway event mocks

Only well-tested features will be merged.

---

## 📝 License

MIT — © 2025 [Christian Gennaro Faraone](https://github.com/fearlessfara)