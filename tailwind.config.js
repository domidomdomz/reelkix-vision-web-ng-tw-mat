/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/@angular/material/**/*.mjs"
  ],
  theme: {
    extend: {
      colors: {
        'reelkix-red': '#FF0000',
        'reelkix-black': '#000000',
        'reelkix-dark-gray': '#1A1A1A',
        'reelkix-white': '#FFFFFF',
        'reelkix-light-gray': '#F5F5F5',
        'reelkix-gray': '#BDBDBD'
      }
    },
  },
  plugins: [],
};