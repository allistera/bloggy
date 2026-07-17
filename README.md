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

## Test

```bash
npx playwright install
npm test
```
