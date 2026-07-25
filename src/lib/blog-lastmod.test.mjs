import { describe, expect, it } from 'vitest';
import { parseBlogFrontmatter } from './blog-lastmod.mjs';

const NOW = new Date('2026-07-25T00:00:00Z');

function post(frontmatter) {
  return `---\n${frontmatter}\n---\nBody text.\n`;
}

describe('parseBlogFrontmatter', () => {
  it('accepts a prose-style date without crashing', () => {
    const raw = post('title: Test\npubDate: April 15, 2026\ntags: []');
    const result = parseBlogFrontmatter(raw, NOW);
    expect(result).not.toBeNull();
    expect(result.pubDate.toISOString()).toBe(new Date('April 15, 2026').toISOString());
  });

  it('does not skip a post whose description contains "draft: true" as prose', () => {
    const raw = post(
      'title: Test\ndescription: "Explains draft: true in YAML frontmatter"\npubDate: 2026-01-01\ntags: []',
    );
    const result = parseBlogFrontmatter(raw, NOW);
    expect(result).not.toBeNull();
  });

  it('excludes an actual draft post', () => {
    const raw = post('title: Test\npubDate: 2026-01-01\ntags: []\ndraft: true');
    expect(parseBlogFrontmatter(raw, NOW)).toBeNull();
  });

  it('excludes a post scheduled in the future', () => {
    const raw = post('title: Test\npubDate: 2099-01-01\ntags: []');
    expect(parseBlogFrontmatter(raw, NOW)).toBeNull();
  });

  it('returns null instead of throwing on unparseable pubDate', () => {
    const raw = post('title: Test\npubDate: not a date\ntags: []');
    expect(() => parseBlogFrontmatter(raw, NOW)).not.toThrow();
    expect(parseBlogFrontmatter(raw, NOW)).toBeNull();
  });

  it('returns null when there is no frontmatter block', () => {
    expect(parseBlogFrontmatter('Just body text.', NOW)).toBeNull();
  });
});
