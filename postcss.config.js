/**
 * ================================================================================
 * File: postcss.config.js
 * Author: ADM (Abhishek Darsh Manar) 2025 Fall - Software Engineering (CSCI-3428-1)
 * Description: PostCSS configuration for processing Tailwind CSS and autoprefixing
 * CSS for cross-browser compatibility.
 * ================================================================================
 */

module.exports = {
  plugins: {
    // Process Tailwind directives (@apply, @tailwind, etc.)
    tailwindcss: {},
    // Add vendor prefixes for browser compatibility
    autoprefixer: {},
  },
};
