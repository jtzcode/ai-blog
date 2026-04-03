# jtzcode blog

A bilingual Astro blog for `https://jtzcode.github.io/ai-blog/`, based on AstroPaper and deployed with GitHub Pages.

## Local development

```bash
npm install
npm run dev
```

## Production checks

```bash
npm run build
npm run lint
npm run format:check
```

## GitHub Pages setup

1. Push the `main` branch.
2. In GitHub, open **Settings -> Pages**.
3. Set **Source** to **GitHub Actions**.
4. Wait for the `Deploy to GitHub Pages` workflow to finish.

## Publish a new post

Create a Markdown file in one of these folders:

- `src/data/blog/en/` for English posts
- `src/data/blog/zh/` for Chinese posts

Example frontmatter:

```md
---
title: My new post
description: Short summary for cards and SEO.
pubDatetime: 2026-04-02T12:00:00Z
tags:
  - ai
  - notes
lang: en
translationKey: optional-shared-key
featured: false
---

Write the post here.
```

Then commit and push:

```bash
git add src/data/blog
git commit -m "feat: add new post"
git push
```

A push to `main` triggers GitHub Actions and redeploys the site automatically.

## Optional Giscus setup

Comments are wired but intentionally disabled until you fill in the public Giscus values.

1. Enable **GitHub Discussions** in the repository.
2. Create or choose a discussion category in Giscus and copy the generated values.
3. Create a local `.env` file in the repository root (next to `package.json`) and fill these values:

   ```env
   PUBLIC_GISCUS_REPO=jtzcode/ai-blog
   PUBLIC_GISCUS_REPO_ID=...
   PUBLIC_GISCUS_CATEGORY=General
   PUBLIC_GISCUS_CATEGORY_ID=...
   ```

4. In GitHub, add the same four `PUBLIC_GISCUS_*` names for production builds. Repository-level **Actions Variables** work, and the workflow also reads them from the `github-pages` environment if you store them there instead.
5. Push to `main` again or re-run the deploy workflow. Comments will appear below each post after the new build finishes.
