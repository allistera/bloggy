import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import astroConfig from '../../astro.config.mjs';

const vercelConfig = JSON.parse(
  readFileSync(new URL('../../vercel.json', import.meta.url), 'utf-8'),
);

describe('canonical URL configuration', () => {
  it('uses trailing slashes in Astro-generated URLs', () => {
    expect(astroConfig.trailingSlash).toBe('always');
  });

  it('redirects non-trailing-slash requests on Vercel', () => {
    expect(vercelConfig.trailingSlash).toBe(true);
  });

  it('redirects legacy article URLs after trailing-slash normalization', () => {
    expect(vercelConfig.redirects).toContainEqual({
      source: '/articles/clean-up-your-github-account/',
      destination: '/blog/clean-up-your-github-account/',
      permanent: true,
    });
    expect(
      vercelConfig.redirects.every(
        ({ source, destination, permanent }) =>
          source.endsWith('/') && destination.endsWith('/') && permanent === true,
      ),
    ).toBe(true);
  });
});
