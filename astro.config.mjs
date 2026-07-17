import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://allisterantosik.com',
  integrations: [
    mdx(),
    sitemap({
      // HTMX partial endpoint — not a public page
      filter: (page) => !page.includes('/api/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
