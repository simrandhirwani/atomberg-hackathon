/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#fdf6e3', 
          primary: '#eab308', 
          dark: '#ca8a04'
        }
      }
    },
  },
  plugins: [],
}