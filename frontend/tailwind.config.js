/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1976D2',
        'primary-hover': '#1565C0',
        'primary-active': '#0D47A1',
        secondary: '#00ACC1',
        'secondary-light': '#E0F2F1',
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
        'bg-light': 'var(--color-bg-light)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
      },
    },
  },
  plugins: [],
}

