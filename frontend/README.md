# VTL Emulator Frontend

React 19 + Vite frontend for the VTL Emulator application.

## Development

```bash
npm install
npm run dev
```

## UI Smoke Tests

```bash
npx playwright install chromium
npm run test:e2e
```

## Build

```bash
npm run build
```

The build output will be in the `dist` directory, ready for deployment to AWS Amplify.

## Deployment to AWS Amplify

1. Connect your repository to AWS Amplify
2. The `amplify.yml` file will automatically configure the build process

## Features

- Monaco Editor with VTL syntax highlighting
- Multiple template tabs
- Body, Variables, Context, and Snippets editors
- Built-in Velocits engine
- Import/Export/Share functionality
- Debug mode
- Dark/Light theme
- Responsive design
- Keyboard shortcuts (`Ctrl/Cmd+Enter`, `Ctrl/Cmd+S`, `Ctrl/Cmd+Shift+S`, `Ctrl/Cmd+/`)
- Playwright smoke coverage for core flows

The frontend uses `apigw-vtl-emulator@^1.2.0`, which depends on the renamed `velocits` package. There is no engine selector in the UI.
