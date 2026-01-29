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
        // Warm Minimal palette
        background: '#FFFFFF',
        primary: '#FFB07C',      // Apricot
        accent: '#FFB07C',       // Apricot
        secondary: '#F2E8DF',    // Beige
        card: '#FFFFFF',
      },
      letterSpacing: {
        tight: '-0.5px',
      },
    },
  },
  plugins: [],
};
