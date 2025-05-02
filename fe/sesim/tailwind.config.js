/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'cyber-security': "url('/src/assets/images/cyber-security-bg.jpg')",
      },
    },
  },
  plugins: [],
} 