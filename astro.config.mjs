// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import { loadEnv } from 'vite';

// https://astro.build/config
//
// `.env` is not applied to `process.env` automatically for this file. Use Vite's
// `loadEnv` so `PLATFORM` (and other vars) match the current Vite mode
// (`development` for `astro dev`, `production` for `astro build`).
const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const env = loadEnv(mode, process.cwd(), '');
const platform = env.PLATFORM ?? process.env.PLATFORM;

export default defineConfig({
  /** Origin only (no path). Used for sitemap, canonical URLs, RSS, etc. */
  site: 'https://crosspointchurchsv.org',
  /**
   * Required when the built site is served under a subpath (e.g. /v2/).
   * Without this, CSS/JS links point to /_astro/... and 404 at the domain root.
   */
  base: platform === 'production' ? '/' : '/',

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