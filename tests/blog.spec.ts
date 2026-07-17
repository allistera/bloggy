import { test, expect } from '@playwright/test';

test.describe('Feature 4: Astro Markdown Blog (R4) - Tier 1 & Tier 2', () => {

  // TC-F4-01: Blog Index Listing
  test('TC-F4-01: Blog Index Listing', async ({ page }) => {
    await page.goto('/blog');
    
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toBeVisible();
    await expect(mainHeading).toContainText('SRE & AIOps Insights');

    const articleCards = page.locator('#blog-posts-list .blog-post-card');
    // Real articles from allistera.github.io (draft/future fixtures excluded)
    const count = await articleCards.count();
    expect(count).toBeGreaterThanOrEqual(4);

    await expect(page.locator('text=Two-Way iMessage/SMS for Home Assistant via Sendblue')).toBeVisible();
    await expect(page.locator('text=Clean Up Your GitHub Account')).toBeVisible();
    await expect(page.locator('text=Mass Uninstall iOS Apps with Apple Configurator on Mac')).toBeVisible();
    await expect(page.locator('text=Zero-Downtime Deployments with Kubernetes Rolling Updates')).toBeVisible();
  });

  // TC-F4-02: Blog Post Metadata
  test('TC-F4-02: Blog Post Metadata', async ({ page }) => {
    await page.goto('/blog');
    
    const firstCard = page.locator('#blog-posts-list .blog-post-card').first();
    await expect(firstCard).toBeVisible();

    const tags = firstCard.locator('.blog-card-tag');
    await expect(tags.first()).toBeVisible();
    
    const readingTime = firstCard.locator('.reading-time');
    await expect(readingTime).toBeVisible();
    await expect(readingTime).toContainText(/min read/);

    const cardContent = await firstCard.textContent();
    expect(cardContent).toMatch(/(January|February|March|April|May|June|July|August|September|October|November|December) \d+, \d{4}/);
  });

  // TC-F4-03: Blog Post Redirection
  test('TC-F4-03: Blog Post Redirection', async ({ page }) => {
    await page.goto('/blog');
    
    const titleLink = page.locator('#blog-posts-list .blog-post-card a').first();
    const href = await titleLink.getAttribute('href');
    expect(href).not.toBeNull();
    expect(href).toContain('/blog/');

    await titleLink.click();
    await page.waitForURL(`**${href}`);
    
    const backBtn = page.locator('text=Back to Blog');
    await expect(backBtn).toBeVisible();
  });

  // TC-F4-04: Markdown Rendering Elements
  test('TC-F4-04: Markdown Rendering Elements', async ({ page }) => {
    await page.goto('/blog/zero-downtime-kubernetes-deployments');
    
    const article = page.locator('article');
    await expect(article).toBeVisible();

    const h2 = article.locator('h2').first();
    await expect(h2).toBeVisible();
    await expect(h2).toContainText('How Rolling Updates Work');

    const p = article.locator('p').first();
    await expect(p).toBeVisible();

    const li = article.locator('li').first();
    await expect(li).toBeVisible();
    await expect(li).toContainText('maxSurge');

    const codeBlock = article.locator('pre').first();
    await expect(codeBlock).toBeVisible();
    await expect(codeBlock).toContainText('apiVersion: apps/v1');
  });

  // TC-F4-05: Blog Tag Filtering
  test('TC-F4-05: Blog Tag Filtering', async ({ page }) => {
    await page.goto('/blog');
    
    const tagButton = page.locator('.tag-filter-btn[data-tag="Kubernetes"]');
    await expect(tagButton).toBeVisible();

    await tagButton.click();
    await page.waitForTimeout(200);

    const visibleCards = page.locator('#blog-posts-list .blog-post-card:not(.hidden)');
    const totalCards = await visibleCards.count();
    expect(totalCards).toBeGreaterThanOrEqual(1);
    
    for (let i = 0; i < totalCards; i++) {
      const cardTags = await visibleCards.nth(i).locator('.blog-card-tag').allTextContents();
      const hasTag = cardTags.some(t => t.includes('#Kubernetes'));
      expect(hasTag).toBe(true);
    }
  });

  // TC-F4-06: Future-Dated Posts Exclusion
  test('TC-F4-06: Future-Dated Posts Exclusion', async ({ page }) => {
    await page.goto('/blog');
    
    const futurePost = page.locator('text=Fixture Future Post');
    await expect(futurePost).toBeHidden();
  });

  // TC-F4-07: Draft Status Exclusion
  test('TC-F4-07: Draft Status Exclusion', async ({ page }) => {
    await page.goto('/blog');
    
    const draftPost = page.locator('text=Fixture Draft Post');
    await expect(draftPost).toBeHidden();
  });

  // TC-F4-08: Reading time present on longer posts
  test('TC-F4-08: Reading time on longer posts', async ({ page }) => {
    await page.goto('/blog');
    
    const longPost = page.locator('.blog-post-card', { hasText: 'Two-Way iMessage/SMS for Home Assistant via Sendblue' });
    await expect(longPost).toBeVisible();

    const readingTime = longPost.locator('.reading-time');
    await expect(readingTime).toBeVisible();
    // Longer article should show more than 1 minute
    const text = await readingTime.textContent();
    const minutes = parseInt(text?.match(/(\d+)/)?.[1] || '0', 10);
    expect(minutes).toBeGreaterThanOrEqual(2);
  });

  // TC-F4-09: Real article slugs navigate correctly
  test('TC-F4-09: Real article slug navigation', async ({ page }) => {
    await page.goto('/blog');
    
    const postLink = page.locator('.blog-post-card', { hasText: 'Clean Up Your GitHub Account' }).locator('a').first();
    await expect(postLink).toBeVisible();

    const href = await postLink.getAttribute('href');
    expect(href).toContain('/blog/clean-up-your-github-account');
    
    await postLink.click();
    await page.waitForURL('**/blog/clean-up-your-github-account');
    
    const heading = page.locator('main h1').first();
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Clean Up Your GitHub Account');
  });


  // TC-F4-10: Blog 404 Routing
  test('TC-F4-10: Blog 404 Routing', async ({ page }) => {
    const response = await page.goto('/blog/invalid-slug');
    
    expect(response?.status()).toBe(404);

    const errorBlock = page.locator('text=Error: Resource Not Found');
    await expect(errorBlock).toBeVisible();

    const returnBtn = page.locator('text=Return to Blog');
    await expect(returnBtn).toBeVisible();
    await expect(returnBtn).toHaveAttribute('href', '/blog');
  });

});
