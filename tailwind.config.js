/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}','./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['var(--font-playfair)', 'serif'],
        jakarta:  ['var(--font-jakarta)',  'sans-serif'],
      },
      colors: {
        brand: { DEFAULT:'#E8540A', dark:'#C94508', light:'#FFF3ED' },
      },
    },
  },
  plugins: [
    // @tailwindcss/typography would go here if installed
    // For now prose styles are handled in globals.css
  ],
}
