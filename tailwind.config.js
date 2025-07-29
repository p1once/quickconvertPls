export default {
  content: ['./**/*.{html,js,css,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)'
      },
      borderColor: {
        DEFAULT: 'var(--border)'
      }
    }
  },
  plugins: []
}
