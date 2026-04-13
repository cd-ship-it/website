# i18n Architecture Analysis — Crosspoint Web 3.0

## Context
The site serves 3 languages (en / zh-Hant / zh-Hans) but traffic is ~98% English, ~2% CJK.
The question: is the current "compile all 3 languages into every page" approach the right call,
or should an alternative be adopted?

---

## How the Current System Actually Works

Every `<LocalizedInline>` call emits **3 `<span>` elements** into the HTML:

```html
<span class="st-i18n">
  <span class="st-lang st-lang-en">English text</span>
  <span class="st-lang st-lang-zh-Hant">繁體中文</span>
  <span class="st-lang st-lang-zh-Hans">简体中文</span>
</span>
```

CSS on `<html data-lang="...">` shows exactly one, hides the other two.
Language preference is stored in localStorage + a 1-year cookie.
There is **no URL routing** — every page has a single URL regardless of language.
The site has 155+ usages of LocalizedInline/LocalizedHtml across ~15 pages/components.

---

## Approach A — Current: CSS Toggle (All Languages in HTML)

### How it works
All 3 language variants compiled into HTML at build time. `data-lang` attribute on `<html>`
controls visibility via CSS attribute selectors. A 2 KB JS snippet saves preference to
localStorage/cookie and toggles the attribute.

### Pros
- **Instant language switch** — pure CSS, zero network request, zero flash
- **Works without JS** after the initial attribute is set (no JS = English, which is correct for 98%)
- **Single build, single URL** — no routing complexity, no broken links
- **Gzip negates most of the "bloat"** — repeated CJK spans compress ~75-80%; the actual
  wire-cost overhead per page is roughly **3–6 KB gzipped**. For a page that's already
  loading 500 KB of images, this is noise.
- **Already working** — zero migration cost
- **Robust fallback** — `resolveLocalizedSlot()` always falls back to English if a translation
  is missing or empty

### Cons
- **3x the text nodes in the DOM** — 155 usages × 3 spans = ~465 extra DOM nodes per page
  (minor CPU cost on low-end devices, but negligible for a church website)
- **No real SEO for CJK** — hidden content (`display:none`) is largely ignored by search
  engines; no `hreflang` alternate links; Chinese-speaking users won't find this site via
  Chinese-language Google searches
- **Accessibility edge case** — some screen readers may announce hidden spans depending on
  browser/AT combination (mitigated because `display:none` is the correct hide mechanism)
- **Scale cliff** — if Chinese content grows to long-form articles, pastor bios in full, or
  sermon transcripts, the bloat becomes meaningful

### Verdict for this project
**Acceptable and pragmatic.** For 98% English traffic, 3–6 KB extra wire cost and ~465 extra
DOM nodes is not a real problem. The UX benefit (instant switch, no flash) is genuine.
The SEO limitation doesn't matter unless the church is trying to rank in Chinese-language
search results.

---

## Approach B — Astro i18n Routing (Separate Pages per Language)

### How it works
Enable Astro's built-in `i18n` config. Every page exists at 3 URLs:
`/about-us` (en default), `/zh-hant/about-us`, `/zh-hans/about-us`.
Each page builds with only its own language in the HTML. `<hreflang>` alternates in `<head>`.

### Pros
- **Clean HTML** — each page contains only 1 language, ~30% smaller HTML
- **Proper SEO** — `hreflang` alternates, correct `<html lang>`, CJK content fully indexable
- **Correct for large-scale multilingual sites** (think: a global brand serving equal traffic
  across 3+ regions)
- **Each user pays for only their language**

### Cons
- **3× the build** — every page compiled 3 times; build time and deploy size triple
- **Massive refactor** — all internal `<a href>` links need language prefix awareness;
  all navigation must carry current language through routing; all `getEntry()` calls need
  a lang parameter
- **URL structure change** — breaks any existing links/bookmarks to current URLs
- **Overkill for 2% CJK traffic** — you are tripling infrastructure cost and complexity
  to serve 2 out of 100 visitors their language from a different URL
