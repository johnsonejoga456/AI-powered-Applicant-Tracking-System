/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: { 500: '#2DD4BF', 600: '#26A69A' },
        navy: { 900: '#1E3A8A' },
        coral: { 500: '#F472B6' },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};