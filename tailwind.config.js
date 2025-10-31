/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '16px',
        sm: '16px',
        md: '24px',
        lg: '32px',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
    },
    extend: {
      colors: {
        // Text colors (Editorial palette)
        text: {
          primary: '#1A1A1A',
          secondary: '#4A4A4A',
          tertiary: '#6B6B6B',
        },
        // Background colors
        background: {
          primary: '#FEFEFE',
          surface: '#F9F9F7',
          divider: '#E5E5E0',
        },
        // Accent colors
        accent: {
          primary: '#B8001F',
          hover: '#8F0018',
        },
        // Status colors
        status: {
          'peer-reviewed': '#2D5F4F',
          preprint: '#C17900',
        },
      },
      fontFamily: {
        display: ["'Playfair Display'", 'Georgia', 'serif'],
        body: ['Georgia', 'Charter', "'Bitstream Charter'", 'serif'],
        ui: ["'Inter'", '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        // Desktop sizes
        display: ['64px', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        headline: ['40px', { lineHeight: '1.2' }],
        subhead: ['28px', { lineHeight: '1.3' }],
        'body-large': ['22px', { lineHeight: '1.7' }],
        body: ['19px', { lineHeight: '1.6' }],
        small: ['16px', { lineHeight: '1.5' }],
        metadata: ['14px', { lineHeight: '1.4' }],
        // Mobile sizes
        'display-mobile': ['40px', { lineHeight: '1.1' }],
        'headline-mobile': ['28px', { lineHeight: '1.2' }],
        'body-mobile': ['18px', { lineHeight: '1.6' }],
      },
      spacing: {
        xs: '8px',
        sm: '16px',
        md: '24px',
        lg: '32px',
        xl: '40px',
        '2xl': '64px',
        '3xl': '96px',
        '4xl': '128px',
      },
      borderRadius: {
        none: '0px',
        sm: '4px',
        md: '6px',
        pill: '24px',
      },
      boxShadow: {
        card: '0 4px 12px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
        modal: '0 20px 40px rgba(0, 0, 0, 0.15)',
      },
      transitionDuration: {
        fast: '200ms',
        normal: '300ms',
        slow: '400ms',
      },
      transitionTimingFunction: {
        'editorial': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      },
      maxWidth: {
        reading: '720px',
        grid: '1280px',
        form: '480px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
