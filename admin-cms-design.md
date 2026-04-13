# Admin CMS Design — Crosspoint Web 3.0

**Date:** 2026-04-12  
**Author:** Frederick Ng  
**Status:** Design / Pre-implementation

---

## 1. Goals

- CRUD interface for standalone pages (`/page/[slug]`)
- Two pre-defined page templates selectable at creation time
- Trilingual content fields (en / zh-Hant / zh-Hans) throughout
- Markdown body editor with live preview
- Image upload (to server) or external URL paste
- Simple password authentication (Google OAuth upgrade path noted)
- Single-user — no multi-user roles needed
- Manually linked from nav — no auto-nav injection

---

## 2. Architecture Decision

### Context
- Hosting: SiteGround (PHP/MySQL available, Node.js possible via cPanel)
- Current Astro build: fully static, no SSR adapter
- Single editor (the developer), but admin should be accessible from browser (not just local)

### Recommended Architecture: PHP Admin + Astro Hybrid SSR

```
┌─────────────────────────────────────────────────────────────┐
│  SiteGround Server                                          │
│                                                             │
│  ┌──────────────────┐      ┌───────────────────────────┐   │
│  │  PHP Admin Panel │      │  Astro (Hybrid SSR)       │   │
│  │  /cms/           │      │  Node.js App (cPanel)     │   │
│  │                  │      │                           │   │
│  │  - Auth          │      │  - All existing pages     │   │
│  │  - Page CRUD     │      │    (pre-rendered static)  │   │
│  │  - Image upload  │      │  - /page/[slug]           │   │
│  │  - MD editor     │      │    (server-rendered,      │   │
│  └────────┬─────────┘      │     reads MySQL)          │   │
│           │                └──────────────┬────────────┘   │
│           │                               │                │
│           └──────────────┐ ┌──────────────┘                │
│                          ▼ ▼                               │
│                    ┌──────────────┐                        │
│                    │  MySQL DB    │                        │
│                    │  cms_pages   │                        │
│                    │  cms_sections│                        │
│                    └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

**Why PHP for admin:**
- SiteGround is PHP-native — zero extra setup (no Node.js app config needed for admin)
- PHP has built-in file upload handling, sessions, PDO/MySQL
- Admin is a self-contained folder, easy to secure with `.htaccess`

**Why Astro Hybrid SSR for public pages:**
- Existing static pages stay pre-rendered (no performance hit)
- Only `/page/[slug]` is server-rendered, fetching from MySQL at request time
- No build/redeploy step needed when admin creates a new page

**Changes to existing Astro setup:**
- Add `@astrojs/node` adapter
- Set `output: 'hybrid'` in `astro.config.mjs`
- Add `export const prerender = false` only to `/page/[slug].astro`
- All other existing pages keep `prerender: true` (default)

---

## 3. Database Schema

```sql
-- Main pages table
CREATE TABLE cms_pages (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  slug            VARCHAR(255)  UNIQUE NOT NULL,
  template        ENUM('hero-panels', 'hero-two-col-cards') NOT NULL,
  status          ENUM('draft', 'published') DEFAULT 'draft',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- SEO
  seo_title       VARCHAR(255) NOT NULL,
  seo_description TEXT         NOT NULL,

  -- Hero (shared by both templates)
  hero_image          VARCHAR(500),
  hero_title_en       VARCHAR(255),
  hero_title_zh_hant  VARCHAR(255),
  hero_title_zh_hans  VARCHAR(255),
  hero_subtitle_en        TEXT,
  hero_subtitle_zh_hant   TEXT,
  hero_subtitle_zh_hans   TEXT,

  -- Hero CTA (optional)
  hero_cta_text_en        VARCHAR(255),
  hero_cta_text_zh_hant   VARCHAR(255),
  hero_cta_text_zh_hans   VARCHAR(255),
  hero_cta_url            VARCHAR(500),
  hero_cta_variant        ENUM('primary', 'secondary', 'none') DEFAULT 'none'
);

