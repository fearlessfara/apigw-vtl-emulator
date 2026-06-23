# Contributing to VTL Emulator

Thanks for contributing. This repository has two main parts:

| Folder | Description |
| --- | --- |
| `frontend/` | React 19 + Vite UI for template editing and rendering |
| `emulator/typescript/` | Published TypeScript package (`apigw-vtl-emulator` on npm) |
| `emulator/java/` | Published Java library (`dev.vtlemulator:apigw-vtl-emulator` on Maven Central) |

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
- Update both Java and TypeScript implementations when changing engine behavior

## Maven Central Publishing (maintainers)

The Java library is published to Maven Central via the `publish-maven` job in `.github/workflows/semantic-release.yml`. Required GitHub repository secrets in the `production` environment:

| Secret | Description |
| --- | --- |
| `CENTRAL_PORTAL_USERNAME` | Sonatype Central Portal token username |
| `CENTRAL_PORTAL_TOKEN` | Sonatype Central Portal token password |
| `GPG_PRIVATE_KEY` | Base64-encoded GPG private key for artifact signing |
| `GPG_PASSPHRASE` | Passphrase for the GPG key |

Generate a Central Portal token at [central.sonatype.com](https://central.sonatype.com/). Publish the GPG public key to [keys.openpgp.org](https://keys.openpgp.org/) before the first release.

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
