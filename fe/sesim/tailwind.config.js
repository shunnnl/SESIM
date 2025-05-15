/** @type {import("tailwindcss").Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkitembg: "#242B3A",
      },
      backgroundImage: {
        "cyber-security": "url('/src/assets/images/cyber-security-bg.webp')",
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
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-5px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(5px)" }
        }
      },
      animation: {
        slideInRight: "slideInRight 0.3s ease-out",
        fadeIn: "fadeIn 0.3s ease-in-out forwards",
        fadeOut: "fadeOut 0.3s ease-in-out forwards",
        slideIn: "slideIn 0.3s ease-in-out forwards",
        slideOut: "slideOut 0.3s ease-in-out forwards",
        shake: "shake 0.5s cubic-bezier(.36,.07,.19,.97) both"
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        ".scrollbar-custom": {
          "&::-webkit-scrollbar": {
            width: "4px",
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "rgba(0, 0, 0)",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(255, 255, 255, 0.5)",
            borderRadius: "4px",
            "&:hover": {
              background: "rgba(255, 255, 255, 0.7)",
            },
          },
        }
      };
      addUtilities(newUtilities);
    },
  ],
};
