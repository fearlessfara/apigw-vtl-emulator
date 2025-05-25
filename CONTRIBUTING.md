# Contributing to VTL Emulator Pro

Thanks for your interest in contributing to **VTL Emulator Pro**! 🎉  
Whether it's fixing a bug, improving the UI, adding a snippet, or extending the engine — you're very welcome.

---

## 📦 Repository Overview

This repo contains two main parts:

| Folder        | Description                                |
|---------------|--------------------------------------------|
| `/emulator/`  | Core VTL engine (published on NPM)         |
| `/` (root)    | The web UI (hosted via GitHub Pages)       |

---

## 🚀 Getting Started

1. **Clone the repo**

    ```
    git clone https://github.com/fearlessfara/apigw-vtl-emulator.git
    cd apigw-vtl-emulator
    ```

2. **Install dependencies**

    Navigate to the engine directory and install:

    ```
    cd emulator
    npm install
    ```

3. **Run tests**

    ```
    npm test
    ```

4. **Develop**

    You can test changes by running the web UI locally. Open `index.html` in a browser or use a simple server like:

    ```
    npx live-server
    # or
    python3 -m http.server
    ```

---

## ✅ Contribution Guidelines

### 🧠 Engine Contributions (`/emulator`)

If you're modifying or extending the engine:

- All changes must include **unit tests**
- Use realistic `event` objects that mimic AWS API Gateway
- Follow existing conventions and structure
- Keep everything browser-compatible

Tests go in:

```
emulator/tests/
```

Use Mocha + Chai syntax.

---

### 🌐 UI Contributions (web interface)

When working on the frontend:

- Keep components modular and styled using Bootstrap 5
- Avoid introducing non-essential dependencies
- Prefer vanilla JS unless it greatly simplifies complexity

---

## ✍️ Suggested Contributions

Some great areas to contribute:

- Add or improve `$input` / `$util` / `$context` handlers
- Add snippets for common API Gateway use-cases
- Improve Monaco editor integration
- Add formatting or linting helpers
- Fix bugs or improve test coverage

---

## 💡 Code Style

- JS: ES2020+ syntax
- Use `npm` as your package manager
- Keep functions pure and testable
- Avoid bloated packages — everything runs in-browser

---

## 📬 Opening a PR

1. Push your branch to GitHub
2. Open a Pull Request
3. Include:
    - A description of what you did
    - Screenshots or examples if it's UI-related
    - Linked issues (if any)
    - Mention if it's a breaking change

---

Thanks for contributing! 🎉 Let’s make VTL dev tooling awesome together.
