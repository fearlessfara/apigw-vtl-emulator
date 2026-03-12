# VTL Emulator - React Frontend

A complete React + Vite frontend that replicates all functionality from the original static HTML version.

## Features Implemented

✅ **Monaco Editor Integration**
- VTL syntax highlighting
- JSON editing for Body and Context
- Autocomplete for VTL functions
- Theme support (light/dark)

✅ **Multiple Template Tabs**
- Create, switch, and close template tabs
- Each template maintains its own content

✅ **Editor Tabs**
- Template editor with VTL syntax
- Body editor (JSON)
- Variables editor (Query String, Path, Headers, Stage Variables)
- Context editor (JSON)
- Snippets library

✅ **VTL Engines**
- Velocits (TypeScript) engine support
- Single built-in engine flow with initialization/loading states

✅ **Core Functionality**
- Render templates
- Auto-render mode
- Debug mode with step tracking
- Import/Export configurations
- Share via URL
- Copy/Download results

✅ **UI Features**
- Dark/Light theme toggle
- Settings modal
- Help modal
- Loading overlay
- Error display
- Performance stats
- Responsive design

✅ **AWS Amplify Ready**
- `amplify.yml` configuration
- Build scripts
- Public assets support

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── EditorTabs.jsx
│   │   ├── Header.jsx
│   │   ├── HelpModal.jsx
│   │   ├── LoadingOverlay.jsx
│   │   ├── ResultPanel.jsx
│   │   ├── SettingsModal.jsx
│   │   ├── SnippetsTab.jsx
│   │   ├── TemplateTabs.jsx
│   │   ├── Toolbar.jsx
│   │   └── VariablesTab.jsx
│   ├── utils/
│   │   ├── monacoConfig.js
│   │   ├── settings.js
│   │   ├── snippets.js
│   │   ├── uiUtils.js
│   │   └── vtlAdapters.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   └── sitemap.xml
├── amplify.yml
├── package.json
└── vite.config.js
```

## Getting Started

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Deployment to AWS Amplify

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Key Differences from Static HTML Version

1. **React Hooks**: All state management uses React hooks
2. **Component-based**: UI is split into reusable components
3. **Monaco Editor**: Uses `@monaco-editor/react` wrapper
4. **Modern Build**: Vite for fast development and optimized builds
5. **Type Safety**: Better structure for maintainability

## Notes

- Monaco Editor is loaded asynchronously
- All settings are persisted to localStorage
- Shared configurations are loaded from URL query parameters
