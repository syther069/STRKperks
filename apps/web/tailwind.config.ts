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
        bg: {
          DEFAULT: "#090A0A",
          surface: "#111313",
          raised: "#181B1B",
          subtle: "#141716",
        },
        border: {
          DEFAULT: "#2A2F2E",
          hover: "#3E4543",
          focus: "#FF5A1F",
        },
        brand: {
          primary: "#FF5A1F",
          "primary-hover": "#E84C14",
          "primary-subtle": "#2B170E",
          reward: "#B7FF5A",
          "reward-subtle": "#1B290F",
          privacy: "#3CE7C7",
          "privacy-subtle": "#0F2825",
        },
        status: {
          success: "#7CFF8A",
          warning: "#FFD166",
          error: "#FF5C5C",
        },
        fg: {
          primary: "#F4F1EA",
          secondary: "#A7ADA8",
          muted: "#6F7772",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
        display: ["var(--font-space)", "Space Grotesk", "sans-serif"],
      },
      borderRadius: {
        card: "8px",
        btn: "6px",
      },
      boxShadow: {
        glow: "0 0 20px -5px rgba(255, 90, 31, 0.15)",
        "glow-reward": "0 0 20px -5px rgba(183, 255, 90, 0.15)",
        "glow-privacy": "0 0 20px -5px rgba(60, 231, 199, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
