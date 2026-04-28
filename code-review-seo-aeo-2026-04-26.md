# Crosspoint Web 3.0 Review

Date: 2026-04-26

Validation:
- Ran `npm run build` successfully.
- Reviewed generated output in `dist/` for SEO behavior, not just source intent.

## Executive Summary

The project has a solid Astro foundation, clean content modeling, and a working production build. The biggest gaps are not general code quality; they are discoverability and maintainability around content delivery:

1. Important pages and language variants depend on client-side rendering or client-side language switching.
2. A few core SEO files and metadata sources are inconsistent or still contain placeholder values.
3. Site identity, navigation, and schema data are duplicated across multiple files, which will get harder to maintain as content grows.

## Priority Findings

### P1. Multilingual content is implemented as a client-side language toggle, not as crawlable language pages

Evidence:
- `src/layouts/BaseLayout.astro:38-74`
- `src/components/UI/LocalizedInline.astro:13-42`
- `src/components/UI/LocalizedHtml.astro:22-46`

Why this matters:
- The site always prerenders English first, then swaps language via `localStorage` or cookie.
- Search engines and answer engines do not get stable, language-specific URLs to index.
- There are no `hreflang` alternates, so Chinese content has weak language targeting and weak retrieval signals.

Recommendation:
- Move to real localized routes such as `/`, `/zh-hant/`, and `/zh-hans/`.
- Emit `hreflang` alternates and per-language canonicals.
- Keep the client toggle, but make it switch routes instead of only changing hidden DOM fragments.

### P1. `weekly-prayer` and `heart-of-a-shepherd` currently ship as loading shells in the built HTML

Evidence:
- `src/pages/[slug].astro:170-196`
- `src/pages/[slug].astro:229-240`
- Verified in `dist/weekly-prayer/index.html` and `dist/heart-of-a-shepherd/index.html`

Why this matters:
- Those pages render “Loading latest content…” in static output and fetch content after page load.
- That makes the most important content invisible to crawlers that do not wait for client fetches.
- It also weakens AEO because LLM retrievers and snippet systems prefer immediate page body content.

Recommendation:
- Default these pages to build-time or server-side content fetches.
- Use client refresh only as a progressive enhancement, not as the primary rendering path.

### P1. Sermons and events listing pages are mostly JavaScript-rendered, so the initial HTML is thin

Evidence:
- `src/pages/events/index.astro:42-53`
- `src/pages/events/index.astro:128-155`
- `src/pages/sermons/index.astro:90-106`
- `src/pages/sermons/index.astro:267-323`
- Compare with the home modules, which already prerender content:
  - `src/components/Sections/EventList.astro:15-23`
  - `src/components/Sections/EventList.astro:49-80`
  - `src/components/Sections/SermonList.astro:16-20`
  - `src/components/Sections/SermonList.astro:33-60`

Why this matters:
- `/events` and `/sermons` ship loading skeletons first, then inject cards with JavaScript.
- The home page already proves the data can be fetched at render time.
- This hurts crawl depth, internal link discovery, and answer-engine retrieval from listing pages.

Recommendation:
- Render page 1 server-side and layer client filters/pagination on top.
- Reuse the same data-fetching path for home modules and index pages to avoid duplication.

### P2. The 404 page is indexable and canonicalized to `/404/`

Evidence:
- `src/pages/404.astro:7-10`
- `src/components/UI/Seo.astro:102-121`
- Verified in `dist/404.html`

Why this matters:
- The 404 page gets a canonical URL and normal indexable metadata.
- That can create “soft SEO noise” and wasted crawl budget.

Recommendation:
- Add a `noindex, follow` option to `Seo.astro` and apply it to 404 pages and any future utility pages.

### P2. `robots.txt` still points to a placeholder sitemap host

Evidence:
- `public/robots.txt:6`

Why this matters:
- The site correctly generates `sitemap-index.xml`, but `robots.txt` advertises `https://example.com/sitemap-index.xml`.
- That weakens crawler discovery and signals a deployment oversight.

Recommendation:
- Replace the hardcoded placeholder with the production domain or generate `robots.txt` from site config.

### P2. Site identity and contact data are duplicated and inconsistent

Evidence:
- `src/components/UI/Seo.astro:30-43`
- `src/components/Global/Footer.astro:80-87`
- `src/pages/contact.astro:178`
- `src/pages/contact.astro:256-257`

Observed inconsistency:
- SEO schema uses `com@crosspointchurchsv.org`
- Footer and some contact flows use `info@crosspointchurchsv.org`

Why this matters:
- Duplicated organization data invites drift.
- Inconsistent contact info weakens local SEO trust signals and makes future changes error-prone.

Recommendation:
- Create a single `organization` or `siteIdentity` config object and consume it in footer, contact page, manifest, and schema.

### P3. Manifest and favicon references are incomplete and still use placeholder branding

Evidence:
- `src/layouts/BaseLayout.astro:102-105`
- `public/site.webmanifest:2-14`
- Only `dist/apple-touch-icon.png` and `dist/site.webmanifest` were present after build; the referenced `favicon-32x32.png`, `favicon-16x16.png`, `android-chrome-192x192.png`, and `android-chrome-512x512.png` were missing.

Why this matters:
- Broken asset references are small individually, but they make the site feel unfinished and create avoidable crawl/log noise.

