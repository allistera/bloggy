import { describe, expect, it } from 'vitest';
import { pageTitle } from './seo';

describe('pageTitle', () => {
  it('appends the suffix when it fits within maxLength', () => {
    expect(pageTitle('Short Title', ' - Site', 60)).toBe('Short Title - Site');
  });

  it('omits the suffix when it would exceed maxLength', () => {
    const longTitle = 'A'.repeat(55);
    expect(pageTitle(longTitle, ' - Site', 60)).toBe(longTitle);
  });

  it('keeps the result within maxLength when the suffix is appended', () => {
    const title = 'Exactly Fifty Three Characters Long For This Test!!';
    const result = pageTitle(title, ' - Site', 60);
    expect(result.length).toBeLessThanOrEqual(60);
  });
});
