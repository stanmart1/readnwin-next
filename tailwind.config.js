/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        'inter': ['var(--font-inter)', 'sans-serif'],
        'roboto-mono': ['var(--font-roboto-mono)', 'monospace'],
        'pacifico': ['var(--font-pacifico)', 'cursive'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      height: {
        '15': '3.75rem',
        '17': '4.25rem',
        '30': '7.5rem',
        '35': '8.75rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
  safelist: [
    // Ensure responsive classes are included
    'xs:text-sm',
    'xs:text-base',
    'xs:px-3',
    'xs:py-2',
    'xs:gap-3',
    'xs:mb-4',
    'xs:mt-4',
    'xs:w-auto',
    'xs:flex-row',
    'xs:grid-cols-2',
    'xs:space-y-4',
    'break-words',
    'leading-tight',
    'leading-relaxed',
  ],
}