-- Sections: panels (Template 1) or cards (Template 2)
-- Both section types share the same schema — the template on the parent
-- page determines how they are rendered.
CREATE TABLE cms_sections (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  page_id         INT  NOT NULL,
  section_order   INT  DEFAULT 0,

  -- Content (trilingual)
  image           VARCHAR(500),
  title_en        VARCHAR(255),
  title_zh_hant   VARCHAR(255),
  title_zh_hans   VARCHAR(255),
  body_en         MEDIUMTEXT,   -- Markdown
  body_zh_hant    MEDIUMTEXT,
  body_zh_hans    MEDIUMTEXT,

  -- CTA button (optional per section)
  cta_text_en       VARCHAR(255),
  cta_text_zh_hant  VARCHAR(255),
  cta_text_zh_hans  VARCHAR(255),
  cta_url           VARCHAR(500),
  cta_variant       ENUM('primary', 'secondary', 'none') DEFAULT 'none',

  FOREIGN KEY (page_id) REFERENCES cms_pages(id) ON DELETE CASCADE
);
```

**Index to add:**
```sql
CREATE INDEX idx_cms_pages_slug   ON cms_pages(slug);
CREATE INDEX idx_cms_pages_status ON cms_pages(status);
CREATE INDEX idx_cms_sections_page_order ON cms_sections(page_id, section_order);
```

---

## 4. File & Folder Structure

```
/cms/                        ← PHP admin panel (not inside Astro src/)
  index.php                  ← Login page
  dashboard.php              ← Page list
  page-new.php               ← New page wizard
  page-edit.php              ← Edit existing page
  page-delete.php            ← Delete handler (POST only)
  upload.php                 ← Image upload handler
  auth.php                   ← Session auth helpers
  db.php                     ← PDO connection singleton
  config.php                 ← Password hash, DB creds (gitignored)
  .htaccess                  ← Deny direct access to config.php
  assets/
    easymde.min.js           ← Markdown editor
    easymde.min.css
    admin.css                ← Admin styles
    admin.js                 ← Section add/remove/reorder

/public/uploads/pages/       ← Uploaded images for CMS pages

src/pages/page/
  [slug].astro               ← Server-rendered public page
src/lib/
  cmsDb.ts                   ← MySQL fetch helpers for Astro
src/components/templates/
  HeroPanelsTemplate.astro   ← Renders Template 1
  HeroTwoColTemplate.astro   ← Renders Template 2
```

---

## 5. Templates

### Template 1 — Hero + One-Column Panels (`hero-panels`)

```
┌─────────────────────────────────────────┐
│  HERO                                   │
│  Background image                       │
│  Title (h1)                             │
│  Subtitle                               │
│  [CTA Button] (optional)                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  PANEL 1 (full width)                   │
│  Image                                  │
│  Title                                  │
│  Markdown body                          │
│  [Button] (optional, primary/secondary) │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  PANEL 2  (repeats as many as needed)   │
│  ...                                    │
└─────────────────────────────────────────┘
```

**Schema mapping:** Each panel = one row in `cms_sections`.

---

### Template 2 — Hero + Two-Column Cards (`hero-two-col-cards`)

```
┌─────────────────────────────────────────┐
│  HERO (same as Template 1)              │
└─────────────────────────────────────────┘

