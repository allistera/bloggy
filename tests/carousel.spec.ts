import { test, expect } from '@playwright/test';
import { 
  mockCarouselData, 
  singleCarouselItem, 
  brokenImageCarousel, 
  missingLinkCarousel 
} from './helpers/mock-data';

test.describe('Feature 3: Interactive Screenshot Carousel (R3) - Tier 1 & Tier 2', () => {

  test.beforeEach(async ({ page }) => {
    // Intercept all screenshot image requests to return a dummy 1x1 transparent PNG
    await page.route('**/screenshots/**/*.{png,jpg,jpeg,webp}', route => {
      const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      route.fulfill({
        status: 200,
        contentType: 'image/png',
        body: Buffer.from(pngBase64, 'base64')
      });
    });
    await page.route('**/assets/screenshots/**/*.{png,jpg,jpeg,webp}', route => {
      const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      route.fulfill({
        status: 200,
        contentType: 'image/png',
        body: Buffer.from(pngBase64, 'base64')
      });
    });

    // Intercept carousel data fetch by default
    await page.route('**/carousel.json', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCarouselData)
      });
    });

    // Also support inline window configuration
    await page.addInitScript((data) => {
      (window as any).carouselData = data;
    }, mockCarouselData);

    await page.goto('/');
  });


  // TC-F3-01: Carousel Container & Initial Slide
  test('TC-F3-01: Carousel Container & Initial Slide', async ({ page }) => {
    const container = page.locator('#carousel-container');
    await expect(container).toBeVisible();

    const activeSlide = container.locator('.carousel-slide.active');
    await expect(activeSlide).toBeVisible();
    await expect(activeSlide.locator('.carousel-title')).toHaveText(mockCarouselData[0].title);
    await expect(activeSlide.locator('.carousel-description')).toHaveText(mockCarouselData[0].description);
    await expect(activeSlide.locator('.carousel-image')).toHaveAttribute('src', mockCarouselData[0].image);
  });

  // TC-F3-02: Next Button Navigation
  test('TC-F3-02: Next Button Navigation', async ({ page }) => {
    const container = page.locator('#carousel-container');
    const nextBtn = container.locator('#carousel-next');

    // Click Next
    await nextBtn.click();

    const activeSlide = container.locator('.carousel-slide.active');
    await expect(activeSlide).toBeVisible();
    await expect(activeSlide.locator('.carousel-title')).toHaveText(mockCarouselData[1].title);
    await expect(activeSlide.locator('.carousel-description')).toHaveText(mockCarouselData[1].description);
  });

  // TC-F3-03: Previous Button Navigation
  test('TC-F3-03: Previous Button Navigation', async ({ page }) => {
    const container = page.locator('#carousel-container');
    const prevBtn = container.locator('#carousel-prev');

    // Click Previous on first slide should wrap around to the last slide
    await prevBtn.click();

    const activeSlide = container.locator('.carousel-slide.active');
    await expect(activeSlide).toBeVisible();
    const lastIndex = mockCarouselData.length - 1;
    await expect(activeSlide.locator('.carousel-title')).toHaveText(mockCarouselData[lastIndex].title);
  });

  // TC-F3-04: Indicator Dots Navigation
  test('TC-F3-04: Indicator Dots Navigation', async ({ page }) => {
    const container = page.locator('#carousel-container');
    const dots = container.locator('.carousel-dot');

    // Click the third dot (index 2)
    await dots.nth(2).click();

    const activeSlide = container.locator('.carousel-slide.active');
    await expect(activeSlide).toBeVisible();
    await expect(activeSlide.locator('.carousel-title')).toHaveText(mockCarouselData[2].title);
    
    // Check dot is active/highlighted
    await expect(dots.nth(2)).toHaveClass(/active/);
  });

  // TC-F3-05: External Repository Links
  test('TC-F3-05: External Repository Links', async ({ page }) => {
    const container = page.locator('#carousel-container');
    const activeSlide = container.locator('.carousel-slide.active');
    const repoLink = activeSlide.locator('.carousel-link');

    await expect(repoLink).toHaveAttribute('target', '_blank');
    await expect(repoLink).toHaveAttribute('href', mockCarouselData[0].link || '');
  });

  // TC-F3-06: Single Item Carousel Data
  test('TC-F3-06: Single Item Carousel Data', async ({ page, context }) => {
    // Open a new page with single item mock
    const singlePage = await context.newPage();
    await singlePage.route('**/carousel.json', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(singleCarouselItem)
      });
    });
    await singlePage.addInitScript((data) => {
      (window as any).carouselData = data;
    }, singleCarouselItem);

    await singlePage.goto('/');

    const container = singlePage.locator('#carousel-container');
    await expect(container).toBeVisible();

    // Arrows and dots should be hidden for single item
    await expect(container.locator('#carousel-next')).toBeHidden();
    await expect(container.locator('#carousel-prev')).toBeHidden();
    await expect(container.locator('.carousel-dot')).toBeHidden();

    // Verify slide renders statically
    const activeSlide = container.locator('.carousel-slide.active');
    await expect(activeSlide).toBeVisible();
    await expect(activeSlide.locator('.carousel-title')).toHaveText(singleCarouselItem[0].title);
    
    await singlePage.close();
  });

  // TC-F3-07: Broken Image URL Fallback
  test('TC-F3-07: Broken Image URL Fallback', async ({ page, context }) => {
    const brokenPage = await context.newPage();
    await brokenPage.route('**/carousel.json', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(brokenImageCarousel)
      });
    });
    await brokenPage.addInitScript((data) => {
      (window as any).carouselData = data;
    }, brokenImageCarousel);

    // Also route non-existent image to return 404
    await brokenPage.route('**/non-existent-image-path.png', route => route.abort());

    await brokenPage.goto('/');

    const container = brokenPage.locator('#carousel-container');
    const image = container.locator('.carousel-slide.active .carousel-image');
    
    // Slide renders, image should either load a placeholder or trigger error without crashing navigation scripts
    await expect(image).toBeVisible();
    
    // Carousel navigation controls should still be visible (for single item, they are hidden, but let's make sure it doesn't crash)
    await expect(container).toBeVisible();
    
    await brokenPage.close();
  });

  // TC-F3-08: Rapid Navigation Click Stress
  test('TC-F3-08: Rapid Navigation Click Stress', async ({ page }) => {
    const container = page.locator('#carousel-container');
    const nextBtn = container.locator('#carousel-next');

    // Spam click Next 10 times rapidly
    for (let i = 0; i < 10; i++) {
      await nextBtn.click();
    }

    // Carousel should not freeze, final state should be consistent (e.g. index 10 % 3 = 1)
    const activeSlide = container.locator('.carousel-slide.active');
    await expect(activeSlide).toBeVisible();
    await expect(activeSlide.locator('.carousel-title')).toHaveText(mockCarouselData[1].title);
  });

  // TC-F3-09: Keyboard & Touch Controls
  test('TC-F3-09: Keyboard & Touch Controls', async ({ page }) => {
    const container = page.locator('#carousel-container');
    
    // Focus the carousel container to receive keyboard events
    await container.focus();
    
    // Press ArrowRight
    await page.keyboard.press('ArrowRight');
    let activeSlide = container.locator('.carousel-slide.active');
    await expect(activeSlide.locator('.carousel-title')).toHaveText(mockCarouselData[1].title);

    // Press ArrowLeft
    await page.keyboard.press('ArrowLeft');
    activeSlide = container.locator('.carousel-slide.active');
    await expect(activeSlide.locator('.carousel-title')).toHaveText(mockCarouselData[0].title);
  });

  // TC-F3-10: Missing Slide Links Handling
  test('TC-F3-10: Missing Slide Links Handling', async ({ page, context }) => {
    const missingLinkPage = await context.newPage();
    
    // Intercept screenshots for this page
    await missingLinkPage.route('**/assets/screenshots/**/*.png', route => {
      const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      route.fulfill({
        status: 200,
        contentType: 'image/png',
        body: Buffer.from(pngBase64, 'base64')
      });
    });

    await missingLinkPage.route('**/carousel.json', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(missingLinkCarousel)
      });
    });
    await missingLinkPage.addInitScript((data) => {
      (window as any).carouselData = data;
    }, missingLinkCarousel);

    await missingLinkPage.goto('/');

    const container = missingLinkPage.locator('#carousel-container');
    const activeSlide = container.locator('.carousel-slide.active');
    
    // Repository button should be omitted, disabled, or rendered as non-interactive span
    const repoLink = activeSlide.locator('.carousel-link');
    const count = await repoLink.count();
    if (count > 0) {
      const tagName = await repoLink.evaluate(el => el.tagName.toLowerCase());
      if (tagName === 'a') {
        const href = await repoLink.getAttribute('href');
        expect(href === '#' || href === null || href === '').toBe(true);
        await expect(repoLink).toHaveClass(/disabled|opacity-50/);
      } else {
        await expect(repoLink).toHaveText('No Link Available');
      }
    } else {
      await expect(repoLink).toBeHidden();
    }

    await missingLinkPage.close();
  });

  // TC-F3-11: Screenshot opens in lightbox popup
  test('TC-F3-11: Screenshot lightbox popup', async ({ page }) => {
    const container = page.locator('#carousel-container');
    const lightbox = page.locator('#carousel-lightbox');
    const imageBtn = container.locator('.carousel-slide.active .carousel-image-btn');

    await expect(lightbox).toBeHidden();
    await imageBtn.click();

    await expect(lightbox).toBeVisible();
    await expect(lightbox.locator('#carousel-lightbox-title')).toHaveText(mockCarouselData[0].title);
    await expect(lightbox.locator('#carousel-lightbox-image')).toHaveAttribute('src', mockCarouselData[0].image);

    await page.keyboard.press('Escape');
    await expect(lightbox).toBeHidden();
  });

});
