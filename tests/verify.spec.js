import { test, expect } from '@playwright/test';

test.describe('Milestone 1: Astro Project Initialization & Setup Verification', () => {
  
  test('TC-F1-01: Main Header Elements', async ({ page }) => {
    await page.goto('/');
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toBeVisible();
    await expect(mainHeading).toContainText('Lead SRE & AIOps Engineer');
  });

  test('TC-F1-02: Developer & DevOps Background', async ({ page }) => {
    await page.goto('/');
    const content = await page.textContent('body');
    expect(content).toContain('senior developer');
    expect(content).toContain('DevOps');
  });

  test('TC-F1-03: Design Philosophy Render', async ({ page }) => {
    await page.goto('/');
    const content = await page.textContent('body');
    expect(content).toContain('KISS');
    expect(content).toContain('simplicity');
  });

  test('TC-F1-04: Header & Footer Navigation Links', async ({ page }) => {
    await page.goto('/');
    
    // Header Links
    const homeLink = page.locator('header nav a[href="/"]');
    const blogLink = page.locator('header nav a[href="/blog"]');
    await expect(homeLink).toBeVisible();
    await expect(blogLink).toBeVisible();
    
    // Footer Links
    const githubLink = page.locator('footer a[href*="github.com"]');
    const linkedinLink = page.locator('footer a[href*="linkedin.com"]');
    await expect(githubLink).toBeVisible();
    await expect(linkedinLink).toBeVisible();
  });

  test('TC-F1-05: Dark SRE Theme Styling', async ({ page }) => {
    await page.goto('/');
    const bodyClass = await page.locator('body').getAttribute('class');
    expect(bodyClass).toContain('bg-zinc-950');
    expect(bodyClass).toContain('text-zinc-50');
  });

  test('TC-F1-10: SEO & Viewport Meta Tags', async ({ page }) => {
    await page.goto('/');
    
    // Viewport
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveAttribute('content', 'width=device-width, initial-scale=1.0');
    
    // Description
    const descMeta = page.locator('meta[name="description"]');
    await expect(descMeta).toHaveAttribute(
      'content',
      'Lead SRE & AIOps Engineer Portfolio and Blog — automation, reliability, and high-performance systems.',
    );
    
    // OpenGraph
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', 'Allister Antosik - Lead SRE & AIOps Engineer Portfolio');
    
    // Language
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('en');
  });

  test('TC-F2-01: HTMX Loading Attributes', async ({ page }) => {
    await page.goto('/');
    const projectsList = page.locator('#projects-list');
    await expect(projectsList).toHaveAttribute('hx-get', '/api/projects');
    await expect(projectsList).toHaveAttribute('hx-trigger', 'load');
  });

  test('TC-F2-02: API Projects Endpoint Direct Access', async ({ request }) => {
    const response = await request.get('/api/projects');
    expect(response.status()).toBe(200);
    const headers = response.headers();
    expect(headers['content-type']).toContain('text/html');
    
    const body = await response.text();
    expect(body).toContain('project-card');
    expect(body).toContain('automated-chaos-mesh');
    expect(body).toContain('kubernetes-cost-optimizer');
  });

  test('TC-F2-03 & TC-F2-04: Dynamic Card Swapping and Details', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the project cards to be loaded via HTMX
    const firstCard = page.locator('#projects-list .project-card').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    
    // Verify there are exactly two project cards
    const cards = page.locator('#projects-list .project-card');
    await expect(cards).toHaveCount(2);
    
    // Verify metadata of first card
    const cardTitle = cards.nth(0).locator('h3');
    await expect(cardTitle).toHaveText('automated-chaos-mesh');
    const cardDesc = cards.nth(0).locator('p');
    await expect(cardDesc).toContainText('Kubernetes chaos engineering controller');
    
    // Check specific metadata fields
    const firstCardText = await cards.nth(0).textContent();
    expect(firstCardText).toContain('Language: Go');
    expect(firstCardText).toContain('Stars: 342');
    expect(firstCardText).toContain('Forks: 47');
    expect(firstCardText).toContain('Updated:');
  });
});
