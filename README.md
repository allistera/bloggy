# Allister Antosik

Personal portfolio and blog: [allisterantosik.com](https://allisterantosik.com)

Built with [Astro](https://astro.build), Tailwind CSS, MDX, and HTMX.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy (Vercel)

This project uses [`@astrojs/vercel`](https://docs.astro.build/en/guides/integrations-guide/vercel/).

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new)
2. Deploy with defaults (`npm run build`; adapter writes `.vercel/output`)
3. Attach `allisterantosik.com` under Project → Settings → Domains

Or from the CLI:

```bash
npx vercel
npx vercel --prod
```

## Sentry

Error monitoring via [`@sentry/astro`](https://docs.sentry.io/platforms/javascript/guides/astro/).

1. Create a Sentry project (platform: **Astro** / JavaScript) named `bloggy`
2. Copy `.env.example` → `.env` and set:
   - `PUBLIC_SENTRY_DSN` / `SENTRY_DSN` — project DSN
   - `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT=bloggy` — source map upload
3. On Vercel, add the same env vars for Production (and Preview if desired)

Config files: `sentry.client.config.ts`, `sentry.server.config.ts`, and the `sentry()` integration in `astro.config.mjs`.

## Test

```bash
npx playwright install
npm test
```
