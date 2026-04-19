# Code Review Consolidation Plan

This document consolidates the maintainability follow-up from code review into one place.

It focuses on the cleanup and refactoring work that will make the codebase easier to reason about, safer to change, and more consistent across pages.

Core areas:

- unused code cleanup
- duplicate logic consolidation
- CSS consolidation
- shared metadata/config cleanup
- error handling cleanup

## 1. Unused Code Cleanup

### Why this matters

Unused files and dead code make the project harder to navigate. They slow down reviews, increase the chance of editing the wrong file, and make it less clear what is actually in production.

### Cleanup targets

#### Backup and scratch files

These should be reviewed and removed if they are no longer needed:

- `src/components/Sections/SermonList.astro.bak`
- `src/pages/sermons/[slug].astro.bak`
- `src/pages/sermons/index.astro.bak`
- `src/layouts/Untitled`

#### Commented-out blocks in active files

Examples:

- `src/pages/index.astro`
- other pages/components with large commented sections

### What to do

- Delete `.bak` files from `src/`.
- Delete scratch files that are not part of the active app.
- Remove large commented-out sections when they are no longer part of a planned change.
- If something is intentionally postponed, replace the commented block with:
  - a short TODO
  - a tracked issue reference
  - or a real feature flag

### Definition of done

- No `.bak` files remain under `src/`.
- No scratch files remain in the app source tree.
- No large dead commented-out UI blocks remain in active pages.

## 2. Shared Metadata and Config Cleanup

### Why this matters

Important site data is currently hardcoded in multiple places. That creates drift, increases update cost, and makes it harder to know which value is authoritative.

### Current duplication patterns

Repeated content/constants appear in files such as:

- `src/pages/contact.astro`
- `src/components/Global/Footer.astro`
- `src/components/UI/Seo.astro`
- navigation/footer/social link definitions

This includes:

- address
- phone number
- email addresses
- social links
- footer nav groups
- campus labels
- repeated language labels

### What to do

- Create one shared source of truth for site-wide metadata.
- Use either:
  - `src/config/site.ts`
  - or content-driven data under `src/content/siteInfo/`
- Move shared values into that single source:
  - contact details
  - office address
  - phone/email
  - social links
  - footer nav groups
  - canonical campus names
  - sermon language labels where appropriate

### Definition of done

- Contact info is not hardcoded in multiple pages/components.
- Social links are defined once.
- Footer navigation data is defined once.
- Shared labels/constants are not duplicated across unrelated files.

## 3. Duplicate Logic Consolidation

### Why this matters

Duplicated logic is one of the main reasons maintenance gets expensive. It creates drift between pages and increases the chance of partial fixes.

### Current duplication patterns

#### Event logic

Duplicated or near-duplicated event logic appears in:

- `src/lib/eventApi.ts`
- `src/pages/events/index.astro`
- `src/pages/events/[slug].astro`
- `src/components/Sections/EventList.astro`
- campus event rendering code in `src/pages/campus/[campus].astro`

This includes:

- payload normalization
- slug generation
- date parsing/formatting
- image extraction
- card rendering assumptions

#### Sermon logic

Duplicated or near-duplicated sermon logic appears in:

- `src/lib/sermonApi.ts`
- `src/components/Sections/SermonList.astro`
- `src/pages/sermons/index.astro`
- `src/pages/sermons/[slug].astro`
- sermon rendering code in `src/pages/campus/[campus].astro`

This includes:

- language label maps
- badge styles
- preacher formatting
- date formatting
- summary text cleanup
- card rendering assumptions

### What to do

#### Shared event module

Create a shared module for event logic, for example:

- `src/lib/events/normalize.ts`
- `src/lib/events/format.ts`
- `src/lib/events/constants.ts`

Move into shared code:

- `normalizeEvent`
- slug creation
- date helpers
- image extraction helpers

#### Shared sermon module

Create a shared module for sermon logic, for example:

- `src/lib/sermons/format.ts`
- `src/lib/sermons/constants.ts`
- `src/lib/sermons/render.ts`

Move into shared code:

- language label maps
- language badge color maps
- preacher display formatting
- sermon date formatting
- summary preview generation

### Refactor rule

If the same business rule or data transformation appears in more than one file, it should usually move to shared code.

