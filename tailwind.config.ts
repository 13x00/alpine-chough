import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './stories/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Carbon theme tokens (from carbon-tokens.css) */
        background: 'var(--cds-background)',
        'layer-01': 'var(--cds-layer-01)',
        'layer-02': 'var(--cds-layer-02)',
        'layer-03': 'var(--cds-layer-03)',
        'layer-background-01': 'var(--cds-layer-background-01)',
        'layer-hover-01': 'var(--cds-layer-hover-01)',
        'text-primary': 'var(--cds-text-primary)',
        'text-secondary': 'var(--cds-text-secondary)',
        'text-helper': 'var(--cds-text-helper)',
        'border-subtle-00': 'var(--cds-border-subtle-00)',
        'border-subtle-01': 'var(--cds-border-subtle-01)',
        'border-strong-01': 'var(--cds-border-strong-01)',
        focus: 'var(--cds-focus)',
        interactive: 'var(--cds-interactive)',
        accent: 'var(--cds-interactive)',
        /* Carbon palette (for logo, status, etc.) */
        neutral: {
          50: 'var(--cds-warm-gray-10)',
          100: 'var(--cds-warm-gray-20)',
          200: 'var(--cds-warm-gray-30)',
          300: 'var(--cds-warm-gray-40)',
          400: 'var(--cds-warm-gray-50)',
          500: 'var(--cds-warm-gray-60)',
          600: 'var(--cds-warm-gray-70)',
          700: 'var(--cds-warm-gray-80)',
          800: 'var(--cds-warm-gray-90)',
          900: 'var(--cds-warm-gray-100)',
        },
        gray: {
          10: 'var(--cds-gray-10)',
          20: 'var(--cds-gray-20)',
          30: 'var(--cds-gray-30)',
          40: 'var(--cds-gray-40)',
          50: 'var(--cds-gray-50)',
          60: 'var(--cds-gray-60)',
          70: 'var(--cds-gray-70)',
          80: 'var(--cds-gray-80)',
          90: 'var(--cds-gray-90)',
          100: 'var(--cds-gray-100)',
        },
        blue: {
          10: 'var(--cds-blue-10)',
          20: 'var(--cds-blue-20)',
          30: 'var(--cds-blue-30)',
          40: 'var(--cds-blue-40)',
          50: 'var(--cds-blue-50)',
          60: 'var(--cds-blue-60)',
          70: 'var(--cds-blue-70)',
          80: 'var(--cds-blue-80)',
          90: 'var(--cds-blue-90)',
          100: 'var(--cds-blue-100)',
        },
        'support-info': 'var(--cds-support-info)',
        'support-warning': 'var(--cds-support-warning)',
        'support-success': 'var(--cds-support-success)',
        'support-error': 'var(--cds-support-error)',
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
        xl: 'var(--radius-xl)',
        control: 'var(--radius-control)',
        full: 'var(--radius-full)',
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
