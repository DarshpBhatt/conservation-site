// Purpose: Navigation component that provides responsive navigation bar for desktop and mobile devices

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png'; // Importing the logo image
import { IoMoon, IoSunny } from 'react-icons/io5'; // Importing icons for the dark mode toggle

// Navigation component definition
const Navigation = ({ toggleDarkMode, dark }) => {
  const [isOpen, setIsOpen] = useState(false); // State to manage the navigation menu

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Function to toggle navigation menu
  const toggleNav = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      {/* Main navigation bar */}
      <div className={`flex items-center justify-between transition-colors duration-300 ${dark ? 'bg-darkerBlue' : 'bg-darkBrown'} text-white h-16 p-4`}>
        <div className="flex items-center">
          {/* Logo section */}
          <img src={logo} alt="Logo" className="h-16 w-16 mr-2" />
        </div>
        {/* Navigation links for desktop view */}
        <div className="hidden md:flex items-center justify-center flex-1 space-x-4 text-xl">
          <Link to="/" className="py-2 px-4 transition-colors duration-500 ease-in-out hover:bg-yellow-400 rounded-lg">Homepage</Link>
          <Link to="/about" className="py-2 px-4 transition-colors duration-500 ease-in-out hover:bg-yellow-400 rounded-lg">About</Link>
          <Link to="/sitemap" className="py-2 px-4 transition-colors duration-500 ease-in-out hover:bg-yellow-400 rounded-lg">Site Map</Link>
          <Link to="/gallery" className="py-2 px-4 transition-colors duration-500 ease-in-out hover:bg-yellow-400 rounded-lg">Gallery</Link>
          <Link to="/ecology" className="py-2 px-4 transition-colors duration-500 ease-in-out hover:bg-yellow-400 rounded-lg">Ecology</Link>
          <Link to="#natural-burial" className="py-2 px-4 transition-colors duration-500 ease-in-out hover:bg-yellow-400 rounded-lg">Natural Burial</Link>
          <Link to="#ecommerce" className="py-2 px-4 transition-colors duration-500 ease-in-out hover:bg-yellow-400 rounded-lg">eCommerce</Link>
          <Link to="/contact" className="py-2 px-4 transition-colors duration-500 ease-in-out hover:bg-yellow-400 rounded-lg">Contact</Link> {/* Link to Contact page */}
        </div>
        {/* Dark mode toggle button for desktop view */}
        <div className="hidden md:flex items-center ml-4">
          <button onClick={toggleDarkMode} className="flex items-center justify-center w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full text-2xl focus:outline-none">
            {dark ? <IoSunny className="text-yellow-500" /> : <IoMoon className="text-yellow-500" />}
          </button>
        </div>
        {/* Mobile menu toggle button */}
        <div className="flex items-center md:hidden">
          <button onClick={toggleDarkMode} className="flex items-center justify-center w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full text-2xl focus:outline-none mr-4">
            {dark ? <IoSunny className="text-yellow-500" /> : <IoMoon className="text-yellow-500" />}
          </button>
          <button onClick={toggleNav} className="text-white focus:outline-none z-20">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
            </svg>
          </button>
        </div>
      </div>
      {/* Mobile navigation menu */}
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={toggleNav}
          />
          {/* Mobile menu panel */}
          <div className={`md:hidden fixed top-0 right-0 transition-colors duration-300 ${dark ? 'bg-darkerBlue' : 'bg-darkBrown'} text-white w-80 max-w-[85vw] h-screen p-4 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl overflow-hidden`}>
            {/* Close button */}
            <div className="flex justify-end mb-6">
              <button onClick={toggleNav} className="text-white focus:outline-none">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            {/* Navigation links */}
            <nav className="flex flex-col space-y-2 text-lg overflow-y-auto">
              <Link to="/" className="py-3 px-4 transition-colors duration-500 ease-in-out hover:bg-yellow-400 rounded-lg" onClick={toggleNav}>Homepage</Link>
              <Link to="/about" className="py-3 px-4 transition-colors duration-500 ease-in-out hover:bg-yellow-400 rounded-lg" onClick={toggleNav}>About</Link>
              <Link to="/sitemap" className="py-3 px-4 transition-colors duration-500 ease-in-out hover:bg-yellow-400 rounded-lg" onClick={toggleNav}>Site Map</Link>
              <Link to="/gallery" className="py-3 px-4 transition-colors duration-500 ease-in-out hover:bg-yellow-400 rounded-lg" onClick={toggleNav}>Gallery</Link>
              <Link to="/ecology" className="py-3 px-4 transition-colors duration-500 ease-in-out hover:bg-yellow-400 rounded-lg" onClick={toggleNav}>Ecology</Link>
              <Link to="#natural-burial" className="py-3 px-4 transition-colors duration-500 ease-in-out hover:bg-yellow-400 rounded-lg" onClick={toggleNav}>Natural Burial</Link>
              <Link to="#ecommerce" className="py-3 px-4 transition-colors duration-500 ease-in-out hover:bg-yellow-400 rounded-lg" onClick={toggleNav}>eCommerce</Link>
              <Link to="/contact" className="py-3 px-4 transition-colors duration-500 ease-in-out hover:bg-yellow-400 rounded-lg" onClick={toggleNav}>Contact</Link>
            </nav>
          </div>
        </>
      )}
    </div>
  );
};

export default Navigation;
