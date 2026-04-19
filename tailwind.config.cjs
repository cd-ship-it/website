/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        /** Dark ink text — cool near-black */
        heading: '#111827',
        /** Brand navy — primary structural color */
        primary: {
          50:  '#EFF4FF',
          100: '#D9E6FF',
          200: '#B3CCFF',
          300: '#8AADEE',
          400: '#5A84D4',
          500: '#2D60AA',
          600: '#1B3A6B',
          700: '#142D54',
          800: '#0F2040',
          900: '#091529',
          950: '#050C1A',
        },
        /** Brand amber-gold — CTAs, accents (use sparingly) */
        secondary: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#E8961F',
          600: '#D4820A',
          700: '#B86B08',
          800: '#9A5706',
          900: '#7C4405',
          950: '#5E3303',
        },
        /** Accent — kept for backward-compat with existing badge/tag uses */
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
        /** Ink / dark text — cool dark */
        ink: {
          DEFAULT: '#111827',
          2: '#1F2937',
          3: '#374151',
        },
        /** Near-white surface backgrounds */
        cream: {
          DEFAULT: '#F9FAFB',
          2: '#F1F3F5',
          3: '#E5E7EB',
        },
        /** Muted / placeholder text */
        muted: '#6B7280',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Chivo"', 'system-ui', '-apple-system', 'sans-serif'],
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
              fontWeight: '700',
              fontStyle: 'italic',
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