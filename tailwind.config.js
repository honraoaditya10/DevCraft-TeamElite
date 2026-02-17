/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        urbanist: ['Urbanist', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        primary: '#0066cc',
        'primary-dark': '#004499',
        'primary-light': '#3399ff',
        secondary: '#00d9ff',
      },
    },
  },
  plugins: [],
}
