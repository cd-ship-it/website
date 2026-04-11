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

/**
 * English `campusName` values (from service-times) excluded from the Orange Kids
 * campus schedule grid.
 */
export const orangeKidsExcludedCampuses: readonly string[] = ["Peninsula", "Tracy"];

const excludedOrangeKidsSet = new Set(orangeKidsExcludedCampuses);

/**
 * Home service-times campus display order (left → right / top → bottom).
 * Match English names in `service-times` (e.g. "San Leandro").
 */
export const homeCampusDisplayOrder: readonly string[] = [
  "Milpitas",
  "Pleasanton",
  "San Leandro",
  "Tracy",
  "Peninsula",
];

/** Normalize for matching config labels to `campusName` / `campusName.en`. */
export function normalizeCampusOrderKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** True when `campusNameEn` matches `orangeKidsExcludedCampuses` (e.g. no Orange Kids promo on campus page). */
export function isCampusExcludedFromOrangeKids(campusNameEn: string): boolean {
  return excludedOrangeKidsSet.has(campusNameEn);
}

/** Service-times campus rows for the Orange Kids page (drops `orangeKidsExcludedCampuses`). */
export function filterCampusesForOrangeKids<
  T extends { campusName: string | { en: string } },
>(campuses: T[]): T[] {
  return campuses.filter((c) => {
    const name = typeof c.campusName === "string" ? c.campusName : c.campusName.en;
    return !excludedOrangeKidsSet.has(name);
  });
}
