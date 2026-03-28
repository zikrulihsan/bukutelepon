import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Nunito Sans"', "sans-serif"],
      },
      colors: {
        primary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#166534",
          800: "#14532d",
          900: "#052e16",
          950: "#022c22",
        },
        whatsapp: "#25D366",
      },
    },
  },
  plugins: [],
};

export default config;
