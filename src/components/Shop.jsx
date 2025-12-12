/**
 * ================================================================================
 * File: Shop.jsx
 * Author: ADM (Abhishek Darsh Manar) 2025 Fall - Software Engineering (CSCI-3428-1)
 * Description: Shop page displaying seasonal produce and handmade products from
 * the conservation area with Azure text-to-speech for accessibility.
 * ================================================================================
 */

import React, { useState, useRef, useEffect } from "react";
import { FaApple, FaLeaf } from "react-icons/fa";
import { FaJar } from "react-icons/fa6";
import { IoClose, IoWarningOutline } from "react-icons/io5";
import Footer from "./Footer";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import appleTreesImage from "../assets/Shop/Appletrees.jpg";
import pinCherryImage from "../assets/Shop/Pin Cherry.jpg";
import jamsImage from "../assets/Shop/Jams.jpg";
import wildPearTreeImage from "../assets/Shop/wild pear tree.jpg";

// ============================================================================
// Constants & Configuration
// ============================================================================

// Reusable glass morphism styling
const glassPanel =
  "rounded-3xl border border-white/40 bg-white/60 p-6 shadow-lg shadow-slate-900/10 backdrop-blur-2xl transition-colors duration-300 dark:border-slate-700/60 dark:bg-slate-900/55";

// Shop items with seasonal availability information
const shopItems = [
  {
    id: "apple-picking",
    title: "Apple Picking",
    icon: <FaApple className="text-emerald-500 text-3xl" />,
    image: appleTreesImage,
    description:
      "Experience the joy of picking fresh wild apples from our conservation area. Discover the natural flavors of locally grown wild fruit in their natural habitat.",
    price: "$15 per basket",
    season: "Available September - October",
  },
  {
    id: "berry-picking",
    title: "Berry Picking",
    icon: <FaLeaf className="text-emerald-500 text-3xl" />,
    image: pinCherryImage,
    description:
      "Pick your own fresh wild berries from our conservation area. Choose from wild blueberries, raspberries, and other native berries. Perfect for families and nature lovers.",
    price: "$12 per container",
    season: "Available July - August",
  },
  {
    id: "pear-picking",
    title: "Pear Picking",
    icon: <FaApple className="text-emerald-500 text-3xl" />,
    image: wildPearTreeImage,
    description:
      "Experience the delight of picking fresh wild pears from our conservation area. Enjoy the unique flavor of naturally grown wild pears in their natural setting.",
    price: "$15 per basket",
    season: "Available August - September",
  },
  {
    id: "homemade-jam",
    title: "Homemade Jam",
    icon: <FaJar className="text-emerald-500 text-3xl" />,
    image: jamsImage,
    description:
      "Handcrafted jams made from the fruits picked in our conservation area. Made with care using traditional recipes and natural ingredients.",
    price: "$8 per jar",
    season: "Available year-round",
  },
];

// ============================================================================
// Shop Component
// ============================================================================

/**
 * Shop Component - Display seasonal produce and products
 * @returns {JSX.Element}
 */
