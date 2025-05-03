// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "cyber-security": "url('/src/assets/images/cyber-security-bg.jpg')",
      },
      keyframes: {
        slideInRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        slideInRight: "slideInRight 0.3s ease-out",
      },
    },
  },
  plugins: [],
}