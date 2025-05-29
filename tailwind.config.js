/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#fcfaf8",
          light: "#fdf9f6",
        },
        surface: {
          DEFAULT: "#f3ece7",
          light: "#f5ede7",
        },
        primary: {
          DEFAULT: "#1b130d",
        },
        accent: {
          DEFAULT: "#9a6b4c",
          light: "#a97c5a",
        },
        orange: {
          DEFAULT: "#FF6347",
          dark: "#f4811f",
          light: "#ed782a",
        },
        white: "#ffffff",
      },
    },
  },
  plugins: [],
};
