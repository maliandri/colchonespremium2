/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6B3FAB',      // Violeta del logo Aluminé Hogar
        secondary: '#8BC34A',    // Verde del logo
        accent: '#9B6FD4',       // Violeta más claro para hover
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
