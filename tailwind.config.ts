import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        ar: ["var(--font-ar)", "serif"],
        en: ["var(--font-en)", "serif"],
      },
      colors: {
        "apex-bg":         "var(--color-background)",
        "apex-card":       "var(--color-card)",
        "apex-text":       "var(--color-primary-text)",
        "apex-muted":      "var(--color-secondary-text)",
        "apex-primary":    "var(--color-primary)",
        "apex-primary-l":  "var(--color-primary-light)",
        "apex-accent":     "var(--color-accent)",
        "apex-border":     "var(--color-border)",
        "apex-gold":       "var(--color-gold)",
      },
      animation: {
        "fade-up":     "apex-fade-up 0.75s ease both",
        "float":       "apex-float 4s ease-in-out infinite",
        "shimmer":     "apex-shimmer 4s linear infinite",
        "pulse-ring":  "apex-pulse-ring 2s ease-out infinite",
        "dot-blink":   "apex-dot-blink 2.5s ease-in-out infinite",
      },
      backgroundImage: {
        "apex-grid": `
          linear-gradient(var(--color-border) 1px, transparent 1px),
          linear-gradient(90deg, var(--color-border) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        "grid-60": "60px 60px",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        "apex-glow":     "0 8px 30px color-mix(in srgb, var(--color-primary) 35%, transparent)",
        "apex-glow-lg":  "0 20px 60px color-mix(in srgb, var(--color-primary) 22%, transparent)",
        "apex-gold":     "0 8px 30px color-mix(in srgb, var(--color-gold) 35%, transparent)",
      },
      transitionDuration: {
        "400": "400ms",
      },
    },
  },
  plugins: [],
};

export default config;
