/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <--- This enables the toggle logic
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}