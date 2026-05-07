/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{vue,ts,tsx}',
    './components/**/*.{vue,ts,tsx}',
    './renderer/**/*.{vue,ts,tsx}'
  ],
  theme: {
    extend: {}
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['bumblebee', 'halloween']
  }
}
