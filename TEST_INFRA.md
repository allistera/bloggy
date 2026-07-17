# E2E Test Infrastructure & Test Case Specification

This document details the design, configuration, directory structure, and automated verification plan for **Bloggy**—the Lead SRE & AIOps Portfolio and Blog. It defines a comprehensive E2E test suite consisting of **49 test cases** structured across 4 execution tiers to guarantee both correctness of individual features and overall integration under real-world conditions.

---

## 1. Test Runner Selection & Rationale

We have selected **Playwright** as the automated testing framework for the E2E validation suite.

### Key Factors for Selection:
1. **Multi-Browser & Cross-Platform Support**: Playwright supports headless and headed execution across Chromium (Chrome/Edge), WebKit (Safari), and Firefox out of the box, with built-in device emulation profiles (e.g., Pixel 5, iPhone 12) for mobile responsiveness tests.
2. **Dynamic Content and Asynchronous Handling**: Bloggy uses **HTMX** for dynamic server-side page updates. Playwright has auto-waiting logic and flexible DOM assertions (`toBeVisible()`, etc.) that align perfectly with asynchronous HTMX fragment loading.
3. **Network Interception & Routing**: To robustly test the dynamic GitHub Projects integration (R2) without triggering GitHub API rate limits or requiring active credentials in CI/CD, we must mock network requests. Playwright provides built-in network interception (`page.route()`) to mock Astro endpoint responses (`/api/projects`), simulate offline/disconnected modes, and test timeout/failover behaviors.
4. **Tooling & DX**: The Playwright UI mode (`--ui`), debugging tools (`--debug`), and HTML reporting yield deep observability and facilitate fast feedback loops during implementation.

---

## 2. Directory & Folder Layout

All E2E tests and mocks will live in the `tests/` directory at the project root:

```
bloggy/
├── tests/
│   ├── portfolio.spec.ts        # F1: Portfolio homepage coverage (Tiers 1 & 2)
│   ├── projects.spec.ts         # F2: Dynamic GitHub Projects (Tiers 1 & 2)
│   ├── carousel.spec.ts         # F3: Screenshot Carousel (Tiers 1 & 2)
│   ├── blog.spec.ts             # F4: Astro Markdown Blog (Tiers 1 & 2)
│   ├── combinations.spec.ts     # Tier 3: Cross-Feature Combinations
│   ├── scenarios.spec.ts        # Tier 4: Real-world Application Scenarios
│   └── helpers/
│       └── mock-data.ts         # Mock data structures and configurations for offline testing
```

---

## 3. Test Scripts and Commands

The following commands are configured in `package.json` for running the test suite:

- **Run all E2E tests**:
  ```bash
  npm run test:e2e
  ```
  *(Maps to `playwright test`)*
- **Run tests in Playwright Interactive UI Mode**:
  ```bash
  npm run test:e2e:ui
  ```
  *(Maps to `playwright test --ui`)*
- **Run tests in Debug Mode (Step-by-step inspector)**:
  ```bash
  npm run test:e2e:debug
  ```
  *(Maps to `playwright test --debug`)*
- **Show HTML Test Execution Report**:
  ```bash
  npm run test:e2e:report
  ```
  *(Maps to `playwright show-report`)*

---

## 4. Playwright Configuration (`playwright.config.ts`)

A configuration is established at the project root to control parallel execution, viewport sizing, retries, reporting, and automatic launching of the local preview server.

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

---

## 5. Detailed Test Case Specifications (49 Cases)

The suite is divided into four structural tiers:
- **Tier 1 (Feature Coverage / Happy-path)**: 5 tests per feature (20 cases).
- **Tier 2 (Boundary & Corner Cases / Edges)**: 5 tests per feature (20 cases).
- **Tier 3 (Cross-Feature Combinations)**: 4 cases.
- **Tier 4 (Real-world Application Scenarios)**: 5 cases.

---

### Tier 1: Feature Coverage (Happy-Path)

#### Feature 1: Portfolio Showcase Homepage (R1)
1. **TC-F1-01: Main Header Elements**
   - **Description**: Verify homepage (`/`) loads successfully and displays the main heading containing "Lead SRE & AIOps Engineer".
   - **Expectation**: HTTP status is `200` and `<h1>` or main header contains exact title text.
2. **TC-F1-02: Developer & DevOps Background**
   - **Description**: Verify the homepage contains sections detailing the engineer's background as a senior developer and DevOps engineer.
   - **Expectation**: Sections containing "senior developer", "DevOps", or corresponding text/subheadings exist and are visible.
