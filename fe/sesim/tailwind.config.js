/** @type {import("tailwindcss").Config} */
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
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" }
        },
        slideIn: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        slideOut: {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(20px)", opacity: "0" }
        }
      },
      animation: {
        slideInRight: "slideInRight 0.3s ease-out",
        fadeIn: "fadeIn 0.3s ease-in-out forwards",
        fadeOut: "fadeOut 0.3s ease-in-out forwards",
        slideIn: "slideIn 0.3s ease-in-out forwards",
        slideOut: "slideOut 0.3s ease-in-out forwards"
      },
    },
  },
  plugins: [],
};
