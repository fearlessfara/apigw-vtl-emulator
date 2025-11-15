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
3. Make sure to copy the `vtl-processor.jar` file to the `public` directory for CheerpJ to load it

## Features

- Monaco Editor with VTL syntax highlighting
- Multiple template tabs
- Body, Variables, Context, and Snippets editors
- CheerpJ and Vela engine support
- Import/Export/Share functionality
- Debug mode
- Dark/Light theme
- Responsive design

