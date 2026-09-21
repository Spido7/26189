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
        "bg-base": "#09090b",
        "surface-card": "#121215",
        "surface-overlay": "#18181b",
        "border-subtle": "#27272a",
        "border-highlight": "#3f3f46",
        "threat-crimson": "#ef4444",
        "threat-crimson-dim": "#450a0a",
        "telecom-cyan": "#06b6d4",
        "telecom-cyan-dim": "#083344",
        "record-amber": "#f59e0b",
        "record-amber-dim": "#451a03",
        "accused-violet": "#a855f7",
        "accused-violet-dim": "#3b0764",
        "text-primary": "#f4f4f5",
        "text-secondary": "#a1a1aa",
        "text-muted": "#71717a",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: [
          "var(--font-jetbrains-mono)",
          "JetBrains Mono",
          "Geist Mono",
          "Fira Code",
          "monospace",
        ],
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        sm: "0.125rem",
        md: "0.25rem",
        lg: "0.25rem",
        xl: "0.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
