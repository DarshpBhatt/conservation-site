/**
 * ================================================================================
 * File: tailwind.config.js
 * Author: ADM (Abhishek Darsh Manar) 2025 Fall - Software Engineering (CSCI-3428-1)
 * Description: Tailwind CSS configuration with custom breakpoints, colors,
 * and dark mode class-based styling for the conservation website.
 * ================================================================================
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Scan these paths for Tailwind class usage (tree-shaking unused styles)
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    // Custom breakpoints matching design system
    screens: {
      sm: '640px',
      md: '720px', // Custom breakpoint for navigation layout
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      // Custom color palette for conservation theme
      colors: {
        darkBlue: '#001f3f',
        darkerBlue: '#00122a',
        darkBrown: '#4B2E16',
      },
    },
  },
  variants: {
    extend: {
      // Enable dark mode variants for background colors
      backgroundColor: ['dark'],
    },
  },
  plugins: [],
  // Use class-based dark mode (toggle via body class)
  darkMode: 'class',
};
