# GitHub Pages Astro Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a bilingual personal blog for `jtzcode` at `https://jtzcode.github.io/ai-blog/` using AstroPaper, GitHub Pages, local search, and GitHub-native comments.

**Architecture:** Start from the upstream `AstroPaper` starter in the repository root, then tune its config and content model for project-site deployment (`/ai-blog`) and bilingual routing. Keep the first release content-first: a neutral landing page, English and Chinese homepages, locale-aware starter posts, static search powered by Pagefind, and env-gated Giscus comments that do not break the build when comment identifiers are missing.

**Tech Stack:** Astro, AstroPaper, TypeScript, TailwindCSS, Markdown/MDX, Pagefind, GitHub Actions, Giscus

---

## File Map

- `package.json` — project scripts and the build hook that generates the Pagefind index.
- `astro.config.ts` — canonical site URL and GitHub Pages `base` configuration.
- `src/config.ts` — site title, description, author, timezone, and locale metadata.
- `src/content.config.ts` — blog collection schema, including required bilingual frontmatter.
- `src/utils/getLocalePosts.ts` — shared helper that returns published posts for a single locale.
- `src/components/LanguageSwitcher.astro` — reusable EN / 中文 switcher.
- `src/components/LocalePostList.astro` — reusable post list for locale homepages.
- `src/components/GiscusComments.astro` — optional comments embed that only renders when all public Giscus values are present.
- `src/pages/index.astro` — neutral landing page linking to both locales.
- `src/pages/en/index.astro` — English homepage.
- `src/pages/zh/index.astro` — Chinese homepage.
- `src/pages/en/about.md` — English about page.
- `src/pages/zh/about.md` — Chinese about page.
- `src/pages/search.astro` — static search page using Pagefind UI.
- `src/layouts/PostDetails.astro` — single-post layout; insert comments and a locale switch target here.
- `src/env.d.ts` — public env variable types for Giscus.
- `src/data/blog/en/welcome-to-jtzcode.md` — starter English post.
- `src/data/blog/zh/huan-ying-lai-dao-jtzcode.md` — starter Chinese post.
- `.env.example` — public Giscus variable names for local and CI configuration.
- `.github/workflows/deploy.yml` — official Astro GitHub Pages workflow.
- `README.md` — local development, deploy, GitHub Pages, and Giscus setup instructions.

### Task 1: Bootstrap the AstroPaper starter in the repo

**Files:**
- Create: `package.json`
- Create: `astro.config.ts`
- Create: `src/config.ts`
- Create: `src/content.config.ts`
- Create: `src/layouts/**/*`
- Create: `src/pages/**/*`
- Create: `src/components/**/*`
- Create: `public/**/*`
- Modify: `.gitignore`
- Test: `npm run build`
- Test: `npm run lint`
- Test: `npm run format:check`

- [ ] **Step 1: Confirm the repo checkout and baseline state**

```bash
pwd
git remote -v
git status --short
```

Expected: the working directory is the `ai-blog` checkout and there are no unexpected tracked files outside the brainstorming artifacts.

- [ ] **Step 2: Scaffold AstroPaper directly into the repo root**

```bash
npm create astro@latest -- --template satnaing/astro-paper .
```

Expected: root files such as `package.json`, `astro.config.ts`, `src/config.ts`, and `src/content.config.ts` appear in place.

- [ ] **Step 3: Keep brainstorming artifacts out of version control**

Update `.gitignore` to keep the local visual-companion files out of the repo:

```gitignore
.superpowers/
```

- [ ] **Step 4: Install dependencies and verify the unmodified starter**

```bash
npm install
npm run build
npm run lint
npm run format:check
```

Expected: all three commands pass with the untouched starter.

- [ ] **Step 5: Commit the starter bootstrap**

```bash
git add .gitignore package.json package-lock.json astro.config.ts src public
git commit -m "chore: bootstrap astropaper starter"
```

### Task 2: Configure GitHub Pages base path and site metadata

**Files:**
- Modify: `astro.config.ts`
- Modify: `src/config.ts`
- Test: `npm run build`

