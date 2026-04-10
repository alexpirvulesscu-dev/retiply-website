/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#F0EDE8',
          surface: '#E8E4DF',
          surface3: '#DEDAD4',
          accent: '#2D1B8E',
          'accent-light': '#4A35C0',
          text: '#0A0A09',
          muted: '#666666',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
