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
        background: '#121216',
        primary: '#A238FF',
        accent: '#CCFF00',
        card: 'rgba(88, 28, 135, 0.8)',
      },
    },
  },
  plugins: [],
};
