/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#38b6ff',
        'primary-dark': '#2d92cc',
        'primary-light': '#5cc5ff',
        'page-background': '#f5faff', // Lighter blue background
      },
      fontFamily: {
        sans: ['"Bricolage Grotesque"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};