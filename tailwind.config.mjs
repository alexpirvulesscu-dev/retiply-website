import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette';

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
          accent: '#5B1FE8',
          'accent-light': '#7344F0',
          text: '#0A0A09',
          muted: '#666666',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        aurora: 'aurora 60s linear infinite',
      },
      keyframes: {
        aurora: {
          from: { backgroundPosition: '50% 50%, 50% 50%' },
          to:   { backgroundPosition: '350% 50%, 350% 50%' },
        },
      },
    },
  },
  plugins: [addVariablesForColors],
};

function addVariablesForColors({ addBase, theme }) {
  const allColors = flattenColorPalette(theme('colors'));
  const newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );
  addBase({ ':root': newVars });
}
