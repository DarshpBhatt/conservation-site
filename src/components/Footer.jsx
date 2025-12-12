/**
 * ================================================================================
 * File: Footer.jsx
 * Author: ADM (Abhishek Darsh Manar) 2025 Fall - Software Engineering (CSCI-3428-1)
 * Description: Site footer component displaying navigation links, contact information,
 * and social media links with responsive grid layout.
 * ================================================================================
 */

import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

/**
 * Footer Component - Site footer with links and contact information
 * @returns {JSX.Element}
 */
export default function Footer() {
  return (
    <footer className="rounded-3xl border border-white/40 bg-white/60 p-6 text-xs text-slate-500 shadow-lg shadow-slate-900/10 backdrop-blur-2xl dark:border-slate-700/60 dark:bg-slate-900/55 dark:text-slate-300">
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="space-y-2">
          <p className="font-semibold text-slate-700 dark:text-slate-200">Plan your visit</p>
          <ul className="space-y-1">
            <li>
              <Link to="/sitemap" className="hover:underline text-slate-500 dark:text-slate-300">
                Maps
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:underline text-slate-500 dark:text-slate-300">
                About
              </Link>
            </li>
            <li>
              <Link to="/ecology" className="hover:underline text-slate-500 dark:text-slate-300">
                Ecology
              </Link>
            </li>
            <li>
              <Link to="/gallery" className="hover:underline text-slate-500 dark:text-slate-300">
                Gallery
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:underline text-slate-500 dark:text-slate-300">
                Contact Us
              </Link>
            </li>
            <li>
              <Link to="#natural-burial" className="hover:underline text-slate-500 dark:text-slate-300">
                Natural Burial
              </Link>
            </li>
            <li>
              <Link to="#shop" className="hover:underline text-slate-500 dark:text-slate-300">
                Shop
              </Link>
            </li>
          </ul>
          <p className="text-slate-500 dark:text-slate-400">71 St Pauls Ln, French Village, NS B3Z 2Y1</p>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-slate-700 dark:text-slate-200">Explore more</p>
          <p className="text-slate-500 dark:text-slate-300">
            Discover the trail, read about our restoration projects, and share your experience so others can enjoy the forest too.
          </p>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-slate-700 dark:text-slate-200">Connect</p>
          <div className="flex gap-4 text-slate-500 dark:text-slate-300">
            {[{ icon: <FaFacebook />, href: "https://facebook.com" }, { icon: <FaInstagram />, href: "https://instagram.com" }, { icon: <FaXTwitter />, href: "https://twitter.com" }].map(({ icon, href }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/50 bg-white/70 text-emerald-600 shadow-inner shadow-slate-900/5 transition hover:bg-white dark:border-slate-600/60 dark:bg-slate-900/60 dark:text-emerald-200"
              >
                {icon}
              </a>
            ))}
          </div>
          <p className="text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} Woodland Conservation Area. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
