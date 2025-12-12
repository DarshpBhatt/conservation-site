/**
 * ================================================================================
 * File: vite.config.js
 * Author: ADM (Abhishek Darsh Manar) 2025 Fall - Software Engineering (CSCI-3428-1)
 * Description: Vite build configuration with React plugin for fast development
 * and optimized production builds.
 * ================================================================================
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite Configuration
 * @see https://vite.dev/config/
 */
export default defineConfig({
  // React plugin enables JSX transformation and HMR (Hot Module Replacement)
  plugins: [react()],
})
