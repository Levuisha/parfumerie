import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        orange: {
          500: "#ff6b35",
          400: "#ff8c42",
        },
        dark: {
          DEFAULT: "#0a0a0a",
          card: "#141414",
          "card-hover": "#1a1a1a",
          border: "#2a2a2a",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "orange-sm": "0 2px 8px rgba(255, 107, 53, 0.2)",
        "orange-md": "0 4px 12px rgba(255, 107, 53, 0.3)",
        "orange-lg": "0 8px 32px rgba(255, 107, 53, 0.2)",
        "orange-glow": "0 0 8px rgba(255, 107, 53, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
