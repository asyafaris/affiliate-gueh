import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"]
      },
      colors: {
        // Legacy aliases kept during the redesign so not-yet-restyled
        // markup doesn't hard-break; new work should use the tokens below.
        ink: "#1f2937",
        paper: "#eef0f2",
        moss: "#10b981",
        leaf: "#10b981",
        clay: "#b45309",
        line: "#e5e7eb",

        primary: "#1f2937",
        accent: {
          DEFAULT: "#10b981",
          dark: "#047857",
          tint: "#ecfdf5",
          wash: "#f0fdf9",
          border: "#d1fae5"
        },
        warn: { DEFAULT: "#b45309", tint: "#fffbeb" },
        error: "#dc2626",
        chrome: "#eef0f2",
        merchant: {
          shopee: "#ee4d2d",
          tokopedia: "#03ac0e",
          lazada: "#0f146d",
          blibli: "#0095da",
          tiktok: "#000000"
        },
        neutral: {
          900: "#111827",
          800: "#1f2937",
          700: "#374151",
          600: "#4b5563",
          500: "#6b7280",
          400: "#9ca3af",
          300: "#d1d5db",
          200: "#e5e7eb",
          100: "#f3f4f6",
          50: "#f9fafb"
        }
      },
      borderRadius: {
        card: "14px",
        panel: "16px",
        control: "10px",
        chip: "12px"
      },
      boxShadow: {
        soft: "0 20px 48px rgba(16, 24, 40, 0.12)",
        lift: "0 12px 26px rgba(16, 24, 40, 0.11)"
      },
      backgroundImage: {
        "gradient-wash": "linear-gradient(180deg, #f0fdf9, #ffffff)",
        "gradient-accent": "linear-gradient(135deg, #10b981, #047857)",
        placeholder:
          "repeating-linear-gradient(135deg, #f3f4f6, #f3f4f6 10px, #eceef1 10px, #eceef1 20px)"
      }
    }
  },
  plugins: [typography]
};

export default config;
