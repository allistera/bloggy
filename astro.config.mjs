import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sentry from '@sentry/astro';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://allisterantosik.com',
  adapter: vercel(),
  // Legacy paths from allistera.github.io → new /blog/* routes
  // (no trailing-slash duplicates — Astro normalizes both forms)
  redirects: {
    '/articles/clean-up-your-github-account': '/blog/clean-up-your-github-account',
    '/articles/mass-uninstall-ios-apps-apple-configurator':
      '/blog/mass-uninstall-ios-apps-apple-configurator',
    '/articles/two_way_imessage': '/blog/two-way-imessage',
    '/articles/two-way-imessage': '/blog/two-way-imessage',
    '/articles/zero-downtime-kubernetes-deployments':
      '/blog/zero-downtime-kubernetes-deployments',
    '/articles': '/blog',
  },
  // Explicit Shiki syntax highlighting for Markdown + MDX (not Prism)
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      // Dark theme aligned with zinc/emerald site chrome
      theme: 'github-dark-dimmed',
      wrap: true,
      // Common blog langs are built-in; leave langs empty for full bundle defaults
      langs: [],
    },
  },
  integrations: [
    mdx({
      // Inherit markdown.shikiConfig from the root markdown config
      syntaxHighlight: 'shiki',
    }),
    // Runtime SDK options live in sentry.client.config.ts / sentry.server.config.ts
    sentry({
      // Source map upload (set SENTRY_AUTH_TOKEN + SENTRY_ORG in CI/Vercel)
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT || 'bloggy',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      // Skip upload when no token (local/dev builds still succeed)
      sourcemaps: {
        disable: !process.env.SENTRY_AUTH_TOKEN,
      },
      telemetry: false,
    }),
    sitemap({
      // HTMX partial endpoint — not a public page
      filter: (page) => !page.includes('/api/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
