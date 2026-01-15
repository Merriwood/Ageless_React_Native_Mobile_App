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
        primary: {
          DEFAULT: '#C5282F',
          hover: '#b12228',
          active: '#9a1d23',
        },
        bg: '#F7F7F9',
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#F2F2F7',
        },
        text: {
          DEFAULT: '#111111',
          muted: '#666666',
        },
        border: {
          DEFAULT: '#E2E3E6',
          strong: '#D0D1D4',
        },
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
        xl: '20px',
        '2xl': '24px',
      },
      boxShadow: {
        elev: '0 4px 12px rgba(0,0,0,0.08)',
        'elev-hover': '0 6px 16px rgba(0,0,0,0.12)',
      },
      spacing: {
        '2': '4px',
        '3': '6px',
        '4': '8px',
        '5': '10px',
        '6': '12px',
        '8': '16px',
        '10': '20px',
        '12': '24px',
      },
      transitionDuration: {
        'fast': '120ms',
        DEFAULT: '160ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'ease-out',
      },
    },
  },
  plugins: [],
}

export default config
