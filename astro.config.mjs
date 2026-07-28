import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sentry from '@sentry/astro';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import { getBlogLastmod } from './src/lib/blog-lastmod.mjs';

const blogLastmod = getBlogLastmod(new URL('./src/content/blog/', import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: 'https://allisterantosik.com',
  trailingSlash: 'always',
  adapter: vercel(),
  // Legacy paths from allistera.github.io → canonical /blog/*/ routes
  redirects: {
    '/articles/clean-up-your-github-account': '/blog/clean-up-your-github-account/',
    '/articles/mass-uninstall-ios-apps-apple-configurator':
      '/blog/mass-uninstall-ios-apps-apple-configurator/',
    '/articles/two_way_imessage': '/blog/two-way-imessage/',
    '/articles/two-way-imessage': '/blog/two-way-imessage/',
    '/articles/zero-downtime-kubernetes-deployments':
      '/blog/zero-downtime-kubernetes-deployments/',
    '/articles': '/blog/',
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
      serialize(item) {
        const lastmod = blogLastmod.get(new URL(item.url).pathname);
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
