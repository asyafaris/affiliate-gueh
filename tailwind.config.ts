import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
        serif: ["var(--font-newsreader)", "ui-serif", "Georgia"]
      },
      colors: {
        ink: "#17211b",
        paper: "#fbfaf5",
        moss: "#365744",
        leaf: "#6f8f72",
        clay: "#b46a45",
        line: "#e7e0d3",
        neutral: {
          900: "#17211b",
          700: "#3f4a42",
          600: "#5a655c",
          400: "#8a9389",
          200: "#e7e0d3",
          100: "#f3f1ea",
          50: "#fbfaf5"
        }
      },
      boxShadow: {
        soft: "0 18px 60px rgba(23, 33, 27, 0.10)"
      }
    }
  },
  plugins: [typography]
};

export default config;
