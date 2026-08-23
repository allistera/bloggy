import { test, expect } from '@playwright/test';

test.describe('Performance loading boundaries', () => {
  test('TC-PERF-01: Below-the-fold services stay off the initial request path', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', request => requests.push(request.url()));

    await page.goto('/', { waitUntil: 'load' });
    await page.waitForTimeout(500);

    expect(requests.some(url => url.includes('/pagefind/pagefind-component-ui'))).toBe(false);
    expect(requests.some(url => url.includes('/vendor/htmx.min.js'))).toBe(false);
    expect(requests.some(url => url.includes('/api/projects/'))).toBe(false);
  });

  test('TC-PERF-02: Search assets load on search interaction', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });

    const searchScript = page.waitForResponse('**/pagefind/pagefind-component-ui.js');
    await page.locator('.site-search-trigger').click();
    await searchScript;

    await expect.poll(() => page.evaluate(() => Boolean(customElements.get('pagefind-modal-trigger')))).toBe(true);
    await expect(page.locator('pagefind-modal dialog[open]')).toBeVisible();
  });

  test('TC-PERF-03: Carousel uses responsive lazy-loaded images', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const image = page.locator('#carousel-container .carousel-slide.active .carousel-image');
    await expect(image).toHaveAttribute('loading', 'lazy');
    await expect(image).toHaveAttribute('fetchpriority', 'low');
    await expect(image).toHaveAttribute('src', '/screenshots/cookie-web-640.webp');
    await expect(image).toHaveAttribute('srcset', /cookie-web-1200\.webp 1200w/);
  });

  test('TC-PERF-04: Projects load when their section approaches the viewport', async ({ page }) => {
    let requested = false;
    await page.route('/api/projects/', route => {
      requested = true;
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<div class="project-card">Deferred project</div>',
      });
    });

    await page.goto('/', { waitUntil: 'load' });
    expect(requested).toBe(false);

    await page.locator('#projects-list').scrollIntoViewIfNeeded();
    await expect(page.locator('#projects-list .project-card')).toHaveText('Deferred project');
    expect(requested).toBe(true);
  });
});
