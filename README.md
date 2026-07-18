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

`npm run build` runs Astro, then [Pagefind](https://pagefind.app) to index `dist/` for site search. Search is available in the header after a production build (dev server has no index until you build once).

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

**Logs & metrics** are enabled (`enableLogs` / `enableMetrics`):

- Console calls are forwarded via `consoleLoggingIntegration`
- Page views, HTMX requests, and carousel navigation emit `Sentry.logger` + `Sentry.metrics`
- Node runtime metrics on the server (`nodeRuntimeMetricsIntegration`)
- App helpers live in `src/lib/telemetry.ts`

## Test

```bash
npx playwright install
npm test
```

## Architecture
This project is built using Astro, Tailwind CSS, and HTMX. It follows a clean, component-based, static-first architecture, leveraging Astro's content collections for blogging and dynamic client-side interactivity using HTMX.

- **Frontend Framework**: Astro (Static Site Generation / Server-Side Endpoints)
- **Styling**: Tailwind CSS (Minimal, bold typography, high-contrast SRE-themed design)
- **Dynamic Content**: HTMX (used for partial-page updates, specifically for loading dynamic GitHub projects without full React/Vue hydration)
- **Data Flow**:
  - The client makes a `GET` request using HTMX (`hx-get`) to an Astro API endpoint (`/api/projects`).
  - The Astro endpoint fetches repository details from the GitHub API (with fallback mock data for offline/rate-limit scenarios), renders them to HTML using an Astro component, and returns the HTML snippet.
  - HTMX swaps this HTML snippet into the project list container on the homepage.
  - The screenshot carousel configuration is loaded statically from a JSON file `/src/data/carousel.json` at build time or fetched.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Astro Project Initialization & Setup | Initialize Astro project, configure Tailwind CSS, set up base layout, routing, and script structure. | None | DONE |
| 2 | SRE/AIOps Homepage & Carousel (R1, R3) | Implement homepage content, SRE role description, and screenshot carousel with browser mockup using static configuration. | M1 | IN_PROGRESS (sub-orch: 8cc905e1) |
| 3 | Astro Markdown Blog Section (R4) | Create blog Content Collection, markdown posts, and list/detail page layouts. | M1 | IN_PROGRESS (sub-orch: 8cc905e1) |
| 4 | HTMX Dynamic GitHub Projects (R2) | Implement the HTMX endpoint and project card fetching from GitHub API with mock fallbacks. | M1 | IN_PROGRESS (sub-orch: 8cc905e1) |
| 5 | Final E2E Integration & Hardening | Run all E2E tests, resolve bugs, perform forensic audit, and run adversarial hardening. | M2, M3, M4, TEST_READY.md | IN_PROGRESS (sub-orch: 8cc905e1) |

## Code Layout
```
/
├── src/
│   ├── content/
│   │   ├── config.ts         # Blog content collection schema
│   │   └── blog/             # Blog markdown posts
│   ├── layouts/
│   │   └── Layout.astro      # Base HTML layout
│   ├── components/
│   │   ├── Carousel.astro    # Screenshot carousel component
│   │   ├── ProjectCard.astro # Single github project card
│   │   ├── Header.astro      # Header/Navigation
│   │   └── Footer.astro      # Footer
│   ├── data/
│   │   └── carousel.json     # Carousel data configuration
│   └── pages/
│       ├── index.astro       # Portfolio homepage
│       ├── blog/
│       │   ├── index.astro   # Blog listing page
│       │   └── [slug].astro  # Blog post reader page
│       └── api/
│           └── projects.astro # Endpoint returning project HTML snippets
├── public/
│   ├── assets/               # Images and screenshots
│   └── mockups/              # Browser mockup assets
├── tests/                    # Automated E2E verification tests
│   ├── portfolio.spec.ts
│   ├── projects.spec.ts
│   ├── carousel.spec.ts
│   ├── blog.spec.ts
│   ├── combinations.spec.ts
│   └── scenarios.spec.ts
├── package.json
└── tailwind.config.mjs
```

## Interface Contracts

### Client ↔ GitHub Projects Endpoint (`/api/projects`)
- **Trigger**: HTMX load event on home page (`hx-trigger="load"`).
- **HTTP Method**: `GET`
- **Request Parameters**: None (can optionally support query params if needed, but defaults to all configured repositories).
- **Response Format**: `text/html`
- **Response Payload**: A list of `<div class="project-card">` HTML fragments.
- **Error Handling**: If the API call fails or rates are limited, the endpoint returns cached/mocked SRE-related projects (e.g., automated-chaos-mesh, kubernetes-cost-optimizer) to prevent a broken UI.

### Screenshot Carousel Configuration (`/src/data/carousel.json`)
- **Format**: JSON array of objects
- **Schema**:
  ```json
  [
    {
      "id": "project-slug",
      "title": "Project Name",
      "description": "Short explanation",
      "image": "/assets/screenshots/project1.png",
      "link": "https://github.com/user/project1"
    }
  ]
  ```
