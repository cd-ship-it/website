// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  /** Origin only (no path). Used for sitemap, canonical URLs, RSS, etc. */
  site: 'https://crosspointchurchsv.org',
  /**
   * Required when the built site is served under a subpath (e.g. /v2/).
   * Without this, CSS/JS links point to /_astro/... and 404 at the domain root.
   */
  base: '',
  integrations: [
    tailwind(),
    sitemap(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-light',
      wrap: true
    }
  }
});