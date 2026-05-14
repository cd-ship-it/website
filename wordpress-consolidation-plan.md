# WordPress Consolidation Plan

## Goal

Most site content comes from WordPress CMS today, and more WordPress-backed content types are expected. The goal is to consolidate fetching, pagination, caching, sanitization, normalization, and route generation so Astro pages consume clean typed content without duplicating WordPress-specific logic.

This should not become one giant `wordpress.ts` file. The healthier architecture is one WordPress subsystem with shared infrastructure and small content adapters.

## Open Questions

1. Should Astro remain mostly static, with WordPress content copied at build time, or should some pages fetch live from WordPress in the browser?
2. Are sermons and events long-term WordPress content too, or are they separate PHP APIs that only mirror WordPress data?
3. Is it acceptable to add an HTML sanitizer dependency such as `sanitize-html` or a rehype-based sanitizer?
4. Should normalized WordPress cache files be committed to git, or generated only during CI/deploy?
5. Is preview/draft support required, or only published public content?
6. Will future WordPress content types mostly be custom post types with ACF fields?
7. Should Astro URLs follow WordPress slugs exactly, or should Astro own the final public route structure?

## Recommended Architecture

Create a dedicated `src/lib/wp/` subsystem:

```text
src/lib/wp/
  client.ts
  cache.ts
  sanitize.ts
  normalize.ts
  types.ts
  repositories/
    posts.ts
    pages.ts
    media.ts
    terms.ts
  adapters/
    events.ts
    sermons.ts
    pastors.ts
    heartOfShepherd.ts
    dynamicPages.ts
```

### Responsibilities

`client.ts`
: Owns base URL resolution, request construction, error handling, query parameters, and pagination.

`cache.ts`
: Owns JSON cache read/write, cache bypass env handling, cache validation, and generated metadata.

`sanitize.ts`
: Owns the allowlist policy for CMS HTML before Astro renders it with `set:html`.

`normalize.ts`
: Owns common field helpers such as rendered text extraction, date normalization, slug generation, featured image picking, ACF field picking, and dedupe helpers.

`repositories/`
: Thin WordPress REST wrappers. These know about WordPress endpoints like `posts`, `pages`, `media`, `categories`, and custom post type endpoints.

`adapters/`
: Content-specific mappers. These know how Crosspoint models pastors, events, sermons, Heart of a Shepherd posts, dynamic pages, ministries, etc.

Astro pages should call adapters and render clean domain objects. They should not know WordPress field quirks.

## Clean WordPress To Astro Flow

1. Fetch raw WordPress records through the shared WP client.
2. Paginate through one helper.
3. Normalize raw WordPress and ACF fields into typed domain objects.
4. Sanitize CMS HTML during normalization or cache writing.
5. Cache normalized content using one cache helper.
6. Render Astro pages from normalized content only.
7. Use browser-side WordPress fetching only as an explicit exception.

Example shape:

```ts
const posts = await wp.posts.byCategorySlug("heart-of-a-shepherd");
const records = posts.map(toHeartOfShepherdPost);
await cache.write("heart-of-a-shepherd", records);
return records;
```

## Migration Plan

### Phase 1: Extract Shared Utilities

Move duplicate helpers out of current modules:

- `isTruthyEnvValue`
- JSON cache read/write
- cache bypass env handling
- dedupe by ID/slug/YouTube ID
- slug normalization
- date normalization
- rendered field extraction
- WordPress image picking
- API URL construction

Target current duplication:

- `src/lib/sermonApi.ts`
- `src/lib/heartOfShepherdApi.ts`
- `src/lib/pastorsApi.ts`
- `src/lib/eventApi.ts`
- `src/lib/wordpress.ts`

This phase should preserve behavior.

### Phase 2: Build The WordPress Client

Replace scattered `fetch(new URL(...))` logic with shared client functions:

```ts
wp.request<T>("posts", params)
wp.paginate<T>("posts", params)
wp.byId<T>("posts", id, params)
```

The existing `src/lib/wordpress.ts` can seed this work, but it should be split into smaller files.

### Phase 3: Add Sanitization

Add a sanitizer for CMS-provided HTML before it reaches Astro templates.

All fields rendered through `set:html` or `innerHTML` should come from sanitized properties:

```ts
contentHtml
excerptHtml
titleHtml
```

Raw WordPress HTML should stay inside the WP subsystem and not leak into page components.

### Phase 4: Create Content Adapters

Move content-specific logic into adapters:

```ts
fetchPastors()
fetchEvents()
fetchSermons()
fetchHeartOfShepherdPosts()
fetchDynamicWpPages()
```

Each adapter should:

- Fetch via repositories/client.
- Normalize raw data into a typed Astro-facing object.
- Sanitize HTML.
- Read/write cache if appropriate.
- Hide WordPress/ACF quirks from pages.

### Phase 5: Thin Astro Pages

Refactor Astro routes so page files focus on rendering:

- Get content from adapter.
- Generate static paths.
- Pass content into components.
- Avoid raw WP fetches, raw ACF access, and local duplicate card-rendering helpers.

### Phase 6: Add Future Content Type Pattern

For new WordPress-backed content types, prefer config plus a mapper:

```ts
{
  type: "ministry",
  wpType: "ministries",
  routeBase: "/ministries",
  mapper: toMinistryPage,
}
```

This keeps new content types from reintroducing duplicated fetch/cache/pagination/security logic.

## Security Requirements

### Rotate Secrets

The current reCAPTCHA secret in `public/api/contact.php` should be considered compromised because it is tracked in source. Rotate it and read the replacement from server-side config or environment outside git.

### Sanitize CMS HTML

WordPress content is trusted operationally, but it is still external HTML. A compromised admin account, plugin, migration, or API payload can introduce stored XSS. Sanitize CMS HTML before rendering.

### Prefer Build-Time Copy

For public content, build-time copy is safer and easier to cache than browser-side direct WordPress fetching. Browser-side fetch should be reserved for content that must be live without rebuilds.

### Centralize URL Validation

All external URLs from WordPress should pass through shared validation/normalization helpers, especially:

- Image URLs
- Registration links
- Embedded media
- Canonical links
- Redirect targets

## Recommended End State

Astro pages should read like this:

```ts
const posts = await fetchHeartOfShepherdPosts();
```

Not like this:

```ts
const url = new URL("/wp-json/wp/v2/posts", baseUrl);
url.searchParams.set("categories", "278");
const res = await fetch(url.toString());
const rawPosts = await res.json();
```

The WordPress subsystem should be the only place that understands WordPress REST mechanics, cache mechanics, HTML sanitization policy, and ACF shape differences.

## First Implementation Slice

Start with the lowest-risk consolidation:

1. Add `src/lib/wp/cache.ts`.
2. Add `src/lib/wp/normalize.ts`.
3. Move duplicated `isTruthyEnvValue`, cache read/write, dedupe, slug, and rendered-field helpers.
4. Update `sermonApi.ts`, `heartOfShepherdApi.ts`, and `pastorsApi.ts` to use the helpers.
5. Run `npm run build`.

After that passes, move to the WP client and sanitization phases.

