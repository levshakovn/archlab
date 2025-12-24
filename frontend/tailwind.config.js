/** @type {import('tailwindcss').Config} */
export default {
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
        'bg-light': '#F5F5F5',
        'text-primary': '#212121',
        'text-secondary': '#757575',
      },
    },
  },
  plugins: [],
}

