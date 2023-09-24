/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,jsx,tsx,svg}"],
  theme: {
    extend: {
      fontFamily: {
        primary: ['Montserrat', 'sans-serif'],
      },
      colors: {
        'primary': '#539CFA',
        'secondary': '#6EE3B8',
        'tertiary': '#1A2E35',
        'option': 'rgba(26, 46, 53, 0.7)',
        'selected': '#1A2E35',
        'overlay': 'rgba(0, 0, 0, 0.5)',
        'circle': 'rgba(83, 156, 250, 0.6)',
        'circle-selected': 'rgba(110, 227, 184, 0.6)',
        'white-1': 'rgba(255, 255, 255, 0.3)'
      },
      backgroundImage: {
        'paralax': "url('/src/assets/parallax-bg.jpg')"
      },
      dropShadow: {
        'primary': '0px 4px 12px rgb(0, 0, 0, 0.25)',
        'secondary':'0px 1px 4px #6EE3B8'
      },
    },
  },
  plugins: [],
}

