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
        line: "#e7e0d3"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(23, 33, 27, 0.10)"
      }
    }
  },
  plugins: [typography]
};

export default config;
