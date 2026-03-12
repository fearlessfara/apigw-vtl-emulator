# Deployment Guide for AWS Amplify

## Prerequisites

1. AWS Amplify Console access

## Steps

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Test locally

```bash
npm run dev
```

### 3. Build for production

```bash
npm run build
```

### 4. Deploy to AWS Amplify

1. Go to AWS Amplify Console
2. Connect your repository
3. Amplify will automatically detect the `amplify.yml` file
4. The build process will:
   - Install dependencies
   - Build the React app
   - Deploy the `dist` folder

### 5. Configure Amplify

Make sure the following redirects are configured in Amplify:

- Source: `/<*>`
- Target: `/index.html`
- Type: `200 (Rewrite)`

This ensures React Router (if used) and direct URL access work correctly.

## File Structure

```
frontend/
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── components/
│   ├── utils/
│   └── App.jsx
├── amplify.yml
└── package.json
```

## Notes

- The frontend is fully client-side and does not require extra runtime assets