3. **TC-F1-03: Design Philosophy Render**
   - **Description**: Verify the portfolio homepage lists the design philosophy emphasizing simplicity and the KISS principle.
   - **Expectation**: Container text displays "KISS" or "Keep It Simple, Stupid" / "simplicity".
4. **TC-F1-04: Header & Footer Navigation Links**
   - **Description**: Verify that the homepage header has clickable links to "Home" and "Blog", and that the footer contains social links.
   - **Expectation**: Navigation anchor tags possess correct `href` attributes (`/`, `/blog`, etc.) and are clickable.
5. **TC-F1-05: Dark SRE Theme Styling**
   - **Description**: Verify CSS classes styling uses SRE-themed high-contrast colors (e.g. Tailwind dark backgrounds, contrast text) and spans full width.
   - **Expectation**: Base layout wrapper has dark background color classes applied and uses full-width utilities (e.g., `w-full` or screen scaling classes).

#### Feature 2: Dynamic GitHub Projects Integration (R2)
6. **TC-F2-01: HTMX Loading Attributes**
   - **Description**: Verify the projects container on the homepage contains valid HTMX attributes to trigger server loading.
   - **Expectation**: Element contains `hx-get="/api/projects"` and `hx-trigger="load"`.
7. **TC-F2-02: API Projects Endpoint**
   - **Description**: Make a direct request to the `/api/projects` endpoint and inspect the response.
   - **Expectation**: Returns status code `200`, content type header is `text/html`, and returns raw HTML template snippets.
8. **TC-F2-03: Dynamic Card Swapping**
   - **Description**: Navigate to `/` and inspect the DOM after HTMX loads to confirm project card elements are inserted.
   - **Expectation**: Target container (e.g. `#projects-list` or similar container class) contains child element instances of `.project-card`.
9. **TC-F2-04: Project Card Details**
   - **Description**: Verify that each dynamically loaded project card lists the required metadata from GitHub.
   - **Expectation**: Displays name, description, stars count, forks count, programming language, and last updated timestamp.
10. **TC-F2-05: Fallback Mock Cards**
    - **Description**: Intercept requests to `/api/projects` and mock a network failure or empty API response to force fallback logic.
    - **Expectation**: The page displays fallback cached portfolio projects (e.g. `automated-chaos-mesh`, `kubernetes-cost-optimizer`) gracefully instead of failing.

#### Feature 3: Interactive Full-Screen Screenshot Carousel (R3)
11. **TC-F3-01: Carousel Container & Initial Slide**
    - **Description**: Verify the carousel loads and defaults to displaying the first configured slide from `carousel.json`.
    - **Expectation**: Slide 1 image, title, and description are visible within the browser mockup window.
12. **TC-F3-02: Next Button Navigation**
    - **Description**: Click the "Next" action button and verify the slide transitions to the second index.
    - **Expectation**: Active slide state updates and second slide title/description/image becomes visible.
13. **TC-F3-03: Previous Button Navigation**
    - **Description**: Click the "Previous" action button on the first slide and verify wrap-around behavior.
    - **Expectation**: Active slide wraps back to the final slide index in the `carousel.json` configuration.
14. **TC-F3-04: Indicator Dots Navigation**
    - **Description**: Click a specific navigation dot indicator (e.g., slide dot 3) and check slide index.
    - **Expectation**: Active slide changes directly to index 2 (third slide) and the dot is visually highlighted.
15. **TC-F3-05: External Repository Links**
    - **Description**: Verify that the browser mockup container has a link pointing to the project's external repository.
    - **Expectation**: Link contains `target="_blank"` and links to the correct repository URL from `carousel.json`.

#### Feature 4: Astro Markdown Blog (R4)
16. **TC-F4-01: Blog Index Listing**
    - **Description**: Navigate to `/blog` and verify it renders the list of local markdown blog articles.
    - **Expectation**: Article list elements or links exist for each published Markdown post.
17. **TC-F4-02: Blog Post Metadata**
    - **Description**: Verify each post summary contains tags, publish date, and reading time.
    - **Expectation**: Card or summary element exposes tag values, formatted date, and a string like `X min read`.
18. **TC-F4-03: Blog Post Redirection**
    - **Description**: Click on a post title or card on the blog index and check page transition.
    - **Expectation**: Redirects to the dynamic blog reader path `/blog/[slug]`.
19. **TC-F4-04: Markdown Rendering Elements**
    - **Description**: Access a blog post detail page and check for proper HTML markup elements parsed from Markdown.
    - **Expectation**: Page contains proper heading elements (`<h2>`, `<h3>`), paragraphs, list items (`<ul>`/`<li>`), and syntax-highlighted code blocks (`<pre>`).
20. **TC-F4-05: Blog Tag Filtering**
    - **Description**: Select and click an article tag on the blog index.
    - **Expectation**: The list is dynamically filtered to only display articles containing that specific tag.

---

### Tier 2: Boundary & Corner Cases

#### Feature 1: Portfolio Showcase Homepage (R1)
21. **TC-F1-06: Ultra-Wide Screens Layout**
    - **Description**: Emulate viewport size corresponding to ultra-wide resolutions (width >= 2560px).
    - **Expectation**: Elements remain centered, text lines do not stretch to unreadable lengths, and no layout breaks occur.
22. **TC-F1-07: Micro-Screen Responsiveness**
    - **Description**: Emulate viewport size corresponding to micro-mobile devices (width = 320px).
    - **Expectation**: Title text wraps, elements stack vertically, and no horizontal scrollbars are introduced.
23. **TC-F1-08: CSS Slow Load Recovery**
    - **Description**: Block or delay CSS loading during request initialization.
    - **Expectation**: The bare HTML layout remains structured and readable, displaying core information in semantic order.
24. **TC-F1-09: Accessibility Focus States**
    - **Description**: Navigate the page solely using the Tab key.
    - **Expectation**: All active nodes (headers, links, buttons, carousel elements) exhibit distinct focus outlines.
25. **TC-F1-10: SEO & Viewport Meta Tags**
    - **Description**: Inspect HTML header metadata tags.
    - **Expectation**: Contains valid viewport configuration, document description, open graph fields, and language tag.

#### Feature 2: Dynamic GitHub Projects Integration (R2)
26. **TC-F2-06: Empty API Response**
    - **Description**: Intercept `/api/projects` and mock a `200` response containing an empty JSON array/fragment list.
    - **Expectation**: UI handles the empty payload cleanly, showing a placeholder message (e.g. "No repositories found").
27. **TC-F2-07: Spinner/Skeleton Loader**
    - **Description**: Intercept `/api/projects` and introduce a artificial network delay of 3 seconds.
    - **Expectation**: A loading spinner or skeleton component is visible within the container while the request is pending.
28. **TC-F2-08: API 500 Error Recovery**
    - **Description**: Intercept `/api/projects` and respond with a `500 Internal Server Error`.
    - **Expectation**: The site handles the server exception gracefully and defaults back to rendering local pre-cached fallback configurations.
29. **TC-F2-09: Excessively Long Repository Details**
    - **Description**: Intercept the project list API payload and insert repository details containing extremely long names/descriptions.
    - **Expectation**: Text wraps within the project cards cleanly without breaking layouts or overlapping nearby UI blocks.
30. **TC-F2-10: Network Timeout Failover**
    - **Description**: Intercept `/api/projects` and hang the request indefinitely to test client-side timeout thresholds.
    - **Expectation**: Request terminates after a timeout limit and falls back to rendering local fallback projects.

#### Feature 3: Interactive Full-Screen Screenshot Carousel (R3)
31. **TC-F3-06: Single Item Carousel Data**
    - **Description**: Intercept and mock `/src/data/carousel.json` (or inline data) to return only 1 slide element.
    - **Expectation**: Left/right arrow buttons and index dot indicators are hidden, and the single slide renders statically.
32. **TC-F3-07: Broken Image URL Fallback**
    - **Description**: Configure a carousel slide image with a non-existent file path.
    - **Expectation**: Slide renders a fallback graphical placeholder and does not crash the client-side carousel navigation scripts.
33. **TC-F3-08: Rapid Navigation Click Stress**
    - **Description**: Trigger a rapid automated series of 10 consecutive clicks on the "Next" button in less than 2 seconds.
    - **Expectation**: Transition animations do not queue infinitely or freeze the page, and the final state is consistent with clicks.
34. **TC-F3-09: Keyboard & Touch Controls**
    - **Description**: Focus the carousel wrapper and dispatch keyboard arrow events, or emulate swipe touches on mobile.
    - **Expectation**: Arrow-left/arrow-right keys and touch gestures advance/reverse slides successfully.
35. **TC-F3-10: Missing Slide Links Handling**
    - **Description**: Configure a slide in `carousel.json` without an external project repository `link` attribute.
    - **Expectation**: Slide details are displayed but the repository button is omitted or visually disabled.

#### Feature 4: Astro Markdown Blog (R4)
36. **TC-F4-06: Future-Dated Posts Exclusion**
    - **Description**: Introduce a markdown post file with frontmatter publish date configured in the future.
    - **Expectation**: The future post is excluded from the `/blog` index at build time.
37. **TC-F4-07: Draft Status Exclusion**
    - **Description**: Place a markdown post file with `draft: true` in the frontmatter.
    - **Expectation**: The draft post is excluded from the `/blog` listing.
38. **TC-F4-08: Outsized Reading Time**
    - **Description**: Place an unusually large markdown file in the blog content directory to check reading time calculation.
    - **Expectation**: The listing page accurately displays the large value (e.g., "55 min read") without formatting issues.
39. **TC-F4-09: Complex Slugs Encoding**
    - **Description**: Create a post file with special symbols and spaces in the title frontmatter.
    - **Expectation**: Slug is generated with proper URL-safe character escaping, and navigating to it resolves to the post successfully.
40. **TC-F4-10: Blog 404 Routing**
    - **Description**: Attempt to direct-navigate to a non-existent post URL under `/blog/invalid-slug`.
    - **Expectation**: Page loads a custom 404 block styled with the blog layout containing a link returning to `/blog`.

---

### Tier 3: Cross-Feature Combinations

41. **TC-COMBO-01: Homepage Navigation & State Reset**
    - **Description**: Click through from the homepage (`/`) to a blog article, and then return to `/` using the header nav.
    - **Expectation**: Homepage carousel resets to slide index 0, and HTMX executes the reload trigger on `/api/projects`.
42. **TC-COMBO-02: Tag Filters & Project Intersections**
    - **Description**: Click an article tag (e.g. `AIOps`) on `/blog` and check listing.
    - **Expectation**: The blog list is filtered, but the homepage projects container does not get affected.
43. **TC-COMBO-03: Carousel Link Isolation**
    - **Description**: Open an external repository link from slide 3 of the carousel (which opens a new window).
    - **Expectation**: Main application window state is completely preserved, including active slide index and navigation.
44. **TC-COMBO-04: API Page Refresh Behavior**
    - **Description**: Direct-navigate to `/api/projects` in the web browser, view the snippet, and press back.
    - **Expectation**: Browser renders raw HTML fragment at `/api/projects`, and returning to `/` resumes normal dynamic page state.

---

### Tier 4: Real-world Application Scenarios

45. **TC-SCENARIO-01: Recruiter Portfolio Journey**
    - **Description**: Run a complete user flow simulating a typical hiring manager's experience:
      1. Lands on homepage `/` and validates SRE title.
      2. Scrolls down to the carousel and clicks "Next" twice.
      3. Clicks the repository external link (mocked to load in a separate window/tab).
      4. Navigates back, scrolls down to check the dynamically populated GitHub card stats.
      5. Clicks "Blog" in the top navigation, selects a post to read, and then clicks the header home link.
    - **Expectation**: All actions complete successfully without runtime script errors, layout breaks, or network blocks.
46. **TC-SCENARIO-02: Offline/Disconnected Behavior**
    - **Description**: Simulates the portfolio loading with no active internet connectivity using network throttling.
    - **Expectation**: The page remains responsive. The homepage falls back to static content, local placeholder pictures display, and the HTMX section triggers fallbacks gracefully.
47. **TC-SCENARIO-03: Core Web Vitals & Layout Shifts**
    - **Description**: Load `/` under CPU throttling conditions (e.g. 4x slowdown) to check for page jitter.
    - **Expectation**: Largest Contentful Paint (LCP) triggers within 1.2s, and Cumulative Layout Shift (CLS) is below 0.1 by utilizing pre-sized layout containers for the dynamic HTMX region.
48. **TC-SCENARIO-04: Deep Link SEO Audit**
    - **Description**: Directly open a specific blog post URL from search engine indexing references.
    - **Expectation**: Page compiles, renders markdown content correctly, and possesses matching SEO/OpenGraph header metadata.
49. **TC-SCENARIO-05: High-speed Interaction / Stress Test**
    - **Description**: Automate rapid events: navigate back and forth, spam next/prev carousel arrows 10 times, and flip blog tabs.
    - **Expectation**: UI transitions process clean, no execution hangs occur, and browser memory footprints remain stable.
