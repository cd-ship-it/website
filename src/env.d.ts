/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_WORDPRESS_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  __siteLang?: string;
}
