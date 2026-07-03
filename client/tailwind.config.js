/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ahmedify: {
          green: "#1DB954",
          "green-hover": "#1ED760",
          bg: "#121212",
          "bg-secondary": "#181818",
          card: "#242424",
          "card-hover": "#2A2A2A",
          border: "#2E2E2E",
          text: "#FFFFFF",
          "text-secondary": "#A7A7A7",
          "text-muted": "#6A6A6A",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.35)",
        player: "0 -4px 24px rgba(0,0,0,0.5)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        pulseDot: {
          "0%, 80%, 100%": { opacity: 0.3, transform: "scale(0.8)" },
          "40%": { opacity: 1, transform: "scale(1)" },
        },
        spinSlow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.4s ease-out",
        pulseDot: "pulseDot 1.4s ease-in-out infinite",
        spinSlow: "spinSlow 20s linear infinite",
      },
    },
  },
  plugins: [],
};