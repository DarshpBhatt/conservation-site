/**
 * ================================================================================
 * File: App.jsx
 * Author: ADM (Abhishek Darsh Manar) 2025 Fall - Software Engineering (CSCI-3428-1)
 * Description: Main application component that handles routing, dark mode state,
 * and renders all page components with consistent glass morphism styling.
 * ================================================================================
 */

import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Homepage from "./components/Homepage";
import About from "./components/About";
import SiteMap from "./components/Sitemap";
import Contact from "./components/Contact";
import Gallery from "./components/gallery";
import Ecology from "./components/Ecology";
import NaturalBurial from "./components/NaturalBurial";
import Shop from "./components/Shop";
import lightModeBackdrop from "./assets/globalimages/lightmode.jpg";
import darkModeBackdrop from "./assets/globalimages/darkmode.jpg";

// ============================================================================
// Layout Components
// ============================================================================

/**
 * GlassPage - Wrapper component providing glass morphism styling for content pages
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to wrap in glass panel
 * @returns {JSX.Element}
 */
const GlassPage = ({ children }) => (
  <section className="mx-auto w-full max-w-7xl rounded-[32px] border border-white/40 bg-white/40 p-8 shadow-lg shadow-slate-900/10 backdrop-blur-2xl backdrop-saturate-150 transition duration-500 dark:border-slate-500/40 dark:bg-slate-900/40 dark:shadow-black/30">
    {children}
  </section>
);

/**
 * FullBleedGlass - Glass morphism wrapper without padding for full-width content
 * Used for map page to allow edge-to-edge map display
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to wrap
 * @returns {JSX.Element}
 */
const FullBleedGlass = ({ children }) => (
  <section className="mx-auto w-full max-w-7xl overflow-hidden rounded-[32px] border border-white/40 bg-white/40 shadow-lg shadow-slate-900/10 backdrop-blur-2xl backdrop-saturate-150 transition duration-500 dark:border-slate-500/40 dark:bg-slate-900/40 dark:shadow-black/30">
    {children}
  </section>
);

// ============================================================================
// Main App Component
// ============================================================================

/**
 * App Component - Root component managing routing and global state
 * @returns {JSX.Element}
 */
function App() {
  // ============================================================================
  // State Management
  // ============================================================================
  
  // Track dark mode state for theme switching
  const [dark, setDark] = useState(false);

  // ============================================================================
  // Event Handlers
  // ============================================================================
  
  /**
   * Toggle dark mode and update body class for Tailwind dark mode
   * Body class is required for Tailwind's dark: variant to work globally
   */
  const darkModeHandler = () => {
    setDark(!dark);
    document.body.classList.toggle("dark");
  };

  // Select background image based on current theme
  const backgroundImage = dark ? darkModeBackdrop : lightModeBackdrop;

  // ============================================================================
  // Render
  // ============================================================================
  
  return (
    <Router>
      <div
        className="relative min-h-screen overflow-hidden text-slate-800 transition-colors duration-500 dark:text-slate-100"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed", // Fixed attachment creates parallax effect
        }}
      >
        {/* Decorative gradient overlays for depth and visual interest */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-200/10 via-sky-100/6 to-amber-100/8 mix-blend-soft-light transition-opacity duration-500 dark:from-slate-950/35 dark:via-slate-900/3 dark:to-slate-800/35"></div>
        <div className="pointer-events-none absolute inset-0 bg-white/6 backdrop-blur-[3px] sm:backdrop-blur-[6px] transition-all duration-500 dark:bg-slate-950/18"></div>
        {/* Animated gradient orbs for ambient lighting effect */}
        <div className="pointer-events-none absolute -left-[20%] top-[-25%] h-[65vw] w-[65vw] rounded-full bg-emerald-300/25 blur-[160px] dark:bg-emerald-400/20"></div>
        <div className="pointer-events-none absolute bottom-[-30%] right-[-18%] h-[58vw] w-[58vw] rounded-full bg-sky-300/20 blur-[150px] dark:bg-sky-500/15"></div>
        {/* Radial gradient highlights for additional depth */}
        <div
          className="pointer-events-none absolute inset-0 opacity-8 mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25) 0, rgba(255,255,255,0) 55%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.18) 0, rgba(255,255,255,0) 45%), radial-gradient(circle at 65% 80%, rgba(255,255,255,0.14) 0, rgba(255,255,255,0) 50%)",
          }}
        ></div>

          <div className="relative z-10 flex min-h-screen flex-col">
            <Navigation toggleDarkMode={darkModeHandler} dark={dark} />
            {/* Spacer div to account for fixed navigation height */}
            {/* Uses CSS custom property set by Navigation component */}
            <div
              aria-hidden="true"
              className="shrink-0"
              style={{
                height: "calc(var(--nav-height, 5rem) + 1rem)",
              }}
            />
            <main className="flex flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-12">
              <Routes>
                {/* Map page uses FullBleedGlass to allow edge-to-edge map display */}
                <Route path="/" element={<GlassPage><Homepage dark={dark} /></GlassPage>} />
                <Route path="/about" element={<GlassPage><About /></GlassPage>} />
                <Route path="/gallery" element={<GlassPage><Gallery /></GlassPage>} />
                <Route path="/ecology" element={<GlassPage><Ecology /></GlassPage>} />
                <Route path="/contact" element={<GlassPage><Contact /></GlassPage>} />
                <Route path="/sitemap" element={<FullBleedGlass><SiteMap dark={dark} /></FullBleedGlass>} />
                <Route path="/natural-burial" element={<GlassPage><NaturalBurial /></GlassPage>} />
                <Route path="/shop" element={<GlassPage><Shop /></GlassPage>} />
              </Routes>
            </main>
          </div>
      </div>
    </Router>
  );
}

export default App;
