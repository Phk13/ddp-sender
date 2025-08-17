import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#0066cc",
          700: "#0052a3",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#808080",
          600: "#b3b3b3",
          700: "#4b5563",
          800: "#3a3a3a",
          850: "#2d2d2d",
          900: "#1a1a1a",
          950: "#111827",
        },
        success: "#28a745",
        warning: "#ffc107",
        danger: "#dc3545",
      },
      backgroundColor: {
        primary: "#1a1a1a",
        secondary: "#2d2d2d",
        tertiary: "#3a3a3a",
        hover: "#404040",
        active: "#4a4a4a",
      },
      textColor: {
        primary: "#ffffff",
        secondary: "#b3b3b3",
        muted: "#808080",
      },
      borderColor: {
        default: "#404040",
        light: "#555555",
      },
      borderRadius: {
        default: "6px",
        lg: "8px",
      },
      boxShadow: {
        default: "0 2px 8px rgba(0, 0, 0, 0.3)",
        lg: "0 4px 16px rgba(0, 0, 0, 0.4)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
