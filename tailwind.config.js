/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        power: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1e40af",
          800: "#1e3a8a",
          900: "#0c1d4d",
          950: "#06112e",
        },
        status: {
          ok: "#10b981",
          warn: "#f59e0b",
          danger: "#ef4444",
          alert: "#f97316",
        },
      },
      fontFamily: {
        display: ["Orbitron", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "glow-blue": "0 0 20px rgba(59,130,246,0.45)",
        "glow-danger": "0 0 24px rgba(239,68,68,0.6)",
        "glow-warn": "0 0 18px rgba(245,158,11,0.55)",
      },
      keyframes: {
        flashBorder: {
          "0%,100%": { boxShadow: "0 0 0 2px rgba(239,68,68,0.9), 0 0 30px rgba(239,68,68,0.7)" },
          "50%": { boxShadow: "0 0 0 4px rgba(239,68,68,0.4), 0 0 8px rgba(239,68,68,0.2)" },
        },
        pulseDot: {
          "0%,100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.9)" },
        },
        slideIn: {
          "0%": { transform: "translateY(-8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        flashBorder: "flashBorder 0.8s ease-in-out infinite",
        pulseDot: "pulseDot 1.6s ease-in-out infinite",
        slideIn: "slideIn 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