### Definition of done

- Event normalization logic lives in one shared place.
- Sermon formatting/constants live in one shared place.
- Page files mostly compose shared helpers instead of reimplementing them.

## 4. Error Handling Cleanup

### Why this matters

Silent failures make the site harder to debug and maintain. They can leave empty UI behind without making it clear whether something is intentionally absent or actually broken.

### Current patterns to clean up

Examples include code that catches errors and does nothing or hides failures without any explicit fallback behavior.

Examples:

- `src/components/Sections/SermonList.astro`
- `src/components/Global/Footer.astro`

### What to do

- Replace empty `catch {}` blocks with explicit handling.
- In development, log useful warnings for missing data or fetch failures.
- In production, render clear fallback states where appropriate.
- Prefer small helper wrappers for safe loading instead of repeated ad hoc `try/catch` blocks.

### Definition of done

- No empty `catch` blocks remain without documented intent.
- Missing data paths have explicit fallback behavior.
- Development failures are easier to diagnose.

## 5. CSS Consolidation Plan

### Why this matters

The current styling approach has useful flexibility, but repeated CSS across pages will eventually create drift. The goal is not to move everything into one file. The goal is to centralize repeated patterns while keeping unique page art direction local.

### What should be consolidated

#### Global/shared styles

These are strong candidates for shared styles in `global.css` or a small set of shared style files:

- buttons
- cards
- shared section spacing
- layout containers
- form field styling
- badge/pill styles
- repeated hover/focus states
- shared panel shells like `xp-panel-inner`
- common list/grid patterns
- repeated prose/content styling

#### Shared component-level patterns

If a visual pattern is repeated but has meaningful structure, prefer a reusable component over raw CSS duplication.

Examples:

- event cards
- sermon cards
- page headers
- CTA panels
- campus info cards

### What should stay local

These should remain near the relevant page/component:

- unique hero art direction
- one-off promotional sections
- page-specific layouts used only once
- special landing page treatments

### What to do

#### Step 1. Audit repeated class/style patterns

Look for repeated styling across:

- cards
- buttons
- filters/forms
- page headers
- media thumb wrappers
- content sections

#### Step 2. Promote repeated patterns

Move repeated styles into:

- `src/assets/styles/global.css` for true global/shared utilities
- reusable components for repeated structured UI

#### Step 3. Avoid over-centralizing

Do not dump every page style into one giant global stylesheet.

Instead:

- keep tokens, resets, utilities, and reusable primitives global
- keep one-off page styling local
- promote only patterns that are actually reused

### Suggested CSS structure

- `global.css`
  - design tokens
  - resets/base styles
  - typography
  - containers/layout primitives
  - shared utility classes
  - shared component primitives
- local component/page styles
  - unique section visuals
  - one-off layout tweaks
  - page-specific art direction

### Definition of done

- Repeated style patterns are not copied across multiple pages.
- Shared UI pieces use shared classes or reusable components.
- Global CSS contains reusable primitives, not page-specific clutter.
- Unique page styling still lives close to the component/page that owns it.

## Recommended implementation order

1. Remove unused and backup files.
2. Remove dead commented-out blocks.
3. Centralize shared site metadata/constants.
4. Consolidate event logic.
5. Consolidate sermon logic.
6. Replace silent failures with explicit fallback handling.
7. Audit repeated CSS patterns.
8. Promote only genuinely shared styles into global/shared CSS.
9. Convert heavily repeated UI patterns into reusable components where appropriate.

## Overall Definition of Done

- No `.bak` or scratch files remain in `src/`.
- No large dead commented-out UI blocks remain in active source files.
- Event normalization logic lives in one shared place.
- Sermon formatting/constants live in one shared place.
- Contact info, social links, and footer nav come from one source.
- Large page scripts are broken into reusable modules or components where repetition is high.
- No empty `catch` blocks remain without documented intent.
- Shared style patterns are consolidated, but one-off page art direction remains local.

## Practical rule of thumb

- If it is repeated behavior, consolidate it into shared logic.
- If it is repeated content or config, centralize it.
- If it is repeated styling across multiple pages, promote it to shared CSS or a reusable component.
- If it is truly unique to one page, keep it local.
