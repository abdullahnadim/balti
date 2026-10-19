import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class', // 👈 Added this line to enable manual theme toggling
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        balti: {
          bg: '#FCFCFC', 
          surface: '#FFFFFF',
          border: '#EAEAEA',
          text: {
            primary: '#111111', 
            secondary: '#666666',
            tertiary: '#999999',
          },
          accent: 'var(--list-accent, #111111)', 
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'serif'], 
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.02)',
        'float': '0 12px 30px rgba(0, 0, 0, 0.04), 0 4px 10px rgba(0, 0, 0, 0.02)',
      }
    },
  },
  plugins: [],
}
export default config