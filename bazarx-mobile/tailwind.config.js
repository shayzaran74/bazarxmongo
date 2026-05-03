/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#004B8D',
        accent:  '#3B82F6',
        dark:    '#0B1E33',
        surface: '#162E47',
      },
      fontFamily: {
        black:  ['SpaceGrotesk-Bold'],
        bold:   ['SpaceGrotesk-Medium'],
        body:   ['SpaceGrotesk-Regular'],
      },
    },
  },
  plugins: [],
}