- [ ] **Step 1: Prove the starter does not yet build for a project-site base path**

```bash
npm run build
rg '"/ai-blog/' dist/index.html dist/404.html
```

Expected: the build succeeds, but the `rg` command returns no matches because the starter is still configured for root deployment.

- [ ] **Step 2: Update `astro.config.ts` for GitHub Pages**

Keep the existing integrations from the starter and add the project-site settings below:

```ts
export default defineConfig({
  site: "https://jtzcode.github.io",
  base: "/ai-blog",
});
```

- [ ] **Step 3: Replace the default site metadata in `src/config.ts`**

Set the published metadata to a clean tech-blog default and add locale definitions:

```ts
export const SITE = {
  website: "https://jtzcode.github.io/ai-blog/",
  author: "jtzcode",
  profile: "https://github.com/jtzcode",
  title: "jtzcode",
  desc: "Notes on software, AI, and systems in English and 中文.",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerPage: 6,
  scheduledPostMargin: 15 * 60 * 1000,
  showArchives: true,
  showBackButton: true,
  editPost: {
    enabled: false,
    text: "Suggest changes",
    url: "",
  },
  dynamicOgImage: false,
  lang: "en",
  dir: "ltr",
  timezone: "Asia/Shanghai",
} as const;

export const LOCALES = [
  { code: "en", label: "EN", href: "/en/" },
  { code: "zh", label: "中文", href: "/zh/" },
] as const;
```

- [ ] **Step 4: Rebuild and verify the project-site path is wired**

```bash
npm run build
rg '"/ai-blog/' dist/index.html dist/404.html
```

Expected: the second command prints matches for the generated asset and link URLs.

- [ ] **Step 5: Commit the Pages and metadata config**

```bash
git add astro.config.ts src/config.ts
git commit -m "feat: configure GitHub Pages base and site metadata"
```

### Task 3: Extend the content schema and add bilingual starter posts

**Files:**
- Modify: `src/content.config.ts`
- Create: `src/utils/getLocalePosts.ts`
- Create: `src/data/blog/en/welcome-to-jtzcode.md`
- Create: `src/data/blog/zh/huan-ying-lai-dao-jtzcode.md`
- Test: `npm run build`

- [ ] **Step 1: Require locale metadata in the blog collection**

Extend the blog schema in `src/content.config.ts`:

```ts
const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: `./${BLOG_PATH}` }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(SITE.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image().or(z.string()).optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),
      lang: z.enum(["en", "zh"]),
      translationKey: z.string().optional(),
    }),
});
```

- [ ] **Step 2: Add a locale filter helper**

Create `src/utils/getLocalePosts.ts`:

```ts
import { getCollection } from "astro:content";

export async function getLocalePosts(lang: "en" | "zh") {
  const posts = await getCollection(
    "blog",
    ({ data }) => !data.draft && data.lang === lang,
  );

  return posts.sort(
    (a, b) => b.data.pubDatetime.valueOf() - a.data.pubDatetime.valueOf(),
  );
}
```

- [ ] **Step 3: Seed an English starter post**

Create `src/data/blog/en/welcome-to-jtzcode.md`:

```md
---
title: Welcome to jtzcode
description: The first English post on the new GitHub Pages blog.
pubDatetime: 2026-04-02T00:00:00Z
tags:
  - intro
  - engineering
lang: en
translationKey: welcome
---

This is the first English post on the new Astro-powered blog.

I will use this site for notes on software, AI, and systems.
```

- [ ] **Step 4: Seed a Chinese starter post**

Create `src/data/blog/zh/huan-ying-lai-dao-jtzcode.md`:

```md
---
title: 欢迎来到 jtzcode
description: 新博客的第一篇中文文章。
pubDatetime: 2026-04-02T00:00:00Z
tags:
  - 介绍
  - 工程
lang: zh
translationKey: welcome
---

这是新博客的第一篇中文文章。

这里会记录软件、AI 和系统相关的内容。
```

- [ ] **Step 5: Verify the bilingual content model**

