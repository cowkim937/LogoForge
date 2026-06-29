# LogoForge

Static logo, favicon, and web icon generator for Cloudflare Pages.

LogoForge runs entirely in the browser. Users upload a PNG or SVG, configure icon generation options, preview the result, edit selected generated PNG files, and download a ZIP containing website, Apple, Android, PWA, Microsoft, social, and generic logo assets.

## Features

- PNG, transparent PNG, and SVG input
- Drag and drop, click upload, and clipboard paste
- 30MB file size limit
- Source preview with width, height, transparency, file size, and resolution
- Auto crop modes: keep original, center align, square crop, padding
- Background modes: transparent, white, black, custom color
- Color-to-transparent conversion with tolerance control
- Resize quality modes: fast, high quality, ultra quality
- Generated output preview grid
- Quick editor for generated PNG files
- Browser-created ZIP download
- `manifest.webmanifest`, `browserconfig.xml`, `README.txt`, and HTML icon snippet generation
- SEO, OpenGraph, Twitter Card, robots, sitemap, canonical, and JSON-LD metadata
- Privacy-friendly static architecture with no login, server upload, or database

## Tech Stack

- HTML5
- Bootstrap 5
- Bootstrap Icons
- Vanilla JavaScript ES2022
- CSS3
- Vite
- JSZip
- FileSaver.js
- Pica
- browser-image-compression
- Canvas API

## Project Structure

```text
.
├── index.html
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   ├── sitemap.xml
│   └── site.webmanifest
├── src/
│   ├── components/
│   ├── image/
│   ├── styles/
│   ├── utils/
│   ├── zip/
│   ├── constants.js
│   └── main.js
├── docs/
├── package.json
└── package-lock.json
```

## Getting Started

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://localhost:5173/
```

## Build

```bash
npm run build
```

The production output is generated in `dist/`.

## Preview Production Build

```bash
npm run preview
```

## Cloudflare Pages Deployment

Use these Cloudflare Pages settings:

```text
Build command: npm run build
Build output directory: dist
Root directory: /
Node.js version: 22
```

No server, database, workers, or environment variables are required.

## Generated ZIP Structure

```text
logo/
├── favicon/
├── apple/
├── android/
├── pwa/
├── microsoft/
├── social/
├── generic/
├── manifest.webmanifest
├── browserconfig.xml
├── html-code.txt
└── README.txt
```

## Privacy

LogoForge does not upload images to a server. All image decoding, resizing, editing, ZIP creation, and download preparation happen inside the user's browser tab.

## Git Notes

Do commit:

- `index.html`
- `public/`
- `src/`
- `docs/`
- `package.json`
- `package-lock.json`
- `.github/workflows/ci.yml`
- root metadata files such as `.gitignore`, `.editorconfig`, and `.gitattributes`

Do not commit:

- `node_modules/`
- `dist/`
- `.playwright-cli/`
- `output/`
- local `.env` files

