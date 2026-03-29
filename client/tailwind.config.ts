import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "sans-serif"],
        sans: ['"Plus Jakarta Sans"', "sans-serif"],
      },
      colors: {
        primary: {
          50: "#F0FAF5",
          100: "#D6F0E4",
          200: "#A8E0CB",
          300: "#6BCAA8",
          400: "#3BAA84",
          500: "#25916D",
          600: "#1F7D5E",
          700: "#1A6B50",
          800: "#134E3A",
          900: "#0C3B2E",
          950: "#07281E",
        },
        neutral: {
          50: "#F7F9FA",
          100: "#F0F3F5",
          150: "#E6EAED",
          200: "#D9DEE3",
          300: "#B8C1CA",
          400: "#8B97A3",
          500: "#64717E",
          600: "#4A5563",
          700: "#374151",
          800: "#1E2A36",
          900: "#0F1923",
        },
        brandRed: {
          DEFAULT: "#DC2626",
          bg: "#FEF2F2",
          light: "#FCA5A5",
          dark: "#991B1B",
        },
        whatsapp: "#25D366",
      },
      animation: {
        fadeDown: "fadeDown 0.45s ease-out",
        fadeUp: "fadeUp 0.55s ease-out",
        pop: "pop 0.35s ease-out",
      },
      keyframes: {
        fadeDown: {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pop: {
          from: { opacity: "0", transform: "scale(0.88)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
