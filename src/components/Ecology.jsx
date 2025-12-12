/**
 * ================================================================================
 * File: Ecology.jsx
 * Author: ADM (Abhishek Darsh Manar) 2025 Fall - Software Engineering (CSCI-3428-1)
 * Description: Ecology page displaying categorized species (flora, fauna, fungi)
 * with dynamic image loading, filtering, and modal detail views. Includes Azure
 * text-to-speech for accessibility.
 * ================================================================================
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { IoClose, IoWarningOutline } from "react-icons/io5";
import ecologyData from '../data/ecologydata.json';
import Footer from "./Footer";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

// ============================================================================
// Image Loading & Processing
// ============================================================================

// Vite glob import: eagerly load all ecology images at build time
// This ensures all images are bundled and available immediately
const imageModules = import.meta.glob('../assets/ecologyimages/*', {
  eager: true,
  import: 'default',
});

/**
 * Normalize species names to match image filenames
 * Removes special characters and converts to lowercase for consistent matching
 * @param {string} value - Species name to normalize
 * @returns {string} Normalized key
 */
const normalizeKey = (value = '') =>
  value
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]/g, '');

/**
 * Build image lookup map from imported modules
 * Handles both singular and plural forms for flexible matching
 * Example: "birch" and "birches" both map to same image
 */
const speciesImages = Object.entries(imageModules).reduce((acc, [path, module]) => {
  const fileName = path.split('/').pop() || '';
  const baseName = fileName.replace(/\.[^/.]+$/, '');
  const normalized = normalizeKey(baseName);

  if (!acc[normalized]) {
    acc[normalized] = module;
  }

  if (normalized.endsWith('s')) {
    const singular = normalized.slice(0, -1);
    if (!acc[singular]) {
      acc[singular] = module;
    }
  }

  return acc;
}, {});

// Manual aliases for species with non-standard naming conventions
const aliasMap = {
  yellowcoastalbirch: 'birch',
  pinecherry: 'pincherry',
  wildpear: 'wildpeartree',
};

Object.entries(aliasMap).forEach(([alias, canonical]) => {
  if (speciesImages[canonical] && !speciesImages[alias]) {
    speciesImages[alias] = speciesImages[canonical];
  }
});

/**
 * Format category key to display label (capitalize first letter)
 * @param {string} key - Category key (e.g., "flora", "fauna")
 * @returns {string} Formatted label (e.g., "Flora", "Fauna")
 */
const formatCategoryLabel = (key = '') =>
  key.charAt(0).toUpperCase() + key.slice(1);

/**
 * Build flat list of all species from categorized data
 * Creates entries with normalized IDs for React key prop
 * @returns {Array<Object>} Array of species objects with metadata
 */
const buildSpeciesList = () => {
  const entries = [];

  Object.entries(ecologyData.species_by_category).forEach(([categoryKey, list]) => {
    list.forEach((commonName) => {
      entries.push({
        id: `${categoryKey}-${normalizeKey(commonName)}`,
        common_name: commonName,
        categoryKey,
        categoryLabel: formatCategoryLabel(categoryKey),
      });
    });
  });

  return entries;
};

/**
 * Get image module for a species by common name
 * Uses normalized key matching to find corresponding image
 * @param {string} commonName - Common name of species
 * @returns {Object|null} Image module or null if not found
 */
const getSpeciesImage = (commonName) => {
  if (!commonName) return null;
  const normalized = normalizeKey(commonName);
  return speciesImages[normalized] || null;
};

// ============================================================================
// Ecology Component
// ============================================================================

/**
 * Ecology Component - Displays species catalog with filtering and modal details
 * @returns {JSX.Element}
 */
