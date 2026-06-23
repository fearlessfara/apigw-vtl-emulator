# Deployment Guide for Vercel

The frontend is a static Vite + React SPA. It has no server-side secrets and runs entirely in the browser.

## Security (public repository)

This repository is public. **Do not commit:**

- `.vercel/` (created by `vercel link`; contains project and team IDs)
- `.env*` files or Vercel tokens (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`)
- AWS or other cloud credentials

`.vercel/` is listed in the root `.gitignore`. Configure secrets only in the [Vercel dashboard](https://vercel.com/dashboard) or your local shell — never in git.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. Access to the GitHub repository

## Deploy via Git (recommended)

1. Go to [vercel.com/new](https://vercel.com/new) and import this repository.
2. Set **Root Directory** to `frontend` (required — the app is not at the repo root).
3. Vercel auto-detects Vite. Confirm these settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm ci` (or `npm install`)
4. Deploy. No environment variables are required for this app.
5. Add your custom domain (e.g. `vtlemulator.dev`) under **Project → Settings → Domains**.

`frontend/vercel.json` configures SPA rewrites and security headers. It is safe to commit — it contains no secrets.

## Deploy via CLI (optional)

From your machine (not committed to git):

```bash
cd frontend
npx vercel login
npx vercel link          # creates .vercel/ locally — do not commit
npx vercel --prod        # production deployment
```

## Local build verification

```bash
cd frontend
npm ci
npm run build
npm run preview
```

## File structure

```
frontend/
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   └── sitemap.xml
├── src/
├── vercel.json
└── package.json
```

## Migrating from AWS Amplify

1. Connect the repo to Vercel as above.
2. Point your domain DNS to Vercel.
3. Remove or disable the Amplify app once the Vercel deployment is verified.
