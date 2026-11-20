/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,html}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      colors: {
        app: '#080D14',
        sidebar: '#0B121B',
        panel: '#101A26',
        elevated: '#152231',
        hover: '#19283A',
        subtle: '#223244',
        borderStrong: '#33485E',
        primary: '#E6EDF3',
        secondary: '#94A3B8',
        muted: '#62748C',
        accent: {
          cyan: '#55C8E8',
          amber: '#F2B45B',
          green: '#36C98F',
          red: '#F06B70'
        }
      }
    }
  },
  plugins: []
};
