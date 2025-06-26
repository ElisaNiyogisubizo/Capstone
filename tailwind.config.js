/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#16425b',
          50: '#f0f4f7',
          100: '#d9e2ea',
          200: '#b8cdd9',
          300: '#8fb0c4',
          400: '#5f8ba8',
          500: '#16425b',
          600: '#133a52',
          700: '#103148',
          800: '#0d293e',
          900: '#0a2033',
        },
        secondary: {
          DEFAULT: '#d9dcd6',
          50: '#f8f9f7',
          100: '#f1f3ee',
          200: '#e3e7dc',
          300: '#d9dcd6',
          400: '#c5cabb',
          500: '#b1b8a0',
          600: '#9da585',
          700: '#88936a',
          800: '#74814f',
          900: '#606f34',
        },
        accent: {
          DEFAULT: '#8fb0c4',
          50: '#f4f8fa',
          100: '#e9f0f5',
          200: '#d3e1eb',
          300: '#8fb0c4',
          400: '#7ba3ba',
          500: '#6796b0',
          600: '#5389a6',
          700: '#3f7c9c',
          800: '#2b6f92',
          900: '#176288',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
        'display': ['Poppins', 'ui-sans-serif', 'system-ui'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};