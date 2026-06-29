# Deployment

LogoForge is designed for Cloudflare Pages as a static Vite application.

## Cloudflare Pages Settings

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: /
Node.js version: 22
```

## Required Services

None.

LogoForge does not require:

- Backend server
- Database
- Object storage
- Worker API
- Login provider
- Environment variables

## Local Verification

Run before deploying:

```bash
npm install
npm run build
npm run preview
```

## Cache and Security Headers

Cloudflare Pages automatically serves files from `public/` and `dist/`. Static header rules are provided by `public/_headers`.

