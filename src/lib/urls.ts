/**
 * Prefix a site-relative asset path (e.g. content-sourced `/uploads/foo.jpg`)
 * with Astro's `import.meta.env.BASE_URL` so it works under a deployed base path
 * like `/v2/` or `/v3/`.
 *
 * Rules:
 * - Empty / nullish input → returns empty string.
 * - External URLs (`http://`, `https://`, `//`, `data:`, `blob:`, `mailto:`, `tel:`) → returned unchanged.
 * - Paths already starting with the current `BASE_URL` → returned unchanged.
 * - Otherwise: strips any leading `./`, `../`, or `/` segments, then joins with `BASE_URL`
 *   (which Astro always serves with a trailing slash).
 */
export function withBaseUrl(path: string | null | undefined): string {
  if (!path) return "";

  const base = import.meta.env.BASE_URL ?? "/";

  if (/^(?:https?:)?\/\//i.test(path)) return path;
  if (/^(?:data|blob|mailto|tel):/i.test(path)) return path;

  if (path.startsWith(base)) return path;

  let normalized = path.replace(/^(?:\.{1,2}\/)+/, "");
  normalized = normalized.replace(/^\/+/, "");

  return `${base}${normalized}`;
}
