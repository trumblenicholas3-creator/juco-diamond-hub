/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        condensed: ['"Barlow Condensed"', 'sans-serif'],
        serif: ['Lora', 'serif'],
      },
      colors: {
        green: {
          hub: '#1D9E75',
          dark: '#0F6E56',
          darker: '#085041',
          light: '#E1F5EE',
          mid: '#9FE1CB',
        }
      }
    },
  },
  plugins: [],
}
