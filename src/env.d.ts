/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_WORDPRESS_URL: string;
  /** When "true" or "1", home hero uses backgroundImage only (no background video). */
  readonly PUBLIC_HERO_VIDEO_DISABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  __siteLang?: string;
}
