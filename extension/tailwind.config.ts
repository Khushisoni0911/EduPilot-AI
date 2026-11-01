
import type { Config } from 'tailwindcss';

/**
 * Tailwind CSS Configuration
 *
 * Configured specifically for a Chrome Extension popup.
 * Extension popups have size constraints (max ~800px wide)
 * so we set up a design system appropriate for that.
 */
const config: Config = {
  darkMode: 'class',
  // Tell Tailwind where to look for class usage
  // (so it can tree-shake unused classes in production)
  content: ['./popup.html', './src/**/*.{js,ts,jsx,tsx}'],

  theme: {
    extend: {
      // Custom color palette for the AI Student Assistant brand
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',  // Primary brand color
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        // AI accent color — purple for intelligence/AI theme
        ai: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',  // AI accent color
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
      },

      // Custom font sizes for popup UI
      fontSize: {
        'xxs': ['0.625rem', { lineHeight: '0.875rem' }],
      },

      // Animation for AI loading states
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },

      // Popup width constraints
      width: {
        'popup': '400px',
        'popup-lg': '480px',
      },

      // Popup height constraints
      height: {
        'popup': '580px',
        'popup-sm': '400px',
        'popup-lg': '600px',
      },
    },
  },

  plugins: [],
};

export default config;

