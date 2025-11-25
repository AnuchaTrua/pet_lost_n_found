import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#f97316',
          secondary: '#0ea5e9',
        },
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        petalert: {
          primary: '#f97316',
          secondary: '#0ea5e9',
          accent: '#14b8a6',
          neutral: '#1f2937',
          'base-100': '#ffffff',
          info: '#0ea5e9',
          success: '#22c55e',
          warning: '#fbbf24',
          error: '#ef4444',
        },
      },
    ],
    base: true,
    styled: true,
    utils: true,
  },
};

export default config;