```bash
npm run build
test -f dist/posts/en/welcome-to-jtzcode/index.html
test -f dist/posts/zh/huan-ying-lai-dao-jtzcode/index.html
```

Expected: the build succeeds and both locale-specific starter post routes are generated.

- [ ] **Step 6: Commit the bilingual content foundation**

```bash
git add src/content.config.ts src/utils/getLocalePosts.ts src/data/blog/en src/data/blog/zh
git commit -m "feat: add bilingual content schema and starter posts"
```

### Task 4: Build the locale landing pages and about pages

**Files:**
- Create: `src/components/LanguageSwitcher.astro`
- Create: `src/components/LocalePostList.astro`
- Create: `src/pages/index.astro`
- Create: `src/pages/en/index.astro`
- Create: `src/pages/zh/index.astro`
- Create: `src/pages/en/about.md`
- Create: `src/pages/zh/about.md`
- Test: `npm run build`

- [ ] **Step 1: Create a reusable language switcher**

Create `src/components/LanguageSwitcher.astro`:

```astro
---
import { LOCALES } from "@/config";

const pathname = Astro.url.pathname;
---

<nav aria-label="Language switcher" class="flex flex-wrap gap-2 text-sm">
  {LOCALES.map(locale => (
    <a
      href={locale.href}
      class:list={[
        "rounded border border-dashed px-3 py-1 transition hover:bg-muted",
        pathname.startsWith(locale.href) && "bg-muted font-medium",
      ]}
    >
      {locale.label}
    </a>
  ))}
</nav>
```

- [ ] **Step 2: Create a reusable locale post list**

Create `src/components/LocalePostList.astro`:

```astro
---
import type { CollectionEntry } from "astro:content";

interface Props {
  posts: CollectionEntry<"blog">[];
}

const { posts } = Astro.props;
---

<ul class="mt-8 space-y-6">
  {posts.map(post => (
    <li class="border-b border-dashed pb-6 last:border-b-0">
      <a
        href={`/posts/${post.slug}/`}
        class="text-xl font-semibold text-accent transition hover:underline"
      >
        {post.data.title}
      </a>
      <p class="mt-2 text-sm opacity-80">{post.data.description}</p>
    </li>
  ))}
</ul>
```

- [ ] **Step 3: Create the root landing page**

Create `src/pages/index.astro`:

```astro
---
import Layout from "@/layouts/Layout.astro";
---

<Layout title="jtzcode" description="Choose English or 中文">
  <main class="app-layout py-16">
    <h1 class="text-4xl font-bold text-accent">jtzcode</h1>
    <p class="mt-4 max-w-2xl text-lg">
      Notes on software, AI, and systems in English and 中文.
    </p>
    <div class="mt-10 grid gap-4 sm:grid-cols-2">
      <a href="/en/" class="rounded border border-border p-6 transition hover:bg-muted">
        English posts
      </a>
      <a href="/zh/" class="rounded border border-border p-6 transition hover:bg-muted">
        中文文章
      </a>
    </div>
  </main>
</Layout>
```

- [ ] **Step 4: Create the English and Chinese homepages**

Create `src/pages/en/index.astro` and `src/pages/zh/index.astro` using the same pattern:

```astro
---
import Main from "@/layouts/Main.astro";
import LanguageSwitcher from "@/components/LanguageSwitcher.astro";
import LocalePostList from "@/components/LocalePostList.astro";
import { getLocalePosts } from "@/utils/getLocalePosts";

const posts = await getLocalePosts("en");
---

<Main pageTitle="English" pageDesc="Posts in English">
  <LanguageSwitcher />
  <LocalePostList posts={posts} />
</Main>
```

For the Chinese page, change the locale call and copy:

```astro
const posts = await getLocalePosts("zh");
```

and:

```astro
<Main pageTitle="中文" pageDesc="中文文章">
```

- [ ] **Step 5: Create locale-specific about pages**

Create `src/pages/en/about.md`:

```md
---
layout: ../../layouts/AboutLayout.astro
title: About
---

I am jtzcode. This site is for writing about software, AI, and systems.
```

Create `src/pages/zh/about.md`:

