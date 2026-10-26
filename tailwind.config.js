/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        green: "#606C38",
        darkGreen: "#283618",
        primary: "#FEFAE0",
        brown: "#DDA15E",
        red: "#EB0B0B",
      },
    },
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
      body: ["Inter", "system-ui", "sans-serif"],
      display: ["Oswald", "Arial Narrow", "sans-serif"],
    },
  },
  plugins: [],
};
