import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B1120",
        foreground: "#FFFFFF",
        primary: {
          DEFAULT: "#19E3FF",
          foreground: "#0B1120",
        },
        secondary: {
          DEFAULT: "#7C5CFF",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#22E6A7",
          foreground: "#0B1120",
        },
        card: {
          DEFAULT: "#141B2D",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#1E2A45",
          foreground: "#94A3B8",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(25, 227, 255, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(25, 227, 255, 0.6)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
