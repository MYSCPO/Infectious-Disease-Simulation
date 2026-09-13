/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#b3ccff',
          300: '#80a8ff',
          400: '#5580ff',
          500: '#3159f0',
          600: '#2342c9',
          700: '#1d349e',
          800: '#1a2c7d',
          900: '#182666',
        },
      },
    },
  },
  plugins: [],
}
