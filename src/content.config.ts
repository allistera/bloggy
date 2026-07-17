import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Blog articles live only under `src/content/blog/`.
 * Supports Markdown (`.md`) and MDX (`.mdx`).
 */
const blog = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/blog',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { blog };