```md
---
layout: ../../layouts/AboutLayout.astro
title: 关于
---

我是 jtzcode。这个站点会记录软件、AI 和系统相关的内容。
```

- [ ] **Step 6: Verify the locale routes**

```bash
npm run build
test -f dist/index.html
test -f dist/en/index.html
test -f dist/zh/index.html
test -f dist/en/about/index.html
test -f dist/zh/about/index.html
```

Expected: the neutral landing page and both locale routes are generated.

- [ ] **Step 7: Commit the locale pages**

```bash
git add src/components/LanguageSwitcher.astro src/components/LocalePostList.astro src/pages/index.astro src/pages/en src/pages/zh
git commit -m "feat: add bilingual landing and about pages"
```

### Task 5: Add static search and fail-safe GitHub comments

**Files:**
- Modify: `package.json`
- Modify: `src/layouts/PostDetails.astro`
- Modify: `src/env.d.ts`
- Create: `src/pages/search.astro`
- Create: `src/components/GiscusComments.astro`
- Create: `.env.example`
- Test: `npm run build`

- [ ] **Step 1: Add Pagefind to the build and prove it is currently missing**

Before changing the build, show that the search index is not generated:

```bash
npm run build
test -d dist/pagefind
```

Expected: the `test -d` command exits non-zero because Pagefind has not been wired yet.

Then install Pagefind and update the build script:

```bash
npm install -D pagefind
```

Update `package.json`:

```json
{
  "scripts": {
    "build": "astro build && pagefind --site dist"
  }
}
```

- [ ] **Step 2: Create the search page**

Create `src/pages/search.astro`:

```astro
---
import Main from "@/layouts/Main.astro";
---

<Main pageTitle="Search" pageDesc="Search across English and Chinese posts">
  <div id="search"></div>
  <link rel="stylesheet" href="/pagefind/pagefind-ui.css" />
  <script src="/pagefind/pagefind-ui.js"></script>
  <script is:inline>
    window.addEventListener("DOMContentLoaded", () => {
      new PagefindUI({
        element: "#search",
        showSubResults: true,
        excerptLength: 18,
      });
    });
  </script>
</Main>
```

- [ ] **Step 3: Type the public Giscus env variables**

Update `src/env.d.ts`:

```ts
interface ImportMetaEnv {
  readonly PUBLIC_GISCUS_REPO?: string;
  readonly PUBLIC_GISCUS_REPO_ID?: string;
  readonly PUBLIC_GISCUS_CATEGORY?: string;
  readonly PUBLIC_GISCUS_CATEGORY_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 4: Create the env-gated comments component**

Create `src/components/GiscusComments.astro`:

```astro
---
const repo = import.meta.env.PUBLIC_GISCUS_REPO;
const repoId = import.meta.env.PUBLIC_GISCUS_REPO_ID;
const category = import.meta.env.PUBLIC_GISCUS_CATEGORY;
const categoryId = import.meta.env.PUBLIC_GISCUS_CATEGORY_ID;

const enabled = Boolean(repo && repoId && category && categoryId);
---

{enabled && (
  <section class="mt-12" data-pagefind-ignore>
    <h2 class="mb-4 text-lg font-semibold">Discussion</h2>
    <script
      src="https://giscus.app/client.js"
      data-repo={repo}
      data-repo-id={repoId}
      data-category={category}
      data-category-id={categoryId}
      data-mapping="pathname"
      data-strict="0"
      data-reactions-enabled="1"
      data-emit-metadata="0"
      data-input-position="top"
      data-theme="preferred_color_scheme"
      data-lang="en"
      crossorigin="anonymous"
      async
    />
  </section>
)}
```

- [ ] **Step 5: Mount comments in the post layout**

Update `src/layouts/PostDetails.astro` by importing the new component and rendering it below the existing post content:

```astro
---
import GiscusComments from "@/components/GiscusComments.astro";
---

