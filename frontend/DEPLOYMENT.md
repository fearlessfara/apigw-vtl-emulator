# Deployment Guide for AWS Amplify

## Prerequisites

1. AWS Amplify Console access
2. The built `vtl-processor.jar` file from the Java project

## Steps

### 1. Build the Java JAR file

First, build the VTL processor JAR:

```bash
cd emulator
mvn clean package
```

This will create `emulator/target/vtl-processor.jar`

### 2. Copy JAR to frontend public directory

```bash
cp emulator/target/vtl-processor.jar frontend/public/vtl-processor.jar
```

### 3. Install dependencies

```bash
cd frontend
npm install
```

### 4. Test locally

```bash
npm run dev
```

### 5. Build for production

```bash
npm run build
```

### 6. Deploy to AWS Amplify

1. Go to AWS Amplify Console
2. Connect your repository
3. Amplify will automatically detect the `amplify.yml` file
4. The build process will:
   - Install dependencies
   - Build the React app
   - Deploy the `dist` folder

### 7. Configure Amplify

Make sure the following redirects are configured in Amplify:

- Source: `/<*>`
- Target: `/index.html`
- Type: `200 (Rewrite)`

This ensures React Router (if used) and direct URL access work correctly.

### 8. Environment Variables (if needed)

If you need to configure different paths for the JAR file, you can set environment variables in Amplify:

- `VTL_JAR_PATH`: Path to the JAR file (default: `/vtl-processor.jar`)

## File Structure

```
frontend/
├── public/
│   └── vtl-processor.jar  # Must be copied here before deployment
├── src/
│   ├── components/
│   ├── utils/
│   └── App.jsx
├── amplify.yml
└── package.json
```

## Notes

- The JAR file must be in the `public` directory so it's accessible at runtime
- CheerpJ will try multiple paths to find the JAR file
- The Vela engine (JavaScript) doesn't require the JAR file

