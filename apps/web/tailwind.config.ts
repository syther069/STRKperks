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
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
        display: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
      },
      borderRadius: {
        card: "8px",
        btn: "6px",
      },
      boxShadow: {
        glow:
          "inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 5px rgba(68,22,7,0.46), 0 14px 32px -16px rgba(255,90,31,0.52)",
        "glow-reward":
          "inset 0 1px 0 rgba(255,255,255,0.16), 0 2px 5px rgba(20,38,7,0.5), 0 14px 32px -16px rgba(183,255,90,0.42)",
        "glow-privacy":
          "inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 5px rgba(5,35,31,0.54), 0 14px 32px -16px rgba(60,231,199,0.4)",
        panel:
          "inset 0 1px 0 rgba(255,255,255,0.055), inset 0 -1px 0 rgba(0,0,0,0.38), 0 3px 10px rgba(0,0,0,0.2), 0 26px 70px -38px rgba(255,90,31,0.22)",
        "card-hover":
          "inset 0 1px 0 rgba(255,255,255,0.07), 0 8px 18px -10px rgba(0,0,0,0.8), 0 24px 48px -24px rgba(255,90,31,0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
