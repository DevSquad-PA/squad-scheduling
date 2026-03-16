/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        text: 'var(--color-text)',
        alert: 'var(--color-alert)',
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        borderi: 'var(--color-borderi)',
      },
    },
  },
  plugins: [],
}