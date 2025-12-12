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
  }, []); // Initialize once on mount

  // ============================================================================
  // Event Handlers
  // ============================================================================
  
  /**
   * Play header audio narration
   * Note: This component doesn't have try-catch alerts like others
   * Consider adding error handling for consistency
   */
  const playHeaderAudio = () => {
    const synthesizer = synthesizerRef.current;
    const player = playerRef.current;

    if (!synthesizer) return;

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
        setIsSpeaking(false);
      }
    );
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
