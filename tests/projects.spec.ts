import { test, expect } from '@playwright/test';
import { mockProjects, longProjectDetails, formatProjectAsHtml } from './helpers/mock-data';

test.describe('Feature 2: Dynamic GitHub Projects Integration (R2) - Tier 1 & Tier 2', () => {

  // TC-F2-01: HTMX Loading Attributes
  test('TC-F2-01: HTMX Loading Attributes', async ({ page }) => {
    await page.goto('/');
    const projectsList = page.locator('#projects-list');
    await expect(projectsList).toHaveAttribute('hx-get', '/api/projects');
    await expect(projectsList).toHaveAttribute('hx-trigger', 'load');
  });

  // TC-F2-02: API Projects Endpoint
  test('TC-F2-02: API Projects Endpoint', async ({ request }) => {
    const response = await request.get('/api/projects');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/html');
    
    const text = await response.text();
    expect(text).toContain('project-card');
    expect(text).toContain('automated-chaos-mesh');
  });

  // TC-F2-03: Dynamic Card Swapping
  test('TC-F2-03: Dynamic Card Swapping', async ({ page }) => {
    // Intercept and return mock projects HTML snippet
    await page.route('/api/projects', route => {
      const html = mockProjects.map(p => formatProjectAsHtml(p)).join('\n');
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: html
      });
    });

    await page.goto('/');
    const cards = page.locator('#projects-list .project-card');
    await expect(cards).toHaveCount(mockProjects.length);
  });

  // TC-F2-04: Project Card Details
  test('TC-F2-04: Project Card Details', async ({ page }) => {
    await page.route('/api/projects', route => {
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: formatProjectAsHtml(mockProjects[0])
      });
    });

    await page.goto('/');
    const firstCard = page.locator('#projects-list .project-card').first();
    await expect(firstCard).toBeVisible();

    await expect(firstCard.locator('h3')).toHaveText('automated-chaos-mesh');
    await expect(firstCard.locator('p')).toContainText('Kubernetes chaos engineering controller');
    
    const cardText = await firstCard.textContent();
    expect(cardText).toContain('Language: Go');
    expect(cardText).toContain('Stars: 342');
    expect(cardText).toContain('Forks: 47');
    expect(cardText).toContain('Updated:');
  });

  // TC-F2-05: Fallback Mock Cards
  test('TC-F2-05: Fallback Mock Cards', async ({ page }) => {
    // Intercept and abort the route to simulate network failure
    await page.route('/api/projects', route => route.abort());

    await page.goto('/');
    
    // Check that the page gracefully displays the fallback cached projects
    const cards = page.locator('#projects-list .project-card');
    await expect(cards.first()).toBeVisible({ timeout: 5000 });
    await expect(cards).toHaveCount(2);
    await expect(cards.nth(0).locator('h3')).toHaveText('automated-chaos-mesh');
  });

  // TC-F2-06: Empty API Response
  test('TC-F2-06: Empty API Response', async ({ page }) => {
    await page.route('/api/projects', route => {
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<div class="col-span-full text-center text-zinc-500 font-mono py-8">No repositories found</div>'
      });
    });

    await page.goto('/');
    const container = page.locator('#projects-list');
    await expect(container).toContainText('No repositories found');
  });

  // TC-F2-07: Spinner/Skeleton Loader
  test('TC-F2-07: Spinner/Skeleton Loader', async ({ page }) => {
    await page.route('/api/projects', async route => {
      await new Promise(resolve => setTimeout(resolve, 4000));
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: formatProjectAsHtml(mockProjects[0])
      });
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Verify loading spinner is visible initially
    const spinner = page.locator('#projects-list svg');
    await expect(spinner).toBeVisible();

    // Verify loading text is visible
    await expect(page.locator('#projects-list')).toContainText('Loading projects from endpoint...');

    // Wait for content swap to complete
    await expect(page.locator('#projects-list .project-card').first()).toBeVisible({ timeout: 5000 });
  });

  // TC-F2-08: API 500 Error Recovery
  test('TC-F2-08: API 500 Error Recovery', async ({ page }) => {
    await page.route('/api/projects', route => {
      route.fulfill({
        status: 500,
        contentType: 'text/plain',
        body: 'Internal Server Error'
      });
    });

    await page.goto('/');
    
    // Recovery expectation: falls back to rendering local pre-cached configurations
    const cards = page.locator('#projects-list .project-card');
    await expect(cards.first()).toBeVisible({ timeout: 5000 });
    await expect(cards).toHaveCount(2);
    await expect(cards.nth(0).locator('h3')).toHaveText('automated-chaos-mesh');
  });

  // TC-F2-09: Excessively Long Repository Details
  test('TC-F2-09: Excessively Long Repository Details', async ({ page }) => {
    await page.route('/api/projects', route => {
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: formatProjectAsHtml(longProjectDetails[0])
      });
    });

    await page.goto('/');
    
    const card = page.locator('#projects-list .project-card').first();
    await expect(card).toBeVisible();

    // Verify it doesn't break viewport layout (no horizontal scroll)
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  // TC-F2-10: Network Timeout Failover
  test('TC-F2-10: Network Timeout Failover', async ({ page }) => {
    // Hang the request indefinitely
    await page.route('/api/projects', async () => {
      await new Promise(() => {}); // never resolves
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Expectation: terminates after timeout and falls back to rendering local projects
    const cards = page.locator('#projects-list .project-card');
    await expect(cards.first()).toBeVisible({ timeout: 6000 });
    await expect(cards).toHaveCount(2);
    await expect(cards.nth(0).locator('h3')).toHaveText('automated-chaos-mesh');
  });

});
