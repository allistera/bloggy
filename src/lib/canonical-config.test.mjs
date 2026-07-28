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
});