Recommendation:
- Add the missing assets or stop linking to them.
- Replace `"Church Name"` with the real brand in `site.webmanifest`.

## Maintainability Recommendations

### 1. Centralize site identity

Create one typed source for:
- Church name
- canonical site URL
- address
- phone
- primary email
- social profiles
- default OG image

Use it in:
- `src/components/UI/Seo.astro`
- `src/components/Global/Footer.astro`
- `src/pages/contact.astro`
- `public/site.webmanifest`
- any future LocalBusiness or campus schema

### 2. Unify server-rendered and client-enhanced listing logic

Right now the home page and the index pages fetch the same domains in different ways. Consolidate this into:
- one shared server-side fetch for the initial payload
- one optional client controller for filters, pagination, and live refresh

This will reduce duplication and improve crawlability at the same time.

### 3. Split SEO/schema concerns into focused builders

`src/components/UI/Seo.astro` currently handles:
- generic meta tags
- church schema
- generic article schema

That will get harder to evolve. Prefer:
- `buildOrganizationSchema()`
- `buildEventSchema()`
- `buildSermonSchema()`
- `buildFAQSchema()`
- `buildBreadcrumbSchema()`

Then compose only the schema each page actually needs.

### 4. Clean out stale artifacts and dead files

Review and remove:
- `src/components/Sections/SermonList.astro.bak`
- `src/layouts/Untitled`
- `src/.DS_Store`
- `src/pages/.DS_Store`

Also note:
- `src/components/UI/LocalizedContent.astro` ends with a stray `</think>` tag at line 132. It is not currently used, but it should be cleaned up before it becomes active.

### 5. Add lightweight guardrails for content and metadata quality

Recommended checks in CI:
- build
- typecheck
- broken internal link scan
- metadata assertion scan for title, description, canonical, robots
- structured-data smoke tests for key templates

This project is content-heavy enough that regressions will come from data drift more often than from framework bugs.

## SEO and AEO Recommendations

### 1. Use page-specific schema instead of generic `Article` everywhere

Current evidence:
- `src/components/UI/Seo.astro:78-99`
- `src/pages/events/[slug].astro:26-30`
- `src/pages/sermons/[slug].astro:81-85`

Recommended upgrades:
- Sermon pages: `VideoObject` or `CreativeWork` with speaker, date, transcript, thumbnail, and scripture references
- Event pages: `Event` with start date, end date, location, registration URL, and attendance mode
- FAQ sections: `FAQPage` for `src/pages/im-new.astro:120-138`
- Site-wide: `BreadcrumbList`
- Church/campus pages: `Church` or `Place` with `sameAs`, `contactPoint`, and `openingHoursSpecification`

### 2. Make sermon summaries and transcripts crawlable again

Evidence:
- `src/pages/sermons/[slug].astro:159-222`

Why this matters:
- The summary and transcript blocks are already modeled, but currently commented out.
- Those blocks are some of the best AEO material on the site because they contain answer-rich, semantically dense text.

Recommendation:
- Restore the summary excerpt and transcript in readable HTML.
- Add section anchors and timestamp links where possible.

### 3. Turn FAQ and service-time content into answer-first retrieval assets

High-value candidates:
- `src/pages/im-new.astro:120-138`
- campus pages and service-time content under `src/lib/siteInfo/serviceTimes.ts`

Recommendation:
- Write short, direct question-answer blocks such as:
  - “What time is Sunday service at Crosspoint Milpitas?”
  - “What should I expect on my first visit?”
  - “Is childcare available during worship?”
- Support those answers with matching structured data where appropriate.

### 4. Add explicit social and authority signals to organization schema

Recommended additions:
- `sameAs` for Facebook, Instagram, YouTube
- `contactPoint`
- `logo`
- `openingHoursSpecification`
- campus-specific `hasMap` or `geo` when available

These improve both classic local SEO and machine understanding.

### 5. Generate better page-specific share assets

Current metadata works, but it is generic. Improve CTR and answer-engine previews by giving key pages:
- custom OG images for sermon series, events, ministries, and campus pages
- page-specific image alt text
- image dimensions when possible

### 6. Add a metadata strategy for non-index pages

Add support in `Seo.astro` for:
- `robots`
- `noindex`
- `nofollow` when needed

Then apply it to:
- 404 pages
- empty fallback pages
- utility or duplicate-filter pages if they are introduced later

## Suggested Implementation Order

### Phase 1: Highest SEO return

1. Fix `robots.txt`
2. Add `noindex` support for 404
3. Server-render `/events` and `/sermons` first page
4. Stop shipping loading-shell HTML for `/weekly-prayer` and `/heart-of-a-shepherd`

### Phase 2: Foundation cleanup

1. Centralize organization/site identity
2. Clean stale files and unused artifacts
3. Refactor schema generation into focused helpers

### Phase 3: AEO expansion

1. Restore sermon summaries/transcripts
2. Add `FAQPage`, `Event`, and sermon/video schema
3. Introduce real localized routes plus `hreflang`

## Bottom Line

The codebase is close to being a strong content platform, but right now some of the most important content is hidden behind JavaScript or behind a single-URL language toggle. If you fix those rendering and metadata issues first, you should get the biggest gains in maintainability, search visibility, and answer-engine readiness.
