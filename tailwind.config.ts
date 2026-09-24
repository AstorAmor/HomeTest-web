import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base oscura cálida (no negro puro, ligero tono azulado profundo)
        bg: "var(--color-bg)",
        "bg-soft": "var(--color-bg-soft)",
        surface: "var(--color-surface)",
        "surface-hover": "var(--color-surface-hover)",
        border: "var(--color-border)",
        // Texto en crema cálido, no blanco puro, para suavizar el contraste
        text: "var(--color-text)",
        "text-muted": "var(--color-text-muted)",
        // Azul principal/de acento, con un matiz cálido (más índigo que cian)
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
          soft: "var(--color-accent-soft)",
          dark: "var(--color-accent-dark)",
          light: "var(--color-accent-light)",
        },
        // Toque cálido secundario, usado con moderación (iconos, detalles)
        warm: {
          DEFAULT: "var(--color-warm)",
          soft: "var(--color-warm-soft)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      maxWidth: {
        content: "72rem",
      },
    },
  },
  plugins: [],
};
export default config;
