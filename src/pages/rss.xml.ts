import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedPosts } from '../lib/posts';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();
  const site = context.site ?? new URL('https://allisterantosik.com');

  return rss({
    title: 'Allister Antosik — Blog',
    description:
      'Notes on SRE, AIOps, automation, reliability, and high-performance systems.',
    site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
      categories: post.data.tags,
    })),
    customData: `<language>en-gb</language>`,
  });
}
