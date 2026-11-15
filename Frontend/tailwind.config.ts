import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        medical: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          500: '#0284c7',
          800: '#075985',
          900: '#0c4a6e',
          navy: '#0B1528',
          dark: '#080E1A',
        },
        bronze: {
          50: '#fbf8f5',
          100: '#f6f0ea',
          200: '#ecdccd',
          300: '#dec2aa',
          400: '#caa081',
          500: '#b4835b',
          600: '#9e6d47',
          700: '#835539',
          800: '#6c4632',
          900: '#583b2b',
        },
        clinic: {
          canvas: '#FAF8F5',
          gold: '#C5A059',
          emerald: '#059669',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
