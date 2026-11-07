/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/shared/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0A1A',
        foreground: '#F8FAFC',
        card: {
          DEFAULT: '#14122E',
          foreground: '#FFFFFF',
        },
        popover: {
          DEFAULT: '#14122E',
          foreground: '#FFFFFF',
        },
        primary: {
          DEFAULT: '#7C5CFC',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#1E1B3A',
          foreground: '#D1CEE8',
        },
        muted: {
          DEFAULT: '#1A1835',
          foreground: '#8D88B8',
        },
        accent: {
          DEFAULT: '#2DD4E6',
          foreground: '#0B0A1A',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        border: '#4A3E99',
        input: '#14122E',
        ring: '#7C5CFC',
      },
      borderRadius: {
        lg: '16px',
        md: '12px',
        sm: '8px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(124, 92, 252, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(124, 92, 252, 0.5), 0 0 10px rgba(45, 212, 230, 0.3)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
