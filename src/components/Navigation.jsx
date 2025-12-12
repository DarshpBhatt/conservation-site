/**
 * ================================================================================
 * File: Navigation.jsx
 * Author: ADM (Abhishek Darsh Manar) 2025 Fall - Software Engineering (CSCI-3428-1)
 * Description: Responsive navigation component with mobile menu, dark mode toggle,
 * and CSS custom property management for layout spacing.
 * ================================================================================
 */

import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { IoMoon, IoSunny } from "react-icons/io5";
import WeatherWidget from "./WeatherWidget";

// ============================================================================
// Navigation Component
// ============================================================================

/**
 * Navigation Component - Responsive navigation bar with mobile menu
 * @param {Object} props
 * @param {Function} props.toggleDarkMode - Handler to toggle dark mode
 * @param {boolean} props.dark - Current dark mode state
 * @returns {JSX.Element}
 */
const Navigation = ({ toggleDarkMode, dark }) => {
  // ============================================================================
  // State Management
  // ============================================================================
  
  // Track mobile menu open/closed state
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef(null);

  // ============================================================================
  // Side Effects
  // ============================================================================
  
  /**
   * Prevent body scroll when mobile menu is open
   * Prevents background scrolling while menu overlay is active
   * Dependency on isOpen ensures scroll lock updates when menu state changes
   */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]); // Re-run when menu open state changes

  /**
   * Update CSS custom properties for navigation height
   * Allows other components to calculate spacing based on nav height
   * Updates on resize and menu state changes to handle dynamic sizing
   */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateNavMetrics = () => {
      if (!navRef.current) return;
      const root = document.documentElement;
      const { offsetHeight } = navRef.current;
      const computedStyles = window.getComputedStyle(navRef.current);

      root.style.setProperty("--nav-height", `${offsetHeight}px`);
      root.style.setProperty("--nav-spacing", computedStyles.top || "16px");
    };

    updateNavMetrics();
    window.addEventListener("resize", updateNavMetrics);

    return () => {
      window.removeEventListener("resize", updateNavMetrics);
    };
  }, [isOpen]); // Re-calculate when menu state or window size changes

  // ============================================================================
  // Event Handlers
  // ============================================================================
  
  /**
   * Toggle mobile navigation menu open/closed state
   */
  const toggleNav = () => {
    setIsOpen(!isOpen);
  };

  // ============================================================================
  // Render
  // ============================================================================
  
  // Reusable link styling for consistent navigation appearance
  const linkBase =
    "py-2 px-4 rounded-xl transition-colors duration-300 text-sm lg:text-base font-semibold text-slate-800 dark:text-slate-100 hover:bg-white/40 hover:text-emerald-700 dark:hover:text-emerald-300";

  return (
    <>
      <nav
        ref={navRef}
        className="fixed left-0 right-0 top-4 z-50 flex justify-center px-4 sm:px-6 lg:px-12"
      >
        <div className="mx-auto w-full max-w-7xl rounded-2xl border border-white/40 bg-white/65 px-3 py-3 shadow-xl shadow-slate-900/15 backdrop-blur-2xl transition-colors duration-500 dark:border-slate-700/50 dark:bg-slate-900/70 sm:px-4 sm:py-4 lg:px-6">
          <div className="flex min-h-[3.5rem] flex-wrap items-center justify-between gap-3 sm:min-h-[4.5rem]">
            <div className="order-1 flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <img
                  src={logo}
                  alt="Woodland Conservation Logo"
                  className="h-10 w-10 rounded-xl border border-white/40 p-1 shadow-inner shadow-slate-900/10 sm:h-14 sm:w-14"
                />
                <span className="hidden truncate text-base font-semibold text-slate-800 dark:text-slate-100 sm:block sm:text-lg">
                  Woodland Conservation
                </span>
              </div>
              <div className="flex min-w-0 items-center text-xs sm:text-sm">
                <WeatherWidget />
              </div>
            </div>

            <div className="order-3 hidden w-full items-center justify-center gap-1 md:order-2 md:flex md:flex-1 md:w-auto md:gap-2">
              <Link to="/" className={linkBase}>
                Home
              </Link>
              <Link to="/about" className={linkBase}>
                About
              </Link>
              <Link to="/sitemap" className={linkBase}>
                Map
              </Link>
              <Link to="/gallery" className={linkBase}>
                Gallery
              </Link>
              <Link to="/ecology" className={linkBase}>
                Ecology
              </Link>
              <Link to="/natural-burial" className={linkBase}>
                Natural Burial
              </Link>
              <Link to="/shop" className={linkBase}>
                Shop
              </Link>
              <Link to="/contact" className={linkBase}>
                Contact
              </Link>
            </div>

            <div className="order-2 flex items-center gap-2 sm:gap-3 md:order-3">
              <button
                onClick={toggleDarkMode}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/70 text-xl text-amber-500 shadow-md shadow-slate-900/10 backdrop-blur-xl transition hover:bg-white/90 dark:border-slate-600/60 dark:bg-slate-800/70 sm:h-12 sm:w-12 sm:text-2xl"
                aria-label="Toggle dark mode"
              >
                {dark ? <IoSunny /> : <IoMoon />}
              </button>
              <button
                onClick={toggleNav}
                className="block rounded-full border border-white/50 bg-white/70 p-2 text-slate-800 shadow-md shadow-slate-900/10 backdrop-blur-xl transition hover:bg-white/90 dark:border-slate-600/60 dark:bg-slate-800/70 dark:text-slate-100 md:hidden"
                aria-label="Toggle navigation menu"
              >
                <svg
                  className="h-5 w-5 sm:h-6 sm:w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay - only visible on mobile devices */}
      {isOpen && (
        <>
          {/* Backdrop overlay - clicking closes menu */}
          <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-md md:hidden" onClick={toggleNav} />
          <div className="fixed top-4 right-4 z-50 w-[86vw] max-w-sm rounded-3xl border border-white/40 bg-white/70 p-6 shadow-2xl shadow-slate-900/30 backdrop-blur-3xl transition-colors duration-300 dark:border-slate-700/60 dark:bg-slate-900/70 md:hidden">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-lg font-semibold text-slate-800 dark:text-slate-100">Navigate</span>
              <button
                onClick={toggleNav}
                className="rounded-full border border-white/50 bg-white/80 p-2 text-slate-700 hover:bg-white dark:border-slate-600/60 dark:bg-slate-800/80 dark:text-slate-100"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col space-y-2 text-base">
              {["/", "/about", "/sitemap", "/gallery", "/ecology", "/natural-burial", "/shop", "/contact"].map(
                (href, idx) => {
                  const labels = ["Home", "About", "Map", "Gallery", "Ecology", "Natural Burial", "Shop", "Contact"];
                  const classes =
                    "block rounded-xl border border-white/30 bg-white/40 px-4 py-3 text-slate-800 shadow-inner shadow-slate-900/5 transition hover:bg-white/70 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-100 dark:hover:bg-slate-800/80";

                  if (href.startsWith("#")) {
                    return (
                      <a key={href} href={href} onClick={toggleNav} className={classes}>
                        {labels[idx]}
                      </a>
                    );
                  }

                  return (
                    <Link key={href} to={href} onClick={toggleNav} className={classes}>
                      {labels[idx]}
                    </Link>
                  );
                }
              )}
            </nav>
          </div>
        </>
      )}
    </>
  );
};

export default Navigation;
