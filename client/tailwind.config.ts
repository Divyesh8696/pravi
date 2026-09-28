import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#14232B',
          2: '#3D4F58',
          3: '#6B7C85',
        },
        paper: '#F4F5F2',
        surface: '#FFFFFF',
        line: '#D5DAD6',
        brand: {
          DEFAULT: '#1E6B52',
          strong: '#175340',
          tint: '#E3F0EA',
        },
        ok: {
          DEFAULT: '#2E7D32',
          tint: '#E8F5E9',
        },
        progress: {
          DEFAULT: '#0E7490',
          tint: '#E0F2FE',
        },
        info: {
          DEFAULT: '#2B6CB0',
          tint: '#EBF8FF',
        },
        warn: {
          DEFAULT: '#B7791F',
          tint: '#FEF3C7',
        },
        crit: {
          DEFAULT: '#B42318',
          tint: '#FEE2E2',
        },
        neutral: {
          DEFAULT: '#64748B',
          tint: '#F1F5F9',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
      },
    },
  },
  plugins: [],
} satisfies Config;