<GiscusComments />
```

Place the component after the article metadata / sharing section and before the previous-next navigation block so it stays attached to the current post.

- [ ] **Step 6: Document the public comment values**

Create `.env.example`:

```dotenv
PUBLIC_GISCUS_REPO=jtzcode/ai-blog
PUBLIC_GISCUS_REPO_ID=
PUBLIC_GISCUS_CATEGORY=General
PUBLIC_GISCUS_CATEGORY_ID=
```

- [ ] **Step 7: Verify build-time search and fail-safe comments**

```bash
npm run build
test -d dist/pagefind
test -f dist/search/index.html
```

Expected: the build succeeds even with blank Giscus identifiers, and the Pagefind assets are generated.

- [ ] **Step 8: Commit search and comments**

```bash
git add package.json package-lock.json src/pages/search.astro src/components/GiscusComments.astro src/layouts/PostDetails.astro src/env.d.ts .env.example
git commit -m "feat: add static search and fail-safe comments"
```

### Task 6: Add GitHub Pages deployment and project documentation

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `README.md`
- Test: `npm run build`
- Test: `npm run lint`
- Test: `npm run format:check`

- [ ] **Step 1: Add the official Astro GitHub Pages workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v5

      - name: Install, build, and upload site
        uses: withastro/action@v5
        with:
          path: .
          package-manager: npm

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Rewrite `README.md` for the new blog workflow**

Replace the starter README with sections that cover this structure:

```md
# jtzcode blog

## Local development

- `npm install`
- `npm run dev`

## Production checks

- `npm run build`
- `npm run lint`
- `npm run format:check`

## GitHub Pages setup

1. Push `main`.
2. In GitHub, open **Settings → Pages**.
3. Set **Source** to **GitHub Actions**.

## Optional Giscus setup

1. Enable **GitHub Discussions** in the repo.
2. Create or choose a discussion category.
3. Fill the `PUBLIC_GISCUS_*` values locally or in GitHub Actions variables.
```

- [ ] **Step 3: Run the full local verification suite**

```bash
npm run build
npm run lint
npm run format:check
```

Expected: all checks pass from a clean working tree.

- [ ] **Step 4: Commit deployment and docs**

```bash
git add .github/workflows/deploy.yml README.md
git commit -m "feat: add GitHub Pages deployment workflow"
```

### Task 7: Publish and hand off the live site

**Files:**
- Modify: none
- Test: generated `dist/**/*`

- [ ] **Step 1: Run a final pre-push verification**

```bash
npm run build
npm run lint
npm run format:check
test -f dist/index.html
test -f dist/en/index.html
test -f dist/zh/index.html
test -d dist/pagefind
```

Expected: all commands pass and the critical static outputs exist.

- [ ] **Step 2: Push the implementation to GitHub**

```bash
git push origin main
```

Expected: the repository updates on GitHub and the deploy workflow starts automatically.

- [ ] **Step 3: Complete the one-time GitHub repo settings**

In GitHub:

1. Open `jtzcode/ai-blog`.
2. Go to **Settings → Pages**.
3. Set **Source** to **GitHub Actions** if it is not already selected.
4. If comments should be live immediately, open **Settings → Features** and enable **Discussions**.

- [ ] **Step 4: Verify the first deployment**

Open:

```text
https://jtzcode.github.io/ai-blog/
https://jtzcode.github.io/ai-blog/en/
https://jtzcode.github.io/ai-blog/zh/
https://jtzcode.github.io/ai-blog/search/
```

Expected: the landing page, both locale homepages, and the search page all load without broken assets.

- [ ] **Step 5: Commit any final post-deploy adjustments**

```bash
git add .
git commit -m "chore: polish first GitHub Pages release"
git push origin main
```

Only do this step if the deploy check reveals a real fix that changed tracked files.

## Self-Review Checklist

- Spec coverage: this plan covers the approved AstroPaper choice, GitHub Pages project-site deployment, bilingual content, starter pages, search, comments, SEO-safe defaults, and verification.
- Placeholder scan: no `TODO`, `TBD`, or “implement later” markers remain.
- Type consistency: the locale values stay `en | zh`, the public comment variable names stay `PUBLIC_GISCUS_*`, and the shared helper name remains `getLocalePosts`.
