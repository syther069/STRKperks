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
          DEFAULT: "#0A0D0D",
          surface: "#111616",
          raised: "#171D1C",
          subtle: "#0D1110",
        },
        border: {
          DEFAULT: "#27302E",
          hover: "#3C4844",
          focus: "#FF6A38",
        },
        brand: {
          primary: "#FF6A38",
          "primary-hover": "#FF8358",
          "primary-subtle": "#2B170E",
          reward: "#C8FA63",
          "reward-subtle": "#1B290F",
          privacy: "#50DCC5",
          "privacy-subtle": "#0F2825",
        },
        status: {
          success: "#C8FA63",
          warning: "#F6C85F",
          error: "#F06A6A",
        },
        fg: {
          primary: "#F3F1EA",
          secondary: "#B4BDB7",
          muted: "#77817B",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
        display: ["Space Grotesk", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "8px",
        btn: "6px",
      },
    },
  },
  plugins: [],
};

export default config;
