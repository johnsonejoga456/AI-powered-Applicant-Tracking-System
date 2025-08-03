/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: { 900: '#1A2A44' },
        teal: { 500: '#0D9488', 600: '#0F766E' },
        coral: { 500: '#F28C38' },
      },
    },
  },
  corePlugins: {
    backgroundOpacity: true,
  },
  plugins: [],
};