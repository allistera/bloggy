import { test, expect } from '@playwright/test';

test.describe('Feature 4: Astro Markdown Blog (R4) - Tier 1 & Tier 2', () => {

  // TC-F4-01: Blog Index Listing
  test('TC-F4-01: Blog Index Listing', async ({ page }) => {
    await page.goto('/blog');
    
    // Check that blog index renders successfully and contains article list elements/links
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toBeVisible();
    await expect(mainHeading).toContainText('SRE & AIOps Insights');

    const articleCards = page.locator('#blog-posts-list .blog-post-card');
    // We should have at least 4 visible posts (AIOps, Chaos, Complex, Observability)
    // Future and Draft posts should be excluded
    const count = await articleCards.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  // TC-F4-02: Blog Post Metadata
  test('TC-F4-02: Blog Post Metadata', async ({ page }) => {
    await page.goto('/blog');
    
    const firstCard = page.locator('#blog-posts-list .blog-post-card').first();
    await expect(firstCard).toBeVisible();

    // Check tag, publish date, reading time format
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
    
    // Select first card title link
    const titleLink = page.locator('#blog-posts-list .blog-post-card a').first();
    const href = await titleLink.getAttribute('href');
    expect(href).not.toBeNull();
    expect(href).toContain('/blog/');

    await titleLink.click();
    await page.waitForURL(`**${href}`);
    
    // Confirm detail reader path resolves and shows back link
    const backBtn = page.locator('text=Back to Blog');
    await expect(backBtn).toBeVisible();
  });

  // TC-F4-04: Markdown Rendering Elements
  test('TC-F4-04: Markdown Rendering Elements', async ({ page }) => {
    // Navigate directly to the chaos engineering detail page
    await page.goto('/blog/chaos-mesh-kubernetes');
    
    const article = page.locator('article');
    await expect(article).toBeVisible();

    // Contains headings
    const h2 = article.locator('h2');
    await expect(h2).toBeVisible();
    await expect(h2).toContainText('Why Chaos Mesh?');

    // Contains paragraphs
    const p = article.locator('p').first();
    await expect(p).toBeVisible();

    // Contains list items
    const li = article.locator('li').first();
    await expect(li).toBeVisible();
    await expect(li).toContainText('Network latency');

    // Contains syntax-highlighted code block
    const codeBlock = article.locator('pre');
    await expect(codeBlock).toBeVisible();
    await expect(codeBlock).toContainText('apiVersion: chaos-mesh.org');
  });

  // TC-F4-05: Blog Tag Filtering
  test('TC-F4-05: Blog Tag Filtering', async ({ page }) => {
    await page.goto('/blog');
    
    // Find a tag filter button (e.g. #AIOps)
    const tagButton = page.locator('.tag-filter-btn[data-tag="AIOps"]');
    await expect(tagButton).toBeVisible();

    await tagButton.click();
    await page.waitForTimeout(200);

    // Verify list is filtered
    const visibleCards = page.locator('#blog-posts-list .blog-post-card:not(.hidden)');
    const totalCards = await visibleCards.count();
    
    // Iterate through visible cards and ensure they all contain #AIOps
    for (let i = 0; i < totalCards; i++) {
      const cardTags = await visibleCards.nth(i).locator('.blog-card-tag').allTextContents();
      const hasTag = cardTags.some(t => t.includes('#AIOps'));
      expect(hasTag).toBe(true);
    }
  });

  // TC-F4-06: Future-Dated Posts Exclusion
  test('TC-F4-06: Future-Dated Posts Exclusion', async ({ page }) => {
    await page.goto('/blog');
    
    // The post with title "Future SRE Paradigms" is dated 2030 and should be excluded
    const futurePost = page.locator('text=Future SRE Paradigms');
    await expect(futurePost).toBeHidden();
  });

  // TC-F4-07: Draft Status Exclusion
  test('TC-F4-07: Draft Status Exclusion', async ({ page }) => {
    await page.goto('/blog');
    
    // The post with title "Unfinished Thoughts on Serverless" has draft: true and should be excluded
    const draftPost = page.locator('text=Unfinished Thoughts on Serverless');
    await expect(draftPost).toBeHidden();
  });

  // TC-F4-08: Outsized Reading Time
  test('TC-F4-08: Outsized Reading Time', async ({ page }) => {
    await page.goto('/blog');
    
    // Find the guide post
    const guidePost = page.locator('.blog-post-card', { hasText: 'Comprehensive Observability Guide' });
    await expect(guidePost).toBeVisible();

    // Verify it shows an outsized value
    const readingTime = guidePost.locator('.reading-time');
    await expect(readingTime).toBeVisible();
    await expect(readingTime).toHaveText('33 min read');
  });

  // TC-F4-09: Complex Slugs Encoding
  test('TC-F4-09: Complex Slugs Encoding', async ({ page }) => {
    await page.goto('/blog');
    
    // Find complex slug card link
    const complexPostLink = page.locator('.blog-post-card', { hasText: 'SRE @ Scale: 99.999% Reliability!' }).locator('a');
    await expect(complexPostLink).toBeVisible();

    const href = await complexPostLink.getAttribute('href');
    expect(href).not.toBeNull();
    
    // Navigate to it
    await complexPostLink.click();
    await page.waitForURL(`**${href}`);
    
    // Page renders correctly (select first h1 to avoid markdown heading conflicts)
    const heading = page.locator('main h1').first();
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('SRE @ Scale: 99.999% Reliability!');
  });


  // TC-F4-10: Blog 404 Routing
  test('TC-F4-10: Blog 404 Routing', async ({ page }) => {
    // Navigate to non-existent post
    const response = await page.goto('/blog/invalid-slug');
    
    // Playwright handles page transitions. The response status could be 404
    expect(response?.status()).toBe(404);

    // Verify page loads a custom 404 block with the return link
    const errorBlock = page.locator('text=Error: Resource Not Found');
    await expect(errorBlock).toBeVisible();

    const returnBtn = page.locator('text=Return to Blog');
    await expect(returnBtn).toBeVisible();
    await expect(returnBtn).toHaveAttribute('href', '/blog');
  });

});
