/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html", // For HTML content
    "./src/**/*.{js,ts,jsx,tsx}", // For JS/TS and JSX/TSX files
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1a202c", // Example custom color
        secondary: "#2b6cb0", // Example custom color
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Arial', 'sans-serif'],
        serif: ['"Georgia"', 'serif'],
      },
      spacing: {
        '72': '18rem', // Example custom spacing
        '84': '21rem',
      },
      screens: {
        'xs': '480px', // Adding a custom breakpoint (for small devices)
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // For better form styling
    require('@tailwindcss/typography' ), // For improved typography
  ],
  // Purge unused CSS in production for optimization
  purge: {
    enabled: process.env.NODE_ENV === 'production',
  },
}