┌──────────────────┬──────────────────────┐
│  CARD 1          │  CARD 2              │
│  Image           │  Image               │
│  Title           │  Title               │
│  Body            │  Body                │
│  [Button]        │  [Button]            │
├──────────────────┼──────────────────────┤
│  CARD 3          │  CARD 4              │
│  ...             │  ...                 │
└──────────────────┴──────────────────────┘
```

Cards flow into a CSS 2-column grid by `section_order`. Odd number of cards = last card spans full width (or left-aligned in grid).

**Schema mapping:** Each card = one row in `cms_sections`.

---

## 6. PHP Admin UI — Screens & Flows

### 6.1 Login (`/cms/index.php`)

- Single password field + submit
- On success: sets `$_SESSION['cms_auth'] = true`, redirects to dashboard
- Failed attempts: show error, no lockout (single user, low risk)
- Auth check at top of every protected page via `auth.php`
- Future: swap session check for Google OAuth token check

### 6.2 Dashboard (`/cms/dashboard.php`)

Table of all pages:

| Title (EN) | Slug | Template | Status | Updated | Actions |
|---|---|---|---|---|---|
| Orange Kids | orange-kids | Hero + Panels | Published | 2026-04-12 | Edit / Delete |

- **New Page** button → template selection screen
- Status badge: green Published / gray Draft
- Delete requires a confirmation modal (POST with CSRF token)

### 6.3 New Page — Template Selection (`/cms/page-new.php`, step 1)

Two large cards the user clicks:

```
┌──────────────────────────┐  ┌──────────────────────────┐
│  Template 1              │  │  Template 2              │
│  Hero + One-Column       │  │  Hero + Two-Column Cards │
│  Panels                  │  │                          │
│  [thumbnail preview]     │  │  [thumbnail preview]     │
│                          │  │                          │
│  [Select]                │  │  [Select]                │
└──────────────────────────┘  └──────────────────────────┘
```

Selecting a template passes `?template=hero-panels` to step 2.

### 6.4 Page Editor (`/cms/page-new.php` step 2 / `/cms/page-edit.php`)

Sections of the form, in order:

---

#### A. Page Metadata

| Field | Type | Notes |
|---|---|---|
| Slug | text input | Auto-generated from EN title; editable. Validated: lowercase, hyphens only |
| SEO Title | text input | Plain text, single language |
| SEO Description | textarea | Plain text, single language |
| Status | select | Draft / Published |

---

#### B. Hero Section

| Field | Type | Notes |
|---|---|---|
| Hero Image | image picker | Upload or external URL (tabbed toggle) |
| Title (EN) | text input | |
| Title (zh-Hant) | text input | |
| Title (zh-Hans) | text input | |
| Subtitle (EN) | textarea | |
| Subtitle (zh-Hant) | textarea | |
| Subtitle (zh-Hans) | textarea | |
| CTA Button | collapsible group | Off by default |
| → CTA Text (EN) | text input | |
| → CTA Text (zh-Hant) | text input | |
| → CTA Text (zh-Hans) | text input | |
| → CTA URL | text input | |
| → CTA Style | select | Primary / Secondary |

---

#### C. Sections (Panels or Cards)

Dynamic list — user can add, remove, and drag to reorder.

Each section block (collapsed by default, expand to edit):

```
┌─ Panel/Card 1 ────────────────────────── [↑] [↓] [✕] ──┐
│ Image: [Upload | External URL]                           │
│ Title EN: ___________  zh-Hant: ___________  zh-Hans: __|
│                                                          │
│ Body (EN)  [MD editor with preview]                      │
│ Body (zh-Hant)  [MD editor with preview]                 │
│ Body (zh-Hans)  [MD editor with preview]                 │
│                                                          │
│ CTA Button  [toggle on/off]                              │
│   Text EN: ________  zh-Hant: ________  zh-Hans: ________|
│   URL: _________________  Style: [Primary ▾]            │
└──────────────────────────────────────────────────────────┘

