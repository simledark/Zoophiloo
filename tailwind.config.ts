import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: "#ff8c42",
          d: "#e06a1a",
        },
        lime: {
          DEFAULT: "#c8f53a",
          d: "#9dc92a",
        },
        violet: {
          DEFAULT: "#7c3aed",
          l: "#ede9fe",
        },
        teal: {
          DEFAULT: "#0d9488",
          l: "#ccfbf1",
        },
        emerald: {
          DEFAULT: "#10b981",
        },
        ink: {
          DEFAULT: "#0f0f1a",
          2: "#1c1c2e",
        },
        cream: "#fafaf7",
        warm: "#f4f0e8",
        sand: "#e8e2d4",
      },
      fontFamily: {
        syne: ["var(--font-syne)", "sans-serif"],
        space: ["var(--font-space)", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        card: "0 2px 12px 0 rgba(15,15,26,0.08)",
        "card-hover": "0 8px 32px 0 rgba(15,15,26,0.16)",
        orange: "0 4px 24px 0 rgba(255,140,66,0.35)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
