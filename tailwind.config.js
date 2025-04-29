/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#121212',
          text: '#f3f4f6',
          primary: '#fae650',
          secondary: '#2a2a2a'
        },
        light: {
          bg: '#f3f4f6',
          text: '#121212',
          primary: '#fae650',
          secondary: '#e5e7eb'
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}