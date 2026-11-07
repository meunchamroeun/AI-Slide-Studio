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
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        brand: 'var(--brand)',
        sidebar: 'var(--sidebar)',
      },
      borderRadius: {
        '3xl': '1.625rem',
        '2xl': '1.25rem',
        xl: '1rem',
        lg: '0.85rem',
        md: '0.625rem',
        sm: '0.375rem',
      },
      fontFamily: {
        sans: ['var(--font-roboto)', 'var(--font-khmer)', 'Roboto', 'Kantumruy Pro', 'sans-serif'],
        serif: ['var(--font-roboto)', 'var(--font-khmer)', 'Roboto', 'Kantumruy Pro', 'sans-serif'],
        khmer: ['var(--font-khmer)', 'Kantumruy Pro', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        glow: 'glow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(56, 189, 248, 0.2)' },
          '100%': {
            boxShadow:
              '0 0 30px rgba(56, 189, 248, 0.4), 0 0 10px rgba(56, 189, 248, 0.2)',
          },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