- **No meaningful SEO gain** — this congregation is not searching in Chinese to find a
  church; they were referred by word of mouth and already know the site exists

### Verdict for this project
**Wrong trade-off.** The engineering cost is high; the benefit for this specific audience is
near zero. Correct architecture for a global e-commerce site; wrong architecture for a
Bay Area Chinese church website.

---

## Approach C — Default English + Lazy-Load CJK JSON

### How it works
Ship English-only HTML. Store all translations as `translations.zh-hant.json` and
`translations.zh-hans.json` (~10–20 KB each). When user switches language, fetch the
JSON (one-time, then cached) and swap text in the DOM via JS.

### Pros
- **98% of users get clean, minimal English HTML** — no CJK payload at all
- **CJK users pay a one-time ~15 KB JSON fetch**, then it's cached (Service Worker or
  browser cache) — effectively zero cost on subsequent pages
- **Easy to scale** — adding a 4th language means adding one JSON file, not touching templates
- **Cleaner DOM** — no hidden spans cluttering the node tree

### Cons
- **Flash of English** before Chinese loads (100–300 ms on a cold cache) — jarring for
  CJK users switching on first visit
- **Requires JS** for Chinese content to ever appear — Chinese users with JS disabled
  see only English (not a real concern in 2025, but worth noting)
- **Requires migrating** all 155+ LocalizedInline usages to a key-based system
  (`t('mission.heading')` instead of inline objects) — significant refactor
- **Two sources of truth** — translation strings live in JSON files rather than co-located
  with content in `.md` frontmatter (loses the nice YAML structure)

### Verdict for this project
**Good in theory, not worth the refactor cost now.** If this site were starting fresh
today, Approach C would be the modern standard. But migrating the existing content
collection schema + 155+ component usages has real cost for a 2% audience.

---

## Recommendation: Keep Approach A, with Two Low-Cost Improvements

For this project's specific profile (98/2 traffic split, church site, no CJK SEO goal,
content already built), **the current approach is the right call.** The theoretical
downsides are real but their practical impact on this audience is negligible.

**Two improvements worth making (no architecture change, low effort):**

1. **Add `hreflang` meta tags in BaseLayout** — these don't require URL routing; you can
   use the current single URL with `x-default` plus self-referencing alternates. This costs
   one line per language in `<head>` and gives Google a signal, even if minor:
   ```html
   <link rel="alternate" hreflang="en" href="https://crosspointchurchsv.org/about-us" />
   <link rel="alternate" hreflang="zh-Hant" href="https://crosspointchurchsv.org/about-us" />
   <link rel="alternate" hreflang="x-default" href="https://crosspointchurchsv.org/about-us" />
   ```

2. **Set `<html lang>` correctly at runtime** — the current code already updates
   `document.documentElement.lang` via JS. Verify the initial server-rendered value is
   `lang="en"` (it is), so crawlers and screen readers always get the correct language
   declaration.

**When to revisit:** If CJK traffic grows past ~15%, or if long-form Chinese content
(full sermon transcripts, multi-paragraph articles) is added, then Approach C (lazy JSON)
becomes worth the migration investment.

---

## Decision Matrix

| Criterion                        | A: CSS Toggle | B: i18n Routing | C: Lazy JSON |
|----------------------------------|:---:|:---:|:---:|
| Zero flash on language switch    | ✅  | ✅  | ❌  |
| Clean HTML for English users     | ❌  | ✅  | ✅  |
| Proper CJK SEO                   | ❌  | ✅  | ❌  |
| No refactor needed               | ✅  | ❌  | ❌  |
| Works if JS disabled             | ✅  | ✅  | ❌  |
| Single URL per page              | ✅  | ❌  | ✅  |
| Right for 98/2 traffic split     | ✅  | ❌  | ✅  |
| **Overall for this project**     | **✅ Keep** | ❌ | ⏳ Future |
