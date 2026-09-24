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
        "bg-base": "#0c0e12",
        "surface-card": "#13171e",
        "surface-overlay": "#1a202a",
        "surface-muted": "#222a36",
        "industrial-slate": "#2b3444",
        "industrial-steel": "#64748b",
        "border-subtle": "rgba(148, 163, 184, 0.14)",
        "border-highlight": "rgba(245, 158, 11, 0.35)",
        "threat-crimson": "#ef4444",
        "threat-crimson-dim": "#2e1214",
        "telecom-cyan": "#38bdf8",
        "telecom-cyan-dim": "#0c2838",
        "record-amber": "#f59e0b",
        "record-amber-dim": "#382306",
        "accused-violet": "#c084fc",
        "accused-violet-dim": "#29133e",
        "industrial-brass": "#d97706",
        "text-primary": "#f1f5f9",
        "text-secondary": "#94a3b8",
        "text-muted": "#64748b",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "system-ui", "sans-serif"],
        mono: [
          "var(--font-jetbrains-mono)",
          "JetBrains Mono",
          "Geist Mono",
          "monospace",
        ],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        sm: "0.125rem",
        md: "0.25rem",
        lg: "0.375rem",
        xl: "0.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
