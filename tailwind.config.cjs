/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        /** Dark ink text — new brand dark */
        heading: '#1A1410',
        /** Brand blue — primary actions, links */
        primary: {
          50:  '#EBF4FF',
          100: '#D3E8FF',
          200: '#A7D1FF',
          300: '#7ABAFF',
          400: '#4DA0F0',
          500: '#2D87D8',
          600: '#1f6eb3',
          700: '#195C99',
          800: '#124B82',
          900: '#0D3B6A',
          950: '#082C52',
        },
        /** Brand orange — CTAs, highlights */
        secondary: {
          50:  '#FFF8EB',
          100: '#FEF0CA',
          200: '#FDDD95',
          300: '#FCC85C',
          400: '#FAB230',
          500: '#F5A020',
          600: '#D98810',
          700: '#BB720A',
          800: '#9D5D07',
          900: '#804905',
          950: '#623603',
        },
        /** Warm amber — accent icons, tags */
        accent: {
          50:  '#FFF7EB',
          100: '#FEECD2',
          200: '#FDCE9A',
          300: '#FBAE61',
          400: '#F88C2C',
          500: '#F56C0C',
          600: '#D95408',
          700: '#B74106',
          800: '#993205',
          900: '#7B2504',
          950: '#5C1A03',
        },
        /** Ink / dark backgrounds */
        ink: {
          DEFAULT: '#1A1410',
          2: '#2D2118',
          3: '#4A3C32',
        },
        /** Warm cream backgrounds */
        cream: {
          DEFAULT: '#FDFAF6',
          2: '#F4EEE4',
          3: '#E8DED0',
        },
        /** Muted / placeholder text */
        muted: '#9A8A7E',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        /** Maps to :root tokens in global.css — single place to tune responsive display sizes */
        'page-title': ['var(--font-page-title)', { lineHeight: '1.15' }],
        hero: ['var(--font-hero)', { lineHeight: '1.1' }],
        'cta-band': ['var(--font-cta-band)', { lineHeight: '1.2' }],
        'second-hero': ['var(--font-second-hero)', { lineHeight: '1.2' }],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: theme('fontFamily.serif').join(', '),
              color: theme('colors.heading'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};