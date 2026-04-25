import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0F172A",
        steel: "#334155",
        mist: "#E2E8F0",
        cloud: "#F8FAFC",
        aurora: {
          50: "#EFFCF8",
          100: "#D9F8EE",
          500: "#13B38B",
          600: "#0A8A6D",
          700: "#0A6D59"
        },
        saffron: {
          100: "#FFF6D8",
          400: "#F6BF3E",
          500: "#E69D11"
        },
        coral: {
          100: "#FFE3DE",
          500: "#E76F51"
        }
      },
      boxShadow: {
        panel: "0 22px 60px rgba(15, 23, 42, 0.08)",
        soft: "0 14px 40px rgba(15, 23, 42, 0.06)"
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.4s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