[+ Add Panel]  (or [+ Add Card] for Template 2)
```

**Reorder:** Up/Down arrow buttons (no drag needed for MVP).  
**Remove:** X button with inline confirmation ("Remove this panel?").

---

#### D. Save Bar (sticky bottom)

```
[Save as Draft]   [Publish]   [Preview → /page/my-slug]
```

---

## 7. Image Picker Component

Used in Hero image field and each section's image field.

```
┌───────────────────────────────────────┐
│  [ Upload file ]  |  [ External URL ] │  ← tab toggle
├───────────────────────────────────────┤
│  Upload tab:                          │
│  [Choose file]  ← PHP multipart POST  │
│  Preview thumbnail once selected      │
│                                       │
│  External URL tab:                    │
│  [https://...]  ← text input          │
│  Preview thumbnail on blur            │
└───────────────────────────────────────┘
```

Upload handler (`upload.php`):
- Accepts: jpg, png, gif, webp (≤ 5 MB)
- Saves to: `public/uploads/pages/[year-month]/[uuid].[ext]`
- Returns JSON `{ url: "/uploads/pages/2026-04/abc123.jpg" }`
- Called via `fetch()` from admin.js, no full page reload

---

## 8. Markdown Editor

**Library:** [EasyMDE](https://github.com/Ionaru/easy-markdown-editor) (vanilla JS, no framework needed)

Each trilingual body field gets its own EasyMDE instance. The editor tabs look like:

```
[English] [繁中] [简中]   ← language tabs
┌──────────────────────────────────────────────────────┐
│ B I ` " UL OL H | 👁 Preview                        │
├──────────────────────────────────────────────────────┤
│ markdown source  │  rendered preview                 │
│                  │                                   │
└──────────────────────────────────────────────────────┘
```

EasyMDE is initialized lazily on tab activation to save memory.

---

## 9. Astro Public Page — `/page/[slug].astro`

```typescript
// src/pages/page/[slug].astro
export const prerender = false;  // SSR for this route only

import { fetchPageBySlug } from '../../lib/cmsDb';
import HeroPanelsTemplate from '../../components/templates/HeroPanelsTemplate.astro';
import HeroTwoColTemplate from '../../components/templates/HeroTwoColTemplate.astro';
import BaseLayout from '../../layouts/BaseLayout.astro';

const { slug } = Astro.params;
const page = await fetchPageBySlug(slug);

if (!page || page.status !== 'published') {
  return Astro.redirect('/404');
}
```

Template component selection based on `page.template`:
- `hero-panels` → `<HeroPanelsTemplate>`
- `hero-two-col-cards` → `<HeroTwoColTemplate>`

Both template components receive the full page object (including `sections[]`) as a prop and use the existing `<LocalizedContent>` component for trilingual rendering.

---

## 10. `cmsDb.ts` — MySQL Helpers for Astro

```typescript
// src/lib/cmsDb.ts
// Uses mysql2 (npm install mysql2)

import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host:     import.meta.env.DB_HOST,
  user:     import.meta.env.DB_USER,
  password: import.meta.env.DB_PASSWORD,
  database: import.meta.env.DB_NAME,
});

export async function fetchPageBySlug(slug: string) {
  const [pages] = await pool.query(
    'SELECT * FROM cms_pages WHERE slug = ? AND status = "published" LIMIT 1',
    [slug]
  );
  if (!pages[0]) return null;

  const page = pages[0];
  const [sections] = await pool.query(
    'SELECT * FROM cms_sections WHERE page_id = ? ORDER BY section_order ASC',
    [page.id]
  );
  return { ...page, sections };
}
```

`.env` (gitignored):
```
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=crosspoint_cms
```

---

## 11. Auth Design

### Current (MVP)
- PHP sessions (`session_start()`)
- Password stored as bcrypt hash in `cms/config.php` (gitignored)
- `auth.php` included at top of every protected page:
  ```php
  if (empty($_SESSION['cms_auth'])) {
      header('Location: /cms/index.php');
      exit;
  }
  ```
- Session timeout: 4 hours of inactivity
- `.htaccess` denies direct access to `config.php` and `db.php`

### Future (Google OAuth upgrade path)
- Replace session check with Google OAuth 2.0 token
- Use existing Google API keys
- Restrict to a single allowed Gmail address
- PHP `league/oauth2-google` or Google's own PHP client library
- No schema changes needed

---

## 12. Security Checklist

| Concern | Mitigation |
|---|---|
| SQL injection | PDO prepared statements throughout |
| XSS in admin output | `htmlspecialchars()` on all echoed values |
| CSRF on delete/save | CSRF token in hidden form field, validated server-side |
| File upload abuse | Extension whitelist, MIME type check, size limit (5 MB), renamed UUID filename |
| Unauthorized access | Session check on every admin page; `.htaccess` blocks config files |
| Markdown XSS in output | Astro renders markdown server-side; sanitize with a library (e.g., `dompurify`) before output |

---

## 13. Implementation Phases

### Phase 1 — Foundation
1. Create MySQL database and run schema SQL
2. Set up `cms/config.php` and `cms/db.php`
3. Build login page and session auth
4. Scaffold dashboard (page list from DB)

### Phase 2 — Page Editor
5. Template selection screen
6. Page metadata form + hero form
7. Dynamic section add/remove (JS)
8. Image picker (upload + external URL)
9. EasyMDE markdown editors (trilingual)
10. Save (draft + publish) handlers

### Phase 3 — Public Rendering
11. Switch Astro to `output: 'hybrid'`
12. Install `@astrojs/node` adapter
13. Create `cmsDb.ts`
14. Build `/page/[slug].astro`
15. Build `HeroPanelsTemplate.astro`
16. Build `HeroTwoColTemplate.astro`

### Phase 4 — Polish
17. Reorder sections (up/down buttons)
18. Delete page with confirmation + CSRF
19. Preview button (open `/page/slug` in new tab)
20. 404 for unpublished/missing slugs

---

## 14. Open Questions / Future Decisions

- **Markdown sanitization library** for Astro output: confirm `dompurify` or `rehype-sanitize` is acceptable
- **Google OAuth**: which Gmail address to whitelist
- **Image storage**: if `public/uploads/pages/` grows large, consider Cloudflare R2 or SiteGround CDN
- **Section reorder drag-and-drop**: Sortable.js can replace up/down buttons in Phase 4+
- **Page duplication**: useful for creating similar pages from a template — not in scope yet
