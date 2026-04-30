// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';

// https://astro.build/config
//
// Determine Astro base path from build mode.
const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

export default defineConfig({
  /** Origin only (no path). Used for sitemap, canonical URLs, RSS, etc. */
  site: 'https://crosspointchurchsv.org',
  /**
   * Required when the built site is served under a subpath (e.g. /v2/).
   * Without this, CSS/JS links point to /_astro/... and 404 at the domain root.
   */
  base: mode === 'production' ? '/v2/' : '/',

  integrations: [sitemap()],
  vite: {
    css: {
      postcss: {
        plugins: [
          tailwindcss({ config: './tailwind.config.cjs' }),
          autoprefixer(),
        ],
      },
    },
  },
  markdown: {
    shikiConfig: {
      theme: 'github-light',
      wrap: true,
    },
  },
  legacy: {
    collectionsBackwardsCompat: true,
  },
});