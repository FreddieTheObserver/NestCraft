/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-low': 'rgb(var(--color-surface-low) / <alpha-value>)',
        'surface-container': 'rgb(var(--color-surface-container) / <alpha-value>)',
        'surface-high': 'rgb(var(--color-surface-high) / <alpha-value>)',
        'surface-white': 'rgb(var(--color-surface-white) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        'secondary-bright': 'rgb(var(--color-secondary-bright) / <alpha-value>)',
        outline: 'rgb(var(--color-outline) / <alpha-value>)',
        error: 'rgb(var(--color-error) / <alpha-value>)',
        'error-soft': 'rgb(var(--color-error-soft) / <alpha-value>)',
        sand: 'rgb(var(--color-surface) / <alpha-value>)',
        mist: 'rgb(var(--color-surface-container) / <alpha-value>)',
        walnut: 'rgb(var(--color-ink) / <alpha-value>)',
        clay: 'rgb(var(--color-secondary) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Manrope', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
        display: ['"Noto Serif"', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      boxShadow: {
        ambient: 'var(--shadow-ambient)',
        lift: 'var(--shadow-lift)',
      },
      backgroundImage: {
        'cta-gradient':
          'linear-gradient(135deg, rgb(var(--color-secondary)) 0%, rgb(var(--color-secondary-bright)) 100%)',
        'hero-wash':
          'radial-gradient(circle at top left, rgb(var(--color-secondary) / 0.14), transparent 42%), radial-gradient(circle at bottom right, rgb(var(--color-outline) / 0.26), transparent 38%)',
      },
    },
  },
  plugins: [],
}
