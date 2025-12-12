/**
 * ================================================================================
 * File: Homepage.jsx
 * Author: ADM (Abhishek Darsh Manar) 2025 Fall - Software Engineering (CSCI-3428-1)
 * Description: Landing page component displaying hero section, core features,
 * and trail information with integrated Azure text-to-speech functionality.
 * ================================================================================
 */

import React, { useState, useEffect, useRef } from "react";
import bannerImage from "../assets/homepage-banner.jpg";
import { Link } from "react-router-dom";
import { FaTree, FaCamera, FaMapMarkedAlt } from "react-icons/fa";
import { BsArrowRightCircle, BsArrowUpRight } from "react-icons/bs";
import { IoClose, IoWarningOutline } from "react-icons/io5";
import Footer from "./Footer";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

// ============================================================================
// Constants & Configuration
// ============================================================================

// Reusable glass morphism styling for consistent panel appearance
const glassPanel =
  "rounded-[28px] border border-white/40 bg-white/40 p-6 shadow-lg shadow-slate-900/10 backdrop-blur-2xl backdrop-saturate-150 transition-colors duration-300 dark:border-slate-500/40 dark:bg-slate-900/40 dark:shadow-black/25";

// Core feature tiles displayed on homepage
const coreTiles = [
  {
    icon: <FaTree className="text-emerald-500 text-3xl" />,
    title: "Explore the Conservation Area",
    body: "Follow the signed one kilometre trail out to wells, resting clearings, and the woodland labyrinth, then wander back through shifting light.",
    cta: "Trail Map",
    to: "/sitemap",
  },
  {
    icon: <FaCamera className="text-amber-500 text-3xl" />,
    title: "Share & Explore Photos",
    body: "Browse community photos and add your own snapshots to show how the woods change through the year.",
    cta: "Gallery",
    to: "/gallery",
  },
  {
    icon: <FaTree className="text-sky-500 text-3xl" />,
    title: "Conservation Education",
    body: "Meet the plants and wildlife that call this forest home and learn how we protect their habitat.",
    cta: "Learn",
    to: "/ecology",
  },
];

// ============================================================================
// Homepage Component
// ============================================================================

/**
 * Homepage Component - Main landing page with hero section and feature tiles
 * @returns {JSX.Element}
 */
