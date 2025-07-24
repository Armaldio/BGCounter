/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgg: {
          primary: 'var(--color-bgg-primary, #FF6B00)',
          secondary: 'var(--color-bgg-secondary, #003D6B)',
          accent: 'var(--color-bgg-accent, #FDB462)',
          dark: 'var(--color-bgg-dark, #1A1A1A)',
          light: 'var(--color-bgg-light, #F8F9FA)'
        },
        // Semantic color tokens
        primary: {
          DEFAULT: 'var(--color-bgg-primary, #FF6B00)',
          hover: 'var(--color-bgg-primary-hover, #E65C00)'
        }
      },
      fontFamily: {
        sans: 'var(--font-sans, Inter, system-ui, sans-serif)'
      },
      // Modern focus states
      ringWidth: {
        DEFAULT: '2px',
      },
      ringOffsetWidth: {
        DEFAULT: '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ],
  // Enable modern features
  future: {
    hoverOnlyWhenSupported: true,
  },
  // Better CSS variable support
  experimental: {
    optimizeUniversalDefaults: true,
  },
}