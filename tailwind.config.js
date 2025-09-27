/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    "./popup.html"
  ],
  theme: {
    extend: {
      colors: {
        linkedin: {
          blue: '#0077b5',
          dark: '#004182',
          light: '#00a0dc'
        }
      }
    },
  },
  plugins: [],
}