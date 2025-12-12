/**
 * ================================================================================
 * File: gallery.jsx
 * Author: ADM (Abhishek Darsh Manar) 2025 Fall - Software Engineering (CSCI-3428-1)
 * Description: Photo gallery component displaying conservation area images with
 * upload functionality and Azure text-to-speech for accessibility.
 * ================================================================================
 */

import React, { useState, useRef, useEffect } from 'react';
import { IoClose, IoWarningOutline } from "react-icons/io5";
import Footer from './Footer';
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

// ============================================================================
// Constants
// ============================================================================

// Reusable glass morphism styling
const glassPanel =
  "rounded-3xl border border-white/40 bg-white/60 p-6 shadow-lg shadow-slate-900/10 backdrop-blur-2xl transition-colors duration-300 dark:border-slate-700/60 dark:bg-slate-900/55";

// Import default gallery images from assets folder
import image1 from '../assets/download-1.jpg';
import image2 from '../assets/download-2.jpg';
import image3 from '../assets/download-3.jpg';
import image4 from '../assets/download-7.jpg';
import image5 from '../assets/download-8.jpg';
import image6 from '../assets/download-9.jpg';
import image7 from '../assets/download-10.jpg';
import image8 from '../assets/download-11.jpg';
import image9 from '../assets/images-1.jpg';

// ============================================================================
// Gallery Component
// ============================================================================

/**
 * Gallery Component - Photo gallery with upload functionality
 * @returns {JSX.Element}
 */
const Gallery = () => {
  // ============================================================================
  // State Management
  // ============================================================================
  
  // Gallery images - initialized with default images, can be extended with uploads
  const [images, setImages] = useState([
    { src: image1, name: 'Image 1' },
    { src: image2, name: 'Image 2' },
    { src: image3, name: 'Image 3' },
    { src: image4, name: 'Image 4' },
    { src: image5, name: 'Image 5' },
    { src: image6, name: 'Image 6' },
    { src: image7, name: 'Image 7' },
    { src: image8, name: 'Image 8' },
    { src: image9, name: 'Image 9' },
  ]);

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
      // Check for API keys before attempting playback
      if (!speechKey || !speechRegion) {
        setAlertMessage("Azure Speech API keys are missing. Please update VITE_AZURE_SPEECH_KEY and VITE_AZURE_REGION in your environment variables (Netlify/Azure dashboard) or .env file for local development.");
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
        "Enchanting Forest Gallery. Discover the breathtaking beauty of forests and serene landscapes. " +
        "Feel free to add your favorite photos to enrich this gallery.";

      if (player) player.resume();

      setIsSpeaking(true);
      synthesizer.speakTextAsync(
        text,
        () => setIsSpeaking(false),
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
   */
  const stopHeaderAudio = () => {
    const player = playerRef.current;

    if (player) player.pause();

    setIsSpeaking(false);
  };

  // 📸 Handle Image Upload
  const handleImageUpload = (event) => {
    const files = event.target.files;
    const uploadedImages = Array.from(files).map((file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      return new Promise((resolve) => {
        reader.onload = () => resolve({ src: reader.result, name: file.name });
      });
    });

    Promise.all(uploadedImages).then((newImages) => {
      setImages((prev) => [...prev, ...newImages]);
    });
  };

  return (
    <div className="flex flex-col gap-8 text-slate-800 dark:text-slate-100">

      {/* HEADER */}
      <header className={`${glassPanel} flex flex-col gap-5 md:flex-row md:items-center md:justify-between`}>
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
            <h1 className="text-2xl font-semibold md:text-3xl">
              Enchanting Forest Gallery
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              Discover the breathtaking beauty of forests and serene landscapes. Feel free to add your favorite photos to enrich this gallery!
            </p>

            {/* AUDIO BUTTONS */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={playHeaderAudio}
                className="px-4 py-2 rounded-full bg-emerald-600 text-white text-sm font-medium shadow hover:bg-emerald-700"
              >
                Play Audio
              </button>

              <button
                onClick={stopHeaderAudio}
                className="px-4 py-2 rounded-full bg-red-600 text-white text-sm font-medium shadow hover:bg-red-700"
              >
                Stop Audio
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* GALLERY GRID */}
      <section className={`${glassPanel} p-6`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img, index) => (
            <div
              key={index}
              className="relative group overflow-hidden rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105"
            >
              <img
                src={img.src}
                alt={img.name}
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <p className="text-white text-lg font-semibold">{img.name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* IMAGE UPLOAD */}
      <section className={`${glassPanel} p-6`}>
        <div className="text-center border-2 border-dashed border-white/60 dark:border-slate-700/60 p-6 rounded-2xl bg-white/40 dark:bg-slate-900/40">
          <p className="text-gray-700 dark:text-gray-300">
            Drag and drop images here or click below to upload
          </p>

          <label className="block mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
            Upload Images
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Gallery;
