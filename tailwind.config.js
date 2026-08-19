/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      // CUSTOM COLOR CONFIGURATION
      colors: {
        // CUSTOM COLOR CONFIGURATION
        'primary': 'rgb(var(--color-primary) / <alpha-value>)',
        'primary-light': 'rgb(var(--color-primary-light) / <alpha-value>)',
        'primary-hover': 'rgb(var(--color-primary-hover) / <alpha-value>)',
        'white': 'rgb(var(--color-white) / <alpha-value>)',
        'dark': 'rgb(var(--color-dark) / <alpha-value>)',
        'gray': 'rgb(var(--color-dark-light) / <alpha-value>)',

      },
      screens: {
        'desktop-lg': '1400px',
        'desktop-xl': '2500px',
        'xs': { 'min': '0px', 'max': '425px' },
      },
      fontFamily: {
        'poppins': ["Poppins", 'sans-serif'],
        'sora': ["Sora", 'sans-serif'],
        'inter': ["Inter", 'sans-serif'],
        'athiti': ["Athiti", 'sans-serif'],
        'montserrat': ["Montserrat", 'sans-serif'],
      }
    },
  },
  plugins: [],
}