export default function Shop() {
  // ============================================================================
  // State Management
  // ============================================================================
  
  // Text-to-speech state
  const [isSpeaking, setIsSpeaking] = useState(false);
  // Store alert message for API key configuration errors
  const [alertMessage, setAlertMessage] = useState(null);
  const synthesizerRef = useRef(null);
  const playerRef = useRef(null);

  // ============================================================================
  // Azure Text-to-Speech Initialization
  // ============================================================================
  
  /**
   * Initialize Azure Speech SDK on component mount
   * Only initializes if API keys are present
   */
  useEffect(() => {
    try {
      const speechKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
      const speechRegion = import.meta.env.VITE_AZURE_REGION;

      // Silently fail if keys missing - error shown when user clicks play
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

      return () => {
        if (synthesizerRef.current) synthesizerRef.current.close();
        synthesizerRef.current = null;
        playerRef.current = null;
      };
    } catch (error) {
      // Silently fail on initialization error - error shown when user clicks play
      console.error('Failed to initialize Azure Speech SDK:', error);
    }
  }, []); // Initialize once on mount

  // ============================================================================
  // Event Handlers
  // ============================================================================
  
  /**
   * Play header audio narration with error handling
   */
  const playHeaderAudio = () => {
    try {
      const speechKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
      const speechRegion = import.meta.env.VITE_AZURE_REGION;

      // ============================================================================
      // TODO: REMOVE THIS SECTION ONCE API KEYS ARE CONFIGURED
      // This alert check can be removed after VITE_AZURE_SPEECH_KEY and VITE_AZURE_REGION
      // are properly set in environment variables (Netlify/Azure dashboard or .env file)
      // ============================================================================
      // Check if keys are missing or contain placeholder values
      const hasPlaceholderKeys = !speechKey || !speechRegion || 
        speechKey.toLowerCase().includes('keyhere') || 
        speechKey.toLowerCase().includes('your_azure') ||
        speechRegion.toLowerCase().includes('regionhere') ||
        speechRegion.toLowerCase().includes('your_azure');
      
      if (hasPlaceholderKeys) {
        setAlertMessage("Azure Speech API keys are missing or invalid. Please update VITE_AZURE_SPEECH_KEY and VITE_AZURE_REGION with valid keys in your environment variables (Netlify/Azure dashboard) or .env file for local development.");
        setTimeout(() => setAlertMessage(null), 10000);
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
        "Welcome to the shop. Explore fresh produce and homemade goods from our conservation area. " +
        "Pick your own apples, berries, and pears, or enjoy our handcrafted jams.";

      if (player) player.resume();

      setIsSpeaking(true);

      synthesizer.speakTextAsync(
        text,
        () => setIsSpeaking(false),
        (err) => {
          console.error("Speech error:", err);
          // Show alert immediately when WebSocket/API error occurs
          setAlertMessage("Failed to play audio. Your Azure Speech API keys may be invalid or missing. Please update VITE_AZURE_SPEECH_KEY and VITE_AZURE_REGION with valid keys in your environment variables (Netlify/Azure dashboard) or .env file.");
          setTimeout(() => setAlertMessage(null), 10000);
          setIsSpeaking(false);
        }
      );
    } catch (error) {
      console.error("Error playing audio:", error);
      setAlertMessage("An error occurred while trying to play audio. Please update your Azure Speech API keys.");
      setTimeout(() => setAlertMessage(null), 8000);
    }
  };

  // STOP AUDIO
  const stopHeaderAudio = () => {
    const player = playerRef.current;

    if (player) player.pause();

    setIsSpeaking(false);
  };

  return (
    <div className="flex flex-col gap-8 text-slate-800 dark:text-slate-100">
      {/* HEADER WITH AUDIO */}
      <header
        className={`${glassPanel} flex flex-col gap-5 md:flex-row md:items-center md:justify-between`}
      >
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
          <div>
            <h1 className="text-2xl font-semibold md:text-3xl">Shop</h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              Discover fresh produce and homemade goods from our conservation area.
              Pick your own fruits or enjoy our handcrafted jams made with care.
            </p>

            {/* AUDIO BUTTONS */}
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={playHeaderAudio}
                className="px-4 py-2 rounded-full bg-emerald-600 text-white text-sm font-medium shadow hover:bg-emerald-700"
              >
                Play Audio
              </button>

              <button
                type="button"
                onClick={stopHeaderAudio}
                className="px-4 py-2 rounded-full bg-red-600 text-white text-sm font-medium shadow hover:bg-red-700"
              >
                Stop Audio
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* SHOP GRID */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {shopItems.map((item) => (
          <article key={item.id} className={`${glassPanel} flex flex-col gap-4`}>
            <div className="relative w-full h-48 rounded-xl overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {item.description}
              </p>
            </div>

            <div className="mt-auto space-y-2 pt-2 border-t border-white/40 dark:border-slate-700/60">
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">
                {item.price}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {item.season}
              </p>
            </div>
          </article>
        ))}
      </section>

      {/* INFO SECTION */}
      <section className={`${glassPanel}`}>
        <h2 className="text-2xl font-semibold mb-4">About Our Products</h2>
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <p>
            All our products come from the St. Margaret's Bay Woodland Conservation Site. 
            When you purchase from our shop, you support the conservation efforts and help 
            maintain this beautiful natural space for future generations.
          </p>
          <p>
            Our fruits are grown using sustainable practices that respect the land and wildlife. 
            The jams are made in small batches using traditional methods, ensuring quality and flavor 
            in every jar.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
