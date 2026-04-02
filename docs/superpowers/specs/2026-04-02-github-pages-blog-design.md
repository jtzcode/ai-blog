# GitHub Pages Blog Design

## Problem

Set up a personal blog for the GitHub account `jtzcode` and deploy it on GitHub Pages using the repository `jtzcode/ai-blog`. The blog should feel more professional and modern than a typical Hexo setup while staying simple, fast, and tech-oriented.

## Approved Direction

Use `Astro` with the `AstroPaper` theme as the base.

This direction was chosen because it gives the best balance of:

- professional visual style
- strong typography and readability
- modern static-site workflow
- easy content authoring with Markdown/MDX
- flexibility for later customization without the weight of a full app framework

## Goals

- Publish at `https://jtzcode.github.io/ai-blog/`
- Support bilingual Chinese and English content
- Keep the first version focused and clean
- Include search and comments
- Make deployment automatic through GitHub Actions
- Ship with sensible defaults for SEO, RSS, and sitemap generation

## Non-Goals

- Custom domain setup in the first version
- Heavy app-like interactivity
- Large plugin chains or a highly customized design system
- Migration of old Hexo content

## Architecture

### Stack

- Site framework: `Astro`
- Theme/base starter: `AstroPaper`
- Content format: Markdown with optional MDX
- Search: `Pagefind` static local search integrated at build time
- Comments: `Giscus`
- Hosting: GitHub Pages
- CI/CD: GitHub Actions

### Why AstroPaper

`AstroPaper` fits the requested tone: minimal, professional, technical, and content-first. Compared with Hexo-era themes, it offers a cleaner default information hierarchy, modern performance characteristics, and a more maintainable authoring/deployment experience.

## Site Structure

The first release should include:

- homepage
- post detail pages
- tags page
- archive page
- about page
- RSS feed
- sitemap

The homepage should emphasize readability and a calm, developer-oriented aesthetic rather than a marketing-heavy landing page.

## Content Model

Posts should live in Astro content collections.

Each post should support metadata such as:

- title
- description
- publish date
- updated date
- tags
- draft flag
- language/locale
- optional cover/social image

Bilingual support should be handled through locale-aware metadata and locale-prefixed routes such as `/en/...` and `/zh/...`, so Chinese and English posts can coexist cleanly without forcing a full translation pair for every article.

## Search and Comments

### Search

Use `Pagefind` so search stays fully static, works well on GitHub Pages, and indexes generated content at build time. It should search across both Chinese and English content without requiring a server.

### Comments

Use `Giscus` because it matches the GitHub-centered workflow and keeps comments tied to GitHub Discussions instead of introducing a separate third-party discussion backend.

Comment support depends on:

- the repository remaining accessible on GitHub
- GitHub Discussions being enabled for the repository
- selecting a discussion category for Giscus

If comment configuration is incomplete during initial setup, the site should still build and deploy cleanly with comments disabled until the remaining values are filled in.

## Deployment Design

Deployment should use GitHub Actions so pushes to the main branch automatically:

1. install dependencies
2. build the static site
3. publish the generated output to GitHub Pages

Because this is a project site, the build must use the `/ai-blog/` base path so assets and routes resolve correctly at `jtzcode.github.io/ai-blog/`.

## Reliability and Safe Defaults

- Keep dependency count conservative
- Avoid unnecessary client-side JavaScript
- Prefer build-time features over runtime services
- Make optional integrations fail safe rather than break the build
- Include starter content so the deployed site is not empty

## SEO and Syndication

The initial setup should include:

- site title and description defaults
- canonical URL/base URL configuration
- Open Graph/Twitter card defaults
- RSS feed generation
- sitemap generation

## Verification Strategy

Before considering the setup complete:

- local install must succeed
- local production build must succeed
- generated output must respect the `/ai-blog/` base path
- GitHub Actions workflow must be present for deployment
- search and comments configuration must be wired with clear fallbacks

## Manual Inputs Potentially Still Needed

The implementation can proceed with sensible defaults, but the following may still be needed to fully activate everything:

- final site title/description copy
- avatar or social preview image
- Giscus repository/category identifiers if comments are enabled immediately

## Implementation Shape

Implementation should stay narrow and focused:

- initialize Astro site
- apply AstroPaper-based configuration
- configure bilingual content collections and starter pages
- add search and comment integration
- add GitHub Actions deployment for GitHub Pages
- verify local build output
