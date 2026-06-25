/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        dark: "#0F172A",
        warm: "#F59E0B",
        light: "#F8FAFC",
        muted: "#64748B",
        success: "#10B981",
        danger: "#EF4444",
      },
    },
  },
  plugins: [],
};