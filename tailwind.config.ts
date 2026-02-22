import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Using CSS custom properties from tokens.css
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        neutral: {
          50: 'var(--color-neutral-50)',
          100: 'var(--color-neutral-100)',
          200: 'var(--color-neutral-200)',
          300: 'var(--color-neutral-300)',
          400: 'var(--color-neutral-400)',
          500: 'var(--color-neutral-500)',
          600: 'var(--color-neutral-600)',
          700: 'var(--color-neutral-700)',
          800: 'var(--color-neutral-800)',
          900: 'var(--color-neutral-900)',
        },
        blue: {
          10: 'var(--color-blue-10)',
          20: 'var(--color-blue-20)',
          30: 'var(--color-blue-30)',
          40: 'var(--color-blue-40)',
          50: 'var(--color-blue-50)',
          60: 'var(--color-blue-60)',
          70: 'var(--color-blue-70)',
          80: 'var(--color-blue-80)',
          90: 'var(--color-blue-90)',
          100: 'var(--color-blue-100)',
        },
        layer: {
          bg: 'hsl(var(--layer-bg))',
          1: 'hsl(var(--layer-1))',
          2: 'hsl(var(--layer-2))',
          3: 'hsl(var(--layer-3))',
          4: 'hsl(var(--layer-4))',
          5: 'hsl(var(--layer-5))',
          6: 'hsl(var(--layer-6))',
          7: 'hsl(var(--layer-7))',
          8: 'hsl(var(--layer-8))',
          surface: 'hsl(var(--layer-surface))',
        },
        accent: 'hsl(var(--color-accent))',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      spacing: {
        // Using CSS custom properties
      },
      borderRadius: {
        DEFAULT: 'var(--radius-sm)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      transitionDuration: {
        DEFAULT: 'var(--duration-normal)',
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
      },
      transitionTimingFunction: {
        DEFAULT: 'var(--easing-standard)',
      },
    },
  },
  plugins: [],
}
export default config
