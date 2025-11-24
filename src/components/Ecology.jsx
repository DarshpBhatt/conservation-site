// Purpose: Ecology page component to display categorized species (flora, fauna, fungi) with imagery.

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import ecologyData from '../data/ecologydata.json';
import Footer from "./Footer";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

const imageModules = import.meta.glob('../assets/ecologyimages/*', {
  eager: true,
  import: 'default',
});

const normalizeKey = (value = '') =>
  value
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]/g, '');

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

const formatCategoryLabel = (key = '') =>
  key.charAt(0).toUpperCase() + key.slice(1);

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

const getSpeciesImage = (commonName) => {
  if (!commonName) return null;
  const normalized = normalizeKey(commonName);
  return speciesImages[normalized] || null;
};

const Ecology = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isClient, setIsClient] = useState(false);
  const scrollPositionRef = useRef(0);

  // 🔊 AUDIO STATE & REFS FOR HEADER
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthesizerRef = useRef(null);
  const playerRef = useRef(null);

  const categoryKeys = useMemo(
    () => Object.keys(ecologyData.species_by_category),
    []
  );

  const categoryOptions = useMemo(
    () => ['All', ...categoryKeys.map(formatCategoryLabel)],
    [categoryKeys],
  );

  const allSpecies = useMemo(() => buildSpeciesList(), []);

  const filteredData = useMemo(
    () =>
      allSpecies
        .filter((item) => categoryFilter === 'All' || item.categoryLabel === categoryFilter)
        .sort((a, b) => a.common_name.localeCompare(b.common_name)),
    [allSpecies, categoryFilter],
  );

  // Set client flag for portal
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Lock body scroll when modal open
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
  }, [selectedItem]);

  // 🔊 Setup Azure Text-to-Speech for header
  useEffect(() => {
    const speechKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
    const speechRegion = import.meta.env.VITE_AZURE_REGION;

    if (!speechKey || !speechRegion) {
      console.warn("Azure Speech key/region are missing in .env");
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
  }, []);

  const playHeaderAudio = () => {
    const synthesizer = synthesizerRef.current;
    const player = playerRef.current;
    if (!synthesizer) return;

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
        setIsSpeaking(false);
      }
    );
  };

  const stopHeaderAudio = () => {
    const synthesizer = synthesizerRef.current;
    const player = playerRef.current;

    if (player) {
      player.pause();
    }

    if (!synthesizer) {
      setIsSpeaking(false);
      return;
    }

    synthesizer.stopSpeakingAsync(
      () => setIsSpeaking(false),
      (err) => {
        console.error("Stop speaking error:", err);
        setIsSpeaking(false);
      }
    );
  };

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

          <div className="flex gap-3 mt-4">
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
      <Footer />
    </div>
  );
};

export default Ecology;
