import { readdirSync, readFileSync } from 'node:fs';
import { load as loadYaml } from 'js-yaml';
import { z } from 'zod';

// Mirrors the pubDate/draft fields from src/content.config.ts's blog schema.
// astro:content isn't available from astro.config.mjs (it runs before Astro's
// Vite pipeline starts), so this subset is kept in sync manually.
const blogFrontmatterSchema = z.object({
  pubDate: z.coerce.date(),
  draft: z.boolean().optional().default(false),
});

/**
 * Parses a blog post's raw file content and returns its pubDate if it's a
 * published, already-live post, or null if it's a draft, scheduled for the
 * future, or has frontmatter that doesn't match the real content schema.
 */
export function parseBlogFrontmatter(raw, now = new Date()) {
  const frontmatterBlock = raw.match(/^---\n([\s\S]*?)\n---/)?.[1];
  if (!frontmatterBlock) return null;

  const parsed = blogFrontmatterSchema.safeParse(loadYaml(frontmatterBlock));
  if (!parsed.success || parsed.data.draft) return null;
  if (parsed.data.pubDate > now) return null;

  return { pubDate: parsed.data.pubDate };
}

/** Sitemap <lastmod> for blog posts under `blogDir`, keyed by URL path. */
export function getBlogLastmod(blogDir) {
  const now = new Date();
  const lastmodByPath = new Map();

  for (const file of readdirSync(blogDir)) {
    if (!/\.(md|mdx)$/.test(file)) continue;
    const raw = readFileSync(new URL(file, blogDir), 'utf-8');
    const result = parseBlogFrontmatter(raw, now);
    if (!result) continue;

    const slug = file.replace(/\.(md|mdx)$/, '');
    lastmodByPath.set(`/blog/${slug}/`, result.pubDate.toISOString());
  }

  return lastmodByPath;
}
