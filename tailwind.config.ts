import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 50/100/200 are CSS-variable channels so subtle fills & borders adapt to dark mode.
        // 300-900 + DEFAULT stay constant brand blues (used for accents, buttons, focus rings).
        primary: {
          50:  "rgb(var(--p50) / <alpha-value>)",
          100: "rgb(var(--p100) / <alpha-value>)",
          200: "rgb(var(--p200) / <alpha-value>)",
          300: "#87D0FD",
          400: "#57bcfb",
          500: "#2ea8f8",
          600: "#1490e0",
          700: "#0f72b4",
          800: "#0d5a8e",
          900: "#0b4570",
          DEFAULT: "#87D0FD",
        },
        secondary: {
          50:  "#f0fafa",
          100: "#ccf0ef",
          200: "#99e0de",
          300: "#5ec7c6",
          400: "#429E9D",
          500: "#357e7d",
          600: "#296362",
          700: "#1f4a49",
          800: "#163333",
          900: "#0e2020",
          DEFAULT: "#429E9D",
        },
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          muted:   "rgb(var(--ink-muted) / <alpha-value>)",
          subtle:  "rgb(var(--ink-subtle) / <alpha-value>)",
        },
        bg: {
          DEFAULT: "rgb(var(--bg) / <alpha-value>)",
        },
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          2:       "rgb(var(--surface-2) / <alpha-value>)",
        },
        // Trading semantics — kept on-brand (teal up / red down) rather than generic emerald.
        up:   { DEFAULT: "rgb(var(--up) / <alpha-value>)" },
        down: { DEFAULT: "rgb(var(--down) / <alpha-value>)" },
        success: {
          50:  "#f0fafa",
          100: "#ccf0ef",
          DEFAULT: "#429E9D",
          600: "#296362",
        },
        warning: {
          50:  "#fffbeb",
          100: "#fef3c7",
          DEFAULT: "#f59e0b",
          600: "#d97706",
        },
        error: {
          50:  "#fff5f5",
          100: "#fed7d7",
          DEFAULT: "#e53e3e",
          600: "#c53030",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["3rem", { lineHeight: "1.1", fontWeight: "700" }],
        h1:      ["2.25rem", { lineHeight: "1.2", fontWeight: "700" }],
        h2:      ["1.75rem", { lineHeight: "1.25", fontWeight: "600" }],
        h3:      ["1.375rem", { lineHeight: "1.35", fontWeight: "600" }],
        body:    ["1rem", { lineHeight: "1.6" }],
        small:   ["0.875rem", { lineHeight: "1.5" }],
        caption: ["0.75rem", { lineHeight: "1.4" }],
      },
      borderRadius: {
        sm:    "8px",
        md:    "12px",
        lg:    "16px",
        xl:    "20px",
        "2xl": "24px",
      },
      boxShadow: {
        card:   "0 2px 12px rgba(19,32,43,0.06)",
        lifted: "0 8px 24px rgba(19,32,43,0.10)",
        modal:  "0 20px 60px rgba(19,32,43,0.18)",
        btn:    "0 2px 8px rgba(135,208,253,0.30)",
      },
    },
  },
  plugins: [],
};
export default config;
