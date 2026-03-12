# VTL Emulator Frontend

React + Vite frontend for the VTL Emulator application.

## Development

```bash
npm install
npm run dev
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

The frontend uses `apigw-vtl-emulator@^1.2.0`, which now depends on the renamed `velocits` package. There is no engine selector in the UI.
