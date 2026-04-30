// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';

// https://astro.build/config
//
export default defineConfig({
  /** Origin only (no path). Used for sitemap, canonical URLs, RSS, etc. */
  site: 'https://crosspointchurchsv.org',
  base: '/',

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