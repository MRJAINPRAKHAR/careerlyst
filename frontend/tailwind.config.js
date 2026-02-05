/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // <--- ADD THIS LINE!
  theme: {
    extend: {
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'spotlight': 'spotlight 2s ease .75s 1 forwards',
      },
      // ... keep your other extensions
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}