import { getCollection, type CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

/** Published posts only (no drafts, no future dates). Newest first. */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const now = new Date();
  const all = await getCollection('blog');
  return all
    .filter((post) => {
      if (post.data.draft) return false;
      if (new Date(post.data.pubDate) > now) return false;
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime(),
    );
}

/** Approximate reading time in whole minutes (min 1). */
export function readingTimeMinutes(body: string | undefined): number {
  const words = (body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/**
 * Related posts by shared tags (score = overlap count), then recency.
 * Excludes the current post. Returns up to `limit` items.
 */
export function getRelatedPosts(
  current: BlogPost,
  allPublished: BlogPost[],
  limit = 3,
): BlogPost[] {
  const tags = new Set(current.data.tags.map((t) => t.toLowerCase()));

  return allPublished
    .filter((p) => p.id !== current.id)
    .map((post) => {
      const shared = post.data.tags.filter((t) =>
        tags.has(t.toLowerCase()),
      ).length;
      return { post, shared };
    })
    .filter(({ shared }) => shared > 0)
    .sort((a, b) => {
      if (b.shared !== a.shared) return b.shared - a.shared;
      return (
        new Date(b.post.data.pubDate).getTime() -
        new Date(a.post.data.pubDate).getTime()
      );
    })
    .slice(0, limit)
    .map(({ post }) => post);
}
