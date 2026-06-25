# Contributing

## Setup

```bash
npm ci
npm run dev
```

## Build Check

Run this before pushing changes:

```bash
npm run build
```

## Source Layout

- `index.html`: page sections, navigation, static markup, viewer markup.
- `src/main.js`: theme toggle, page routing, video switching, gallery data, image viewer behavior.
- `src/styles.css`: global layout, responsive rules, image index, contact page, and viewer styling.
- `icon/`: local contact icons.

## Deployment

Cloudflare Pages should build from GitHub with:

- Build command: `npm run build`
- Output directory: `dist`
- Root directory: `/`

## Do Not Commit

- `node_modules/`
- `dist/`
- `*.log`
- `.env` or `.env.*`
- `config.yml`
- Cloudflare Tunnel credentials
- local screenshots or temporary reference files

## Style Notes

Keep the site quiet and editorial. Avoid heavy marketing copy, oversized cards, generic gradients, and decorative clutter. When adding captions, prefer short human observations over mechanical labels.
