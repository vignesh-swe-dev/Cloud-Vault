/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode surfaces
        surface: {
          bg:      '#F5F5F7',
          card:    '#FFFFFF',
          sidebar: '#F0F0F2',
          border:  '#DCDCE1',
        },
        // Brand
        accent: '#007AFF',
        // Text
        ink: {
          primary:   '#1D1D1F',
          secondary: '#86868B',
        },
        // Semantic
        ok:   '#34C759',
        warn: '#FF9F0A',
        danger: '#FF3B30',
        // Dark mode surfaces
        dark: {
          bg:      '#1C1C1E',
          card:    '#2C2C2E',
          sidebar: '#242426',
          border:  '#3A3A3C',
          elevated:'#3A3A3C',
        },
        // Legacy vault colors (still used in some places)
        vault: {
          50:  '#f0f0ff',
          100: '#e4e4ff',
          200: '#cccbff',
          300: '#aaa8ff',
          400: '#8480fe',
          500: '#6560fa',
          600: '#5040f0',
          700: '#4535d5',
          800: '#392cac',
          900: '#312a87',
          950: '#1e1858',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', 'Inter',
          'Segoe UI', 'system-ui', 'sans-serif',
        ],
        mono: ['SF Mono', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'card':      '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'card-md':   '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        'card-lg':   '0 8px 24px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.05)',
        'modal':     '0 20px 60px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.08)',
        'btn':       '0 1px 2px rgba(0,0,0,0.08)',
        // legacy
        'vault-sm':  '0 0 10px rgba(0,122,255,0.25)',
        'vault-md':  '0 0 20px rgba(0,122,255,0.35)',
        'glass':     '0 8px 32px rgba(0,0,0,0.15)',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
        'vault-gradient':  'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
      },
      borderRadius: {
        'xl2': '14px',
        'xl3': '18px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'fade-in': 'fadeIn 0.25s ease-out',
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
      },
      keyframes: {
        slideInRight: {
          from: { transform: 'translateX(20px)', opacity: '0' },
          to:   { transform: 'translateX(0)',    opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        skeleton: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
      },
    },
  },
  plugins: [],
}
