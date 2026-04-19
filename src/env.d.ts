/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_WORDPRESS_URL: string;
  /** Comma-separated list of WordPress post/page IDs to mirror under /wp. */
  readonly PUBLIC_WP_MIRROR_IDS?: string;
  /** Category slug used for build-time WP mirror sync. Defaults to "wp_mirror". */
  readonly PUBLIC_WP_MIRROR_CATEGORY_SLUG?: string;
  /** When "true" or "1", home hero uses backgroundImage only (no background video). */
  readonly PUBLIC_HERO_VIDEO_DISABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  __siteLang?: string;
}
