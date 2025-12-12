/**
 * ================================================================================
 * File: NaturalBurial.jsx
 * Author: ADM (Abhishek Darsh Manar) 2025 Fall - Software Engineering (CSCI-3428-1)
 * Description: Natural burial information page displaying benefits, process,
 * and environmental impact with Azure text-to-speech for accessibility.
 * ================================================================================
 */

import React, { useState, useRef, useEffect } from "react";
import {
  FaLeaf,
  FaTree,
  FaFeatherAlt,
  FaCloudSun,
  FaHandsHelping,
  FaPeace,
} from "react-icons/fa";
import Footer from "./Footer";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

// ============================================================================
// Constants
// ============================================================================

// Reusable glass morphism styling
const glassPanel =
  "rounded-3xl border border-white/40 bg-white/60 p-6 shadow-lg shadow-slate-900/10 backdrop-blur-2xl transition-colors duration-300 dark:border-slate-700/60 dark:bg-slate-900/55";

// ============================================================================
// NaturalBurial Component
// ============================================================================

/**
 * NaturalBurial Component - Information about natural burial practices
 * @returns {JSX.Element}
 */
export default function NaturalBurial() {
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
      "Natural burial is a simple, Earth friendly way to be laid to rest. " +
      "There is no concrete, no metal casket, and no heavy use of chemicals. " +
      "The body returns to the land in a natural way. " +
      "The burial space looks and feels like part of the forest, not like a normal city cemetery. " +
      "The goal is to protect the land and keep it alive for the future. " +
      "At the Saint Margaret's Bay Woodland Conservation Site, the idea is to make a calm place " +
      "that respects people, and also respects nature.";

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

  const stopHeaderAudio = () => {
    const player = playerRef.current;

    if (player) player.pause();

    setIsSpeaking(false);
  };

  // ============================================================================
  // Data Configuration
  // ============================================================================
  
  // Information cards displayed on page
  const cards = [
    {
      title: "Helping Nature",
      icon: <FaLeaf className="text-emerald-500 text-3xl" />,
      img: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
      description:
        "Natural burial does not use harmful chemicals. Wood, cloth, and other soft materials are used instead of metal and plastic. The body and the coffin slowly go back into the soil. This feeds the ground in a safe way. Plants, trees, and tiny life in the earth can grow strong here.",
      extraNote:
        "This is about caring for the land, not only for today, but for many years after.",
    },
    {
      title: "The Forest in St. Margaret's Bay",
      icon: <FaTree className="text-emerald-500 text-3xl" />,
      img: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&h=600&fit=crop",
      description:
        "This woodland near St. Margaret's Bay has tall trees, moss, and quiet trails. The natural burial area is part of this place, not separate from it. When people are laid to rest here, the forest is not damaged. Instead, the trees and plants are protected.",
      extraNote:
        "The site is meant to stay wild, not turn into roads and stone walls.",
    },
    {
      title: "A Peaceful Resting Place",
      icon: <FaFeatherAlt className="text-emerald-500 text-3xl" />,
      img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop",
      description:
        "Some people want a resting place that feels warm, soft, and close to nature. Natural burial does not feel like cement and metal. It feels like sunlight through trees, like wind in the leaves, like being part of the land again.",
      extraNote:
        "It is quiet. It is respectful. It is kind to the Earth and kind to people.",
    },
  ];

  const benefits = [
    {
      title: "Kind to the Earth",
      icon: <FaCloudSun className="text-emerald-500 text-3xl" />,
      text: "No harsh fluids, no heavy building. Less waste. Less damage. The body returns to the soil in a natural way.",
    },
    {
      title: "Simple and Honest",
      icon: <FaPeace className="text-emerald-500 text-3xl" />,
      text: "The idea is not fancy. It is calm. It is about love, memory, and real connection to land.",
    },
    {
      title: "Helps the Community",
      icon: <FaHandsHelping className="text-emerald-500 text-3xl" />,
      text: "This kind of burial can support local conservation. The land can stay safe instead of being sold and changed.",
    },
  ];

  return (
    <div className="flex flex-col gap-8 text-slate-800 dark:text-slate-100">
      {/* HEADER SECTION */}
      <header
        className={`${glassPanel} flex flex-col gap-5 md:flex-row md:items-center md:justify-between`}
      >
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">
            Natural Burial
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Natural burial is a simple, Earth-friendly way to be laid to rest.
            There is no concrete, no metal casket, and no heavy use of chemicals.
            The body returns to the land in a natural way. The burial space looks
            and feels like part of the forest, not like a normal city cemetery.
            The goal is to protect the land and keep it alive for the future. At
            the St. Margaret&apos;s Bay Woodland Conservation Site, the idea is to make
            a calm place that respects people, and also respects nature.
          </p>

          {/* AUDIO BUTTONS */}
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={playHeaderAudio}
              className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium bg-emerald-600 text-white shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              Play Audio
            </button>

            <button
              type="button"
              onClick={stopHeaderAudio}
              className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium bg-red-600 text-white shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              Stop Audio
            </button>
          </div>
        </div>
      </header>

      {/* IMAGE CARDS SECTION */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card, idx) => (
          <article key={idx} className={`${glassPanel} flex flex-col gap-4`}>
            <div className="relative w-full h-48 rounded-xl overflow-hidden">
              <img
                src={card.img}
                alt={card.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/800x600/16a34a/ffffff?text=" +
                    encodeURIComponent(card.title);
                }}
              />
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/50 bg-white/70 shadow-inner shadow-slate-900/10 dark:border-slate-600/60 dark:bg-slate-900/60">
              {card.icon}
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">{card.title}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {card.description.trim()}
              </p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-auto">
              {card.extraNote}
            </p>
          </article>
        ))}
      </section>

      {/* BENEFITS SECTION */}
      <section className={`${glassPanel}`}>
        <h2 className="text-2xl font-semibold mb-6">
          Why Natural Burial Matters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="text-center flex flex-col items-center px-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/50 bg-white/70 shadow-inner shadow-slate-900/10 dark:border-slate-600/60 dark:bg-slate-900/60 mb-3">
                {b.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                {b.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {b.text}
              </p>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-8">
          This place is not only for today. It is for the future. The idea is to
          protect a living forest in Nova Scotia so that families, visitors,
          animals, and plants can all share it with care. Natural burial is part
          of that promise.
        </p>
      </section>

      <Footer />
    </div>
  );
}
