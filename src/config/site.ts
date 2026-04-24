/**
 * Global site configuration for this Astro project.
 *
 * - **Environment** (`PUBLIC_*`, Astro `SITE`): set in `.env` and your host; see `.env.example`.
 * - **App defaults** (exports below that are not env-backed): edit here instead of scattering literals.
 */

/** Canonical production URL from `astro.config` → `site` (`import.meta.env.SITE`). */
export function getSiteUrl(): string {
  return import.meta.env.SITE ?? "";
}

/** WordPress site origin (no trailing path). */
export function getWordPressUrl(): string {
  return import.meta.env.PUBLIC_WORDPRESS_URL ?? "";
}

/** Used by WordPress JSON helpers; throws if unset so misconfiguration fails fast. */
export function requireWordPressUrl(): string {
  const url = getWordPressUrl();
  if (!url) {
    throw new Error(
      "PUBLIC_WORDPRESS_URL is not defined. Set it in your .env or deployment environment.",
    );
  }
  return url;
}

export function getSermonApiUrl(): string {
  return import.meta.env.PUBLIC_SERMON_API_URL ?? "/api/sermons.php";
}

export function getEventsApiUrl(): string {
  return import.meta.env.PUBLIC_EVENTS_API_URL ?? "/api/events.php";
}

/** POST target for the contact form (PHP on SiteGround or any host that runs `public/api/contact.php`). */
export function getContactFormActionUrl(): string {
  const override = import.meta.env.PUBLIC_CONTACT_FORM_URL;
  if (override) return override;
  const site = import.meta.env.SITE;
  if (site) {
    try {
      return new URL("api/contact.php", site).toString();
    } catch {
      // fall through to BASE_URL variant
    }
  }
  // Default: resolve against Astro's `base` so it works under /v2/ in production
  // and / in dev. BASE_URL always has a trailing slash.
  const base = import.meta.env.BASE_URL ?? "/";
  return `${base}api/contact.php`;
}

/**
 * Google reCAPTCHA v3 public site key. Empty when not configured (reCAPTCHA is
 * then skipped on the client; server must likewise be unconfigured).
 * Get a key pair at https://www.google.com/recaptcha/admin (choose v3).
 */
export function getRecaptchaSiteKey(): string {
  return import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY ?? "";
}

/**
 * Base URL for resolving relative API paths (e.g. `/api/events.php`) when fetching.
 * Order matches previous behavior: WordPress origin → Astro `site` → local dev.
 */
export function getApiOrigin(): string {
  return (
    import.meta.env.PUBLIC_WORDPRESS_URL ??
    import.meta.env.SITE ??
    "http://localhost:4321"
  );
}

