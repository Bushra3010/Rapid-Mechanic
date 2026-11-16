/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 50: '#eef3f8', 100: '#d5e1ec', 200: '#a9c1d7', 500: '#2a5a87', 700: '#143c5f', 800: '#0f2e49', 900: '#0a2034' },
        brand: { 50: '#fff4ec', 100: '#ffe3cf', 400: '#f28a25', 500: '#e36010', 600: '#c24f0b' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