const Homepage = () => {
  // ============================================================================
  // State Management
  // ============================================================================
  
  // Track text-to-speech playback state
  const [isSpeaking, setIsSpeaking] = useState(false);
  // Store alert message for API key configuration errors
  const [alertMessage, setAlertMessage] = useState(null);
  // Refs to maintain Azure Speech SDK instances across renders
  const synthesizerRef = useRef(null);
  const playerRef = useRef(null);

  // ============================================================================
  // Azure Text-to-Speech Initialization
  // ============================================================================
  
  /**
   * Initialize Azure Speech SDK on component mount
   * Only initializes if API keys are present in environment variables
   * Empty dependency array ensures this runs once on mount
   */
  useEffect(() => {
    try {
      const speechKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
      const speechRegion = import.meta.env.VITE_AZURE_REGION;

      // Silently fail if keys are missing - error will show when user clicks play
      if (!speechKey || !speechRegion) {
        return;
      }

      const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
        speechKey,
        speechRegion
      );
      speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";

      const player = new SpeechSDK.SpeakerAudioDestination();
      const audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(player);

      const synthesizer = new SpeechSDK.SpeechSynthesizer(
        speechConfig,
        audioConfig
      );

      synthesizerRef.current = synthesizer;
      playerRef.current = player;
    } catch (error) {
      console.error("Failed to initialize Azure Speech:", error);
    }

    // Cleanup: Close synthesizer to prevent memory leaks on unmount
    return () => {
      if (synthesizerRef.current) {
        synthesizerRef.current.close();
      }
      synthesizerRef.current = null;
      playerRef.current = null;
    };
  }, []); // Empty array: initialize once on mount

  // ============================================================================
  // Event Handlers
  // ============================================================================
  
  /**
   * Play hero section audio narration using Azure Speech SDK
   * Displays alert if API keys are missing or initialization failed
   */
  const playHeroAudio = () => {
    try {
      const speechKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
      const speechRegion = import.meta.env.VITE_AZURE_REGION;

      // ============================================================================
      // TODO: REMOVE THIS SECTION ONCE API KEYS ARE CONFIGURED
      // This alert check can be removed after VITE_AZURE_SPEECH_KEY and VITE_AZURE_REGION
      // are properly set in environment variables (Netlify/Azure dashboard or .env file)
      // ============================================================================
      // Check for API keys before attempting playback
      if (!speechKey || !speechRegion) {
        setAlertMessage("Azure Speech API keys are missing. Please update VITE_AZURE_SPEECH_KEY and VITE_AZURE_REGION in your environment variables (Netlify/Azure dashboard) or .env file for local development.");
        // Auto-dismiss alert after 8 seconds to give user time to read
        setTimeout(() => setAlertMessage(null), 8000);
        return;
      }
      // ============================================================================
      // END OF SECTION TO REMOVE ONCE API KEYS ARE CONFIGURED
      // ============================================================================

      const synthesizer = synthesizerRef.current;
      const player = playerRef.current;
      // Verify synthesizer was initialized successfully
      if (!synthesizer) {
        setAlertMessage("Text-to-speech is not initialized. Please configure Azure API keys and refresh the page.");
        setTimeout(() => setAlertMessage(null), 8000);
        return;
      }

      const text =
        "Saint Margaret's Bay Area Woodland. " +
        "A community forest that keeps local history and coastal birch standing strong. " +
        "Welcome to the French Village Conservation Woodland at seventy one Saint Pauls Lane—twenty-seven acres of protected forest and wetlands. " +
        "Walk the one-way trail to eight simple stops, from the exercise bar to the labyrinth. " +
        "Discover community stories along the way, and return the same route as the forest soundtrack changes around you.";

      // Resume player if it was previously paused
      if (player) {
        player.resume();
      }

      setIsSpeaking(true);
      // Async speech synthesis with success and error callbacks
      synthesizer.speakTextAsync(
        text,
        () => {
          setIsSpeaking(false);
        },
        (err) => {
          console.error("Speech error:", err);
          setAlertMessage("Failed to play audio. Please update your Azure Speech API keys (VITE_AZURE_SPEECH_KEY and VITE_AZURE_REGION) in environment variables.");
          setTimeout(() => setAlertMessage(null), 8000);
          setIsSpeaking(false);
        }
      );
    } catch (error) {
      console.error("Error playing audio:", error);
      setAlertMessage("An error occurred while trying to play audio. Please update your Azure Speech API keys.");
      setTimeout(() => setAlertMessage(null), 8000);
    }
  };

  /**
   * Stop audio playback immediately by pausing player
   * Player pause provides instant stop vs waiting for synthesizer to finish
   */
  const stopHeroAudio = () => {
    const player = playerRef.current;

    if (player) {
      player.pause(); // immediate stop of local audio
    }

    setIsSpeaking(false);
  };

  // ============================================================================
  // Render
  // ============================================================================
  
  return (
    <div className="flex flex-col gap-8 text-slate-800 dark:text-slate-100">
      <header className={`${glassPanel} flex flex-col gap-5 md:flex-row md:items-center md:justify-between`}>
        <div className="flex-1 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
            St. Margaret&apos;s Bay Area Woodland
          </p>
          <h1 className="text-2xl font-semibold md:text-3xl">
            A community forest that keeps local history and coastal birch standing strong.
          </h1>
          <p className="max-w-xl text-sm text-slate-600 dark:text-slate-300">
            Welcome to the French Village Conservation Woodland at 71 St. Pauls Lane—27 acres of protected forest and wetlands.
            Walk the one-way trail to eight simple stops, from the exercise bar to the labyrinth, discover community stories along
            the way, and return the same route as the forest soundtrack changes around you.
          </p>

          {/* Audio controls with inline error alerts */}
          <div className="space-y-2 pt-1">
            {/* Display alert when API keys are missing or errors occur */}
            {alertMessage && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-400/50 bg-amber-50/90 p-3 text-xs text-amber-800 dark:border-amber-500/50 dark:bg-amber-900/90 dark:text-amber-200">
                <IoWarningOutline className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">Azure API Keys Required</p>
                  <p className="mt-1">{alertMessage}</p>
                  <p className="mt-2 text-xs">
                    Configure in Netlify/Azure environment variables or create a <code className="rounded bg-amber-200/50 px-1 dark:bg-amber-800/50">.env</code> file for local development.
                  </p>
                </div>
                <button
                  onClick={() => setAlertMessage(null)}
                  className="flex-shrink-0 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
                  aria-label="Dismiss"
                >
                  <IoClose className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={playHeroAudio}
                className="inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold bg-emerald-600 text-white shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                Play Audio
              </button>

              <button
                type="button"
                onClick={stopHeroAudio}
                className="inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold bg-red-600 text-white shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                Stop Audio
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-3">
            <Link
              to="/sitemap"
              className="flex items-center gap-2 rounded-full border border-white/40 bg-white/40 px-5 py-2 text-xs font-semibold text-slate-700 shadow-md shadow-slate-900/10 transition hover:bg-white/60 dark:border-slate-500/40 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-900/55"
            >
              Trail Map
              <FaMapMarkedAlt />
            </Link>
            <Link
              to="/about"
              className="flex items-center gap-2 rounded-full border border-white/40 bg-white/40 px-5 py-2 text-xs font-semibold text-slate-700 shadow-md shadow-slate-900/10 transition hover:bg-white/60 dark:border-slate-500/40 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-900/55"
            >
              About
              <BsArrowUpRight />
            </Link>
            <Link
              to="/ecology"
              className="flex items-center gap-2 rounded-full border border-white/40 bg-white/40 px-5 py-2 text-xs font-semibold text-slate-700 shadow-md shadow-slate-900/10 transition hover:bg-white/60 dark:border-slate-500/40 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-900/55"
            >
              Ecology
              <BsArrowUpRight />
            </Link>
            <Link
              to="/contact"
              className="flex items-center gap-2 rounded-full border border-white/40 bg-white/40 px-5 py-2 text-xs font-semibold text-slate-700 shadow-md shadow-slate-900/10 transition hover:bg-white/60 dark:border-slate-500/40 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-900/55"
            >
              Contact
              <BsArrowUpRight />
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4 md:flex-col">
          <figure className="mt-4 w-full overflow-hidden rounded-2xl border border-white/40 shadow-inner shadow-slate-900/10 dark:border-slate-700/60 md:mt-0 md:w-60 lg:w-72">
            <img src={bannerImage} alt="Trail canopy" className="h-full w-full object-cover" />
          </figure>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {coreTiles.map(({ icon, title, body, cta, to }) => (
          <article key={title} className={`${glassPanel} flex flex-col gap-4`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/40 bg-white/40 shadow-inner shadow-slate-900/10 dark:border-slate-500/40 dark:bg-slate-900/40">
              {icon}
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">{body}</p>
            </div>
            <Link
              to={to}
              className="mt-auto inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:underline dark:text-slate-200"
            >
              {cta}
              <BsArrowRightCircle />
            </Link>
          </article>
        ))}
      </section>

      <section className={`${glassPanel} grid gap-4 md:grid-cols-4`}>
        {[
          { value: "1 km", label: "Gentle out-and-back trail with eight simple landmarks and easy grades." },
          { value: "8 stops", label: "Exercise bar, wells, resting clearings, listening telephone, and the labyrinth." },
          { value: "Coastal birch", label: "Yellow birch stands and mixed forest cared for through invasive removal." },
          { value: "Volunteer-led", label: "Neighbours and partners look after the path, signage, and stewardship events." },
        ].map(({ value, label }) => (
          <div
            key={value}
            className="rounded-2xl border border-white/40 bg-white/40 p-4 text-center shadow-inner shadow-slate-900/5 backdrop-blur-2xl dark:border-slate-500/40 dark:bg-slate-900/40"
          >
            <p className="text-xl font-semibold text-emerald-600 dark:text-emerald-300">{value}</p>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{label}</p>
          </div>
        ))}
      </section>

      <Footer />
    </div>
  );
};

export default Homepage;
