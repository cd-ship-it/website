// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

const isProduction = process.env.PLATFORM === 'production';

// https://astro.build/config
export default defineConfig({
  /** Origin only (no path). Used for sitemap, canonical URLs, RSS, etc. */
  site: 'https://crosspointchurchsv.org',
  /** /v2 in production, / in development */
  base: isProduction ? '/v2' : '/',
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