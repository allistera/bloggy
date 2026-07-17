# Original User Request

## Initial Request — 2026-07-17T12:19:24Z

A premium portfolio homepage and blog for a Lead SRE & AIOps Engineer, designed to showcase open-source projects using bold, minimal typography and full-screen screenshot layouts, targeted at software engineers.

Working directory: /Users/allistera/Development/Projects/bloggy
Integrity mode: development

## Requirements

### R1. Portfolio Showcase Homepage
Bold typography, large text, and a minimal design (KISS principle) maximizing page width. It must highlight the user's role (Lead SRE & AIOps Engineer with a background as a senior developer and DevOps engineer) and design philosophy.

### R2. Dynamic GitHub Projects Integration
Display open-source projects by dynamically fetching repository details (name, description, stars, forks, language, last updated) from the GitHub API. This dynamic retrieval must be driven by HTMX.

### R3. Interactive Full-Screen Screenshot Carousel
Include an interactive showcase displaying project screenshots inside a clean, modern browser mockup. The configuration (titles, screenshot images, links) must be loaded from a simple JSON configuration file or Astro data structure for easy customization.

### R4. Astro Markdown Blog
An elegant, readable blog section utilizing Astro Content Collections (local Markdown files) to manage and render articles, featuring metadata (tags, publish date, reading time) and clean layouts.

## Verification

- The project must compile successfully (`npm run build` or `npx astro build`).
- The team must write an automated verification script (e.g., using Playwright or a Node test script using a headless browser) to verify:
  - Root page renders with the correct SRE/AIOps header and portfolio sections.
  - Blog page lists the local Markdown posts.
  - HTMX dynamic projects integration makes a request and loads project cards.
  - Screenshot carousel functions correctly when navigating slides.

## Acceptance Criteria

### Technical & Aesthetics
- [ ] Astro site builds successfully with zero compile errors.
- [ ] Page designs are bold, minimal, mobile-responsive, and use high-contrast modern typography.
- [ ] Dynamic project cards are loaded via HTMX endpoints (e.g. Astro endpoint returning HTML snippets).
- [ ] Blog content is managed locally via Astro Content Collections.
- [ ] Page load performance and Core Web Vitals are optimized (Lighthouse score >= 90).
- [ ] The repository includes a clear `README.md` on how to configure and run the site.
