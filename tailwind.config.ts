import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#0A0A0A",
        panel: "#111111",
        ink: "#F5F5F5",
        muted: "#A3A3A3",
        line: "#2A2A2A"
      },
      fontFamily: {
        display: ["Impact", "Haettenschweiler", "Arial Narrow Bold", "sans-serif"],
        sans: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"]
      },
      boxShadow: {
        luxe: "0 20px 80px rgba(255,255,255,0.08)"
      },
      backgroundImage: {
        grain:
          "radial-gradient(circle at top, rgba(255,255,255,0.14), transparent 35%), linear-gradient(135deg, rgba(255,255,255,0.06), transparent 50%)"
      },
      keyframes: {
        floatIn: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "float-in": "floatIn 0.7s ease-out forwards"
      }
    }
  },
  plugins: []
};

export default config;
