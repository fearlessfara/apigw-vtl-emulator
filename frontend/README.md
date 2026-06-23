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

The build output will be in the `dist` directory, ready for deployment to Vercel.

## Deployment to Vercel

1. Import the repository in Vercel and set **Root Directory** to `frontend`.
2. `frontend/vercel.json` configures SPA rewrites and security headers.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full instructions. Do not commit `.vercel/` or tokens — this repo is public.

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