const Ecology = () => {
  // ============================================================================
  // State Management
  // ============================================================================
  
  // Selected species for modal display
  const [selectedItem, setSelectedItem] = useState(null);
  // Current category filter (All, Flora, Fauna, Fungi)
  const [categoryFilter, setCategoryFilter] = useState('All');
  // Client-side flag for portal rendering (SSR safety)
  const [isClient, setIsClient] = useState(false);
  // Store scroll position before opening modal to restore after close
  const scrollPositionRef = useRef(0);

  // Text-to-speech state and refs
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const synthesizerRef = useRef(null);
  const playerRef = useRef(null);

  // ============================================================================
  // Computed Values (Memoized)
  // ============================================================================
  
  // Extract category keys from data once
  const categoryKeys = useMemo(
    () => Object.keys(ecologyData.species_by_category),
    []
  );

  // Build category options with "All" option first
  const categoryOptions = useMemo(
    () => ['All', ...categoryKeys.map(formatCategoryLabel)],
    [categoryKeys],
  );

  // Build species list once from data
  const allSpecies = useMemo(() => buildSpeciesList(), []);

  // Filter and sort species based on selected category
  // Memoized to avoid recalculation on every render
  const filteredData = useMemo(
    () =>
      allSpecies
        .filter((item) => categoryFilter === 'All' || item.categoryLabel === categoryFilter)
        .sort((a, b) => a.common_name.localeCompare(b.common_name)),
    [allSpecies, categoryFilter],
  );

  // ============================================================================
  // Side Effects
  // ============================================================================
  
  /**
   * Set client flag for portal rendering
   * Portals require DOM, so only render on client side (SSR safety)
   */
  useEffect(() => {
    setIsClient(true);
  }, []); // Run once on mount

  /**
   * Lock body scroll when modal is open
   * Prevents background scrolling while modal is displayed
   * Stores scroll position to restore after modal closes
   */
  useEffect(() => {
    if (selectedItem) {
      scrollPositionRef.current = window.scrollY;

      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';

      return () => {
        const storedScroll = scrollPositionRef.current;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        window.scrollTo(0, storedScroll);
      };
    }
  }, [selectedItem]); // Re-run when modal opens/closes

  /**
   * Initialize Azure Speech SDK for header narration
   * Only initializes if API keys are present
   */
  useEffect(() => {
    try {
      const speechKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
      const speechRegion = import.meta.env.VITE_AZURE_REGION;

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
   * Play header audio narration with error handling
   * Displays alert if API keys are missing or initialization failed
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
      if (!synthesizer) {
        setAlertMessage("Text-to-speech is not initialized. Please configure Azure API keys and refresh the page.");
        setTimeout(() => setAlertMessage(null), 8000);
        return;
      }

      const text =
        "Species you may encounter. " +
        "Explore the flora, fauna, and fungi of Saint Margaret's Bay. " +
        "Use the filter below to focus on a category, then open a card to view the reference photo.";

      if (player) {
        player.resume();
      }

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

  const stopHeaderAudio = () => {
    const player = playerRef.current;

    if (player) {
      player.pause();
    }

    setIsSpeaking(false);
  };

  /**
   * Close species detail modal
   * Scroll position is restored by useEffect cleanup
   */
  const closeModal = () => setSelectedItem(null);

  const glassPanel =
    'rounded-3xl border border-white/40 bg-white/60 p-6 shadow-lg shadow-slate-900/10 backdrop-blur-2xl transition-colors duration-300 dark:border-slate-700/60 dark:bg-slate-900/55';

  return (
    <div className="flex flex-col gap-8 text-slate-800 dark:text-slate-100">
      {/* HEADER WITH AUDIO */}
      <header
        className={`${glassPanel} flex flex-col gap-5 md:flex-row md:items-center md:justify-between`}
      >
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">
            Species you may encounter
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Explore the flora, fauna, and fungi of St. Margaret&apos;s Bay. Use the filter below to
            focus on a category, then open a card to view the reference photo.
          </p>

          {/* Alert message - shows when API keys are missing or invalid */}
          {alertMessage && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border-2 border-amber-500/70 bg-amber-50/95 p-4 text-sm text-amber-900 shadow-lg dark:border-amber-400/70 dark:bg-amber-900/95 dark:text-amber-100 z-50">
              <IoWarningOutline className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="flex-1">
                <p className="font-semibold text-base">Azure API Keys Required</p>
                <p className="mt-1.5 text-sm">{alertMessage}</p>
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                  Configure in Netlify/Azure environment variables or create a <code className="rounded bg-amber-200/60 px-1.5 py-0.5 dark:bg-amber-800/60">.env</code> file for local development.
                </p>
              </div>
              <button
                onClick={() => setAlertMessage(null)}
                className="flex-shrink-0 text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100 transition-colors"
                aria-label="Dismiss"
              >
                <IoClose className="h-5 w-5" />
              </button>
            </div>
          )}
          
          <div className="space-y-2 mt-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={playHeaderAudio}
                className="px-4 py-2 rounded-full bg-emerald-600 text-white text-sm font-medium shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                Play Audio
              </button>

              <button
                type="button"
                onClick={stopHeaderAudio}
                className="px-4 py-2 rounded-full bg-red-600 text-white text-sm font-medium shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                Stop Audio
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className={`${glassPanel} p-6`}>
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="flex-1 space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((option) => (
                <button
                  key={option}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition ${
                    categoryFilter === option
                      ? 'border-emerald-500 bg-emerald-500/90 text-white shadow-emerald-500/40'
                      : 'border-white/50 bg-white/70 text-slate-700 hover:bg-white/90 dark:border-slate-700/50 dark:bg-slate-900/60 dark:text-slate-200'
                  }`}
                  onClick={() => setCategoryFilter(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end rounded-2xl border border-white/40 bg-white/60 px-4 py-3 text-center shadow-inner shadow-slate-900/5 dark:border-slate-700/60 dark:bg-slate-900/60">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Results
              </p>
              <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-300">
                {filteredData.length}{' '}
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  of {allSpecies.length}
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filteredData.map((item) => {
          const imagePath = getSpeciesImage(item.common_name);

          return (
            <article
              key={item.id}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/35 bg-white/45 shadow-lg shadow-slate-900/15 transition-transform duration-500 hover:-translate-y-1 hover:shadow-2xl dark:border-slate-700/60 dark:bg-slate-900/55"
              onClick={() => setSelectedItem(item)}
            >
              <div className="relative h-64 overflow-hidden">
                {imagePath ? (
                  <>
                    <img
                      src={imagePath}
                      alt={item.common_name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = e.target.nextElementSibling;
                        if (fallback) {
                          fallback.style.display = 'flex';
                        }
                      }}
                    />
                    <div className="hidden absolute inset-0 bg-gradient-to-br from-emerald-400 to-sky-500 dark:from-emerald-600 dark:to-sky-700" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-sky-500 dark:from-emerald-600 dark:to-sky-700" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

                <div className="absolute inset-0 flex flex-col justify-between p-5">
                  <div className="flex justify-end">
                    <span className="rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm shadow-lg shadow-black/30">
                      {item.categoryLabel}
                    </span>
                  </div>

                  <div className="text-center text-white drop-shadow-lg">
                    <h3 className="text-2xl font-semibold">{item.common_name}</h3>
                  </div>

                  <div className="flex justify-center">
                    <span className="rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs text-white backdrop-blur-sm">
                      View photo
                    </span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {isClient && selectedItem
        ? createPortal(
            (() => {
              const selectedImage = getSpeciesImage(selectedItem.common_name);
              const relatedSpecies =
                ecologyData.species_by_category[selectedItem.categoryKey]?.filter(
                  (name) => name !== selectedItem.common_name,
                ) ?? [];

              const handleOverlayClick = (event) => {
                if (event.target === event.currentTarget) {
                  closeModal();
                }
              };

              return (
                <div
                  className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-slate-900/70 p-4 backdrop-blur-lg"
                  onClick={handleOverlayClick}
                >
                  <div
                    className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/50 bg-white/85 p-6 shadow-2xl shadow-slate-900/40 backdrop-blur-2xl dark:border-slate-700/60 dark:bg-slate-900/90"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="ecology-modal-title"
                  >
                    <button
                      className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/95 text-lg font-bold text-slate-600 shadow-md shadow-slate-900/15 hover:bg-white dark:border-slate-600/60 dark:bg-slate-800/80 dark:text-slate-200"
                      onClick={closeModal}
                      aria-label="Close details"
                    >
                      ×
                    </button>

                    <div className="relative mb-4 h-56 w-full overflow-hidden rounded-2xl">
                      {selectedImage ? (
                        <>
                          <img
                            src={selectedImage}
                            alt={selectedItem.common_name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const fallback = e.target.nextElementSibling;
                              if (fallback) {
                                fallback.style.display = 'flex';
                              }
                            }}
                          />
                          <div className="hidden absolute inset-0 bg-gradient-to-br from-emerald-400 to-sky-500 dark:from-emerald-600 dark:to-sky-700" />
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-sky-500 dark:from-emerald-600 dark:to-sky-700" />
                      )}

                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-black/70 via-black/25 to-transparent text-center text-white drop-shadow-lg">
                        <h2 id="ecology-modal-title" className="text-2xl font-semibold">
                          {selectedItem.common_name}
                        </h2>
                        <p className="mt-1 text-lg">{selectedItem.categoryLabel}</p>
                      </div>
                    </div>

                    <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1 text-sm text-slate-700 dark:text-slate-300">
                      <div>
                        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                          Category
                        </h3>
                        <p>{selectedItem.categoryLabel}</p>
                      </div>

                      {relatedSpecies.length > 0 ? (
                        <div>
                          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                            More {selectedItem.categoryLabel.toLowerCase()}
                          </h3>
                          <ul className="list-disc space-y-1 pl-5 text-xs text-slate-600 dark:text-slate-400">
                            {relatedSpecies.map((name) => (
                              <li key={name}>{name}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Additional field notes will be added in a future update.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })(),
            document.body,
          )
        : null}

      {/* Source Attribution */}
      <section className={`${glassPanel} p-6`}>
        <div className="border-t border-slate-300/50 pt-4 dark:border-slate-600/50">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            <strong className="text-slate-700 dark:text-slate-300">Source:</strong> Natural History of the French Village Conservation Woodland. A Report to the French Village Conservation Woodland Committee by David Patriquin, Jess Lewis, Livy Fraser, Liam Holwell, Rohan Kariyawansa. Nov. 2021
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Ecology;
