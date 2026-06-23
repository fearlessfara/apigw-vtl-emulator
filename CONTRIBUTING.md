# Contributing to VTL Emulator

Thanks for contributing. This repository has two main parts:

| Folder | Description |
| --- | --- |
| `frontend/` | React 19 + Vite UI for template editing and rendering |
| `emulator/typescript/` | Published TypeScript package (`apigw-vtl-emulator`) |
| `emulator/java/` | Legacy Java implementation and compatibility tests |

## Prerequisites

- Node.js (repo uses `asdf` and pins versions in `.tool-versions`)
- npm
- Java 21+ for `emulator/java`

## Local Development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Build and smoke tests:

```bash
npm run build
npx playwright install chromium
npm run test:e2e
```

### TypeScript Emulator Package

```bash
cd emulator/typescript
npm install
npm test
npm run build
```

### Java Emulator

```bash
cd emulator/java
mvn clean test
```

## UI Contribution Guidelines

- Keep the UX code-first and stable (editor workflow first, no visual churn for its own sake)
- Use the existing custom CSS system and UI primitives in `frontend/src/components/ui/`
- Radix primitives are used for dialog/dropdown/tabs/accordion behavior; keep styling in project CSS
- Avoid reintroducing Bootstrap runtime/components
- Add or update Playwright tests for user-facing behavior changes

## Engine Contribution Guidelines

- Include tests with all behavior changes
- Keep AWS API Gateway compatibility as the baseline
- Favor deterministic, browser-compatible behavior in the TypeScript package

## CI Expectations

PRs to `main` should pass:

- Frontend build + Playwright smoke tests
- TypeScript package checks/tests/build
- Java tests/build

## Pull Request Checklist

- Clear description of what changed and why
- Screenshots or short recordings for visible UI changes
- Updated docs when behavior/setup changes
- Tests added or updated for new functionality

Thanks again for helping improve VTL Emulator.
