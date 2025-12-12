/**
 * ================================================================================
 * File: About.jsx
 * Author: ADM (Abhishek Darsh Manar) 2025 Fall - Software Engineering (CSCI-3428-1)
 * Description: About page displaying site history, mission highlights, timeline,
 * and photo stories with integrated Azure text-to-speech for accessibility.
 * ================================================================================
 */

import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import lakeshoreImage from "../assets/about/brinelakelookout.jpg";
import exerciseImage from "../assets/about/exercise.jpg";
import labyrinthImage from "../assets/about/labrynth.jpg";
import telephoneImage from "../assets/about/restingandphone.jpg";
import farmhouseImage from "../assets/about/farmhousefoundation.jpg";
import historicWellImage from "../assets/about/historicwell.jpg";
import donationImage from "../assets/about/BrineGravestone.jpg";
import churchSketchImage from "../assets/about/stpaulchurchskech old.png";
import ecologyImage from "../assets/about/neighbour.JPG";
import {
  FaTree,
  FaWater,
  FaHandsHelping,
  FaMapMarkedAlt,
  FaLeaf,
  FaRoute,
  FaCompass,
} from "react-icons/fa";
import { BsArrowUpRight } from "react-icons/bs";
import { IoClose, IoWarningOutline } from "react-icons/io5";
import Footer from "./Footer";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

// ============================================================================
// Constants & Configuration
// ============================================================================

// Reusable glass morphism styling
const glassPanel =
  "rounded-3xl border border-white/40 bg-white/60 p-6 shadow-lg shadow-slate-900/10 backdrop-blur-2xl transition-colors duration-300 dark:border-slate-700/60 dark:bg-slate-900/55";

// Mission highlight cards displayed in hero section
const missionHighlights = [
  {
    icon: <FaTree className="text-emerald-500 text-3xl" />,
    title: "Gifted by St. Paul’s",
    text: "The land behind St. Paul’s Anglican Church was donated so the community could explore 27 acres of forest forever.",
  },
  {
    icon: <FaWater className="text-sky-500 text-3xl" />,
    title: "Brine Lake Guardian",
    text: "Wetlands and a winding stream protect Brine Lake, keeping homes for birds, beavers, and dragonflies safe and splashy.",
  },
  {
    icon: <FaHandsHelping className="text-rose-500 text-3xl" />,
    title: "Volunteer Powered",
    text: "Neighbours plan trail care days, lead playful scavenger hunts, and guide visitors through the forest classrooms.",
  },
  {
    icon: <FaMapMarkedAlt className="text-amber-500 text-3xl" />,
    title: "Easy to Explore",
    text: "A friendly loop starts right behind the church and winds past play stops, story markers, and quiet reflection spots.",
  },
];

// Interactive discovery prompts for visitors
const trailDiscoveryIdeas = [
  "Count the rings on the exercise log and imagine the seasons this tree has known.",
  "Spot yellow birch bark curling like paper ribbons and match the texture to nearby leaves.",
  "Pause by the woodland telephone post and offer a quiet message for someone you miss.",
  "Take a deep breath at the Brine Lake lookout and sketch the clouds reflecting on the water.",
];

const timeline = [
  {
    year: "Before 1900",
    title: "Church & Community Roots",
    body: "Families gathered at St. Paul’s Anglican Church and cared for the woods beside the historic cemetery.",
  },
  {
    year: "Gifted Land",
    title: "Church Donation",
    body: "The congregation set aside 27 acres for community recreation, reflection, and future conservation.",
  },
  {
    year: "Feb 2022",
    title: "Council Motion",
    body: "Halifax Regional Council requested a report asking the Province to protect the French Village Conservation Woodland.",
  },
  {
    year: "May 2023",
    title: "Protected Areas Report",
    body: "Council reviewed the Protected Areas Registry report confirming the site’s ecological value and path to a conservation easement.",
  },
  {
    year: "Today",
    title: "Next Steps",
    body: "Volunteers and partners are finalizing conservation agreements and welcoming programming so everyone can enjoy the trails.",
  },
];

// Photo story cards with images and captions
const photoStories = [
  {
    image: exerciseImage,
    title: "Trailhead Warm-Up",
    caption:
      "Start with gentle stretches at the exercise bar designed for all ages to loosen up before the kilometre loop.",
  },
  {
    image: labyrinthImage,
    title: "Labyrinth of Quiet Steps",
    caption:
      "Walk the spiral path slowly, pause at the centre, and let the breeze carry the sounds of the woods around you.",
  },
  {
    image: telephoneImage,
    title: "Listening Telephone",
    caption:
      "Take a moment at the woodland telephone to share a gentle message with loved ones who are remembered among the trees.",
  },
  {
    image: farmhouseImage,
    title: "Farmhouse Foundations",
    caption:
      "Imagine life in the clearing where the original farmhouse stood and learn about daily chores from 100 years ago.",
  },
  {
    image: historicWellImage,
    title: "Historic Wells",
    caption:
      "Stone wells that once provided fresh water now sit among fern-lined clearings with stories about the families who drew from them.",
  },
  {
    image: ecologyImage,
    title: "Meet the Woodland Neighbours",
    caption:
      "Discover mossy logs, lichens, and the wildlife who depend on this forest—then continue learning in our ecology guide.",
  },
];

// ============================================================================
// About Component
// ============================================================================

/**
 * About Component - Displays site information, history, and mission
 * @returns {JSX.Element}
 */
export default function About() {
  // ============================================================================
  // State Management
  // ============================================================================
  
  // Text-to-speech state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const synthesizerRef = useRef(null);
  // Controllable player allows pause/resume for instant stop
  const playerRef = useRef(null);

  // ============================================================================
  // Azure Text-to-Speech Initialization
  // ============================================================================
  
  /**
   * Initialize Azure Speech SDK on component mount
   * Empty dependency array ensures initialization runs once
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
   * Speak text using Azure Speech SDK
   * Used by multiple sections (hero, mission highlights, timeline)
   * @param {string} text - Text to synthesize and speak
   */
  const speakText = (text) => {
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
      if (!synthesizer || !text) {
        setAlertMessage("Text-to-speech is not initialized. Please configure Azure API keys and refresh the page.");
        setTimeout(() => setAlertMessage(null), 8000);
        return;
      }

      if (player) {
        player.resume();
      }

      setIsSpeaking(true);
      synthesizer.speakTextAsync(
        text,
        () => {
          setIsSpeaking(false);
        },
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

  const stopSpeech = () => {
    const player = playerRef.current;

    if (player) {
      player.pause(); // immediate local stop
    }

    setIsSpeaking(false);
  };

  // ============================================================================
  // Render
  // ============================================================================
  
  return (
    <div className="flex flex-col gap-8 text-slate-800 dark:text-slate-100">
      {/* HERO SECTION */}
      <section
        className={`${glassPanel} flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between`}
      >
        <div className="flex-1 space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
            About the Conservation Woodland
          </p>
          <h1 className="text-2xl font-semibold md:text-3xl">
            French Village Conservation Woodland is the forest family behind
            St. Paul&apos;s Church.
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Step off St. Paul&apos;s Lane and you&apos;re instantly on land
            gifted by St. Paul&apos;s Anglican Church for the whole community.
            The 27 acres stretch almost two kilometres from the heritage
            churchyard to Brine Lake with wetlands, yellow birch groves, and
            trail stops that invite curious visitors and lifelong nature lovers
            alike.
          </p>
          <div className="grid gap-2 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-2">
            <div>
              <strong>Trailhead:</strong> Behind St. Paul&apos;s Anglican
              Church, 71 St. Pauls Lane, French Village
            </div>
          </div>

          {/* AUDIO CONTROLS: HERO SECTION */}
          <div className="space-y-2 pt-2">
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
                onClick={() =>
                  speakText(
                    "About the Conservation Woodland. " +
                      "French Village Conservation Woodland is the forest family behind Saint Paul's Church. " +
                      "Step off Saint Paul's Lane and you are instantly on land gifted by Saint Paul's Anglican Church for the whole community. " +
                      "The twenty-seven acres stretch almost two kilometres from the heritage churchyard to Brine Lake, " +
                      "with wetlands, yellow birch groves, and trail stops that invite curious visitors and lifelong nature lovers alike. " +
                      "Trailhead: behind Saint Paul's Anglican Church, seventy one Saint Pauls Lane, French Village."
                  )
                }
                className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium bg-emerald-600 text-white shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                Play Audio
              </button>

              <button
                type="button"
                onClick={stopSpeech}
                className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium bg-red-600 text-white shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                Stop Audio
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              to="/sitemap"
              className="flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-5 py-2 text-xs font-semibold text-slate-700 shadow-md shadow-slate-900/10 transition hover:bg-white/90 dark:border-slate-600/60 dark:bg-slate-900/60 dark:text-slate-200"
            >
              Trail Map
              <FaMapMarkedAlt />
            </Link>
            <Link
              to="/ecology"
              className="flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-5 py-2 text-xs font-semibold text-slate-700 shadow-md shadow-slate-900/10 transition hover:bg-white/90 dark:border-slate-600/60 dark:bg-slate-900/60 dark:text-slate-200"
            >
              Ecology
              <BsArrowUpRight />
            </Link>
            <Link
              to="/gallery"
              className="flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-5 py-2 text-xs font-semibold text-slate-700 shadow-md shadow-slate-900/10 transition hover:bg-white/90 dark:border-slate-600/60 dark:bg-slate-900/60 dark:text-slate-200"
            >
              Gallery
              <BsArrowUpRight />
            </Link>
            <Link
              to="/contact"
              className="flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-5 py-2 text-xs font-semibold text-slate-700 shadow-md shadow-slate-900/10 transition hover:bg-white/90 dark:border-slate-600/60 dark:bg-slate-900/60 dark:text-slate-200"
            >
              Contact
              <BsArrowUpRight />
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4 lg:flex-col">
          <figure className="mt-6 w-full overflow-hidden rounded-3xl border border-white/40 shadow-inner shadow-slate-900/10 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 dark:border-slate-700/60 sm:mx-auto md:mt-8 lg:mt-0 lg:w-[28rem] xl:w-[32rem]">
            <img
              src={churchSketchImage}
              alt="Historic sketch of St. Paul's Anglican Church"
              className="h-full w-full object-cover"
            />
          </figure>
        </div>
      </section>

      <section className={`${glassPanel} grid gap-4 md:grid-cols-4`}>
        {missionHighlights.map(({ icon, title, text }) => (
          <article
            key={title}
            className="rounded-2xl border border-white/40 bg-white/70 p-4 shadow-inner shadow-slate-900/5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10 dark:border-slate-700/60 dark:bg-slate-900/55"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/60 bg-white/80 shadow-inner shadow-slate-900/5 dark:border-slate-600/60 dark:bg-slate-900/60">
              {icon}
            </div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              {title}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {text}
            </p>
          </article>
        ))}
      </section>

      {/* WHY THIS WOODLAND MATTERS */}
      <section className={`${glassPanel} grid gap-6 md:grid-cols-2`}>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Why this woodland matters</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            The French Village Conservation Woodland is a living classroom, a
            playground without swings, and a peaceful memorial all at once.
            Volunteers care for the forest so neighbours can learn about
            lichens, families can walk together, and elders can find quiet
            remembering spaces.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            A memorial stone beside the shoreline honours the Brine family,
            whose name lives on through Brine Lake and the traditions they
            helped establish in French Village.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Halifax Regional Council’s Item 4 Information Report (May 9, 2023)
            celebrated the site’s ecological value and supported the request to
            include the woodland in Nova Scotia’s Protected Areas Registry. It
            confirmed the path toward a conservation easement that honours the
            church’s donation.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            With partners like local schools, nature trusts, and the Green
            Burial Society of Canada, the woodland is preparing to become the
            first urban certified green burial conservation cemetery in
            Canada—while still welcoming everyday adventures.
          </p>

          {/* AUDIO CONTROLS: WHY THIS WOODLAND MATTERS */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() =>
                speakText(
                  "Why this woodland matters. " +
                    "The French Village Conservation Woodland is a living classroom, a playground without swings, and a peaceful memorial all at once. " +
                    "Volunteers care for the forest so neighbours can learn about lichens, families can walk together, and elders can find quiet remembering spaces. " +
                    "A memorial stone beside the shoreline honours the Brine family, whose name lives on through Brine Lake and the traditions they helped establish in French Village. " +
                    "Halifax Regional Council's Item 4 Information Report, May ninth twenty twenty-three, celebrated the site's ecological value " +
                    "and supported the request to include the woodland in Nova Scotia's Protected Areas Registry. " +
                    "It confirmed the path toward a conservation easement that honours the church's donation. " +
                    "With partners like local schools, nature trusts, and the Green Burial Society of Canada, " +
                    "the woodland is preparing to become the first urban certified green burial conservation cemetery in Canada, " +
                    "while still welcoming everyday adventures."
                )
              }
              className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium bg-emerald-600 text-white shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              Play Section Audio
            </button>

            <button
              type="button"
              onClick={stopSpeech}
              className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium bg-red-600 text-white shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              Stop Audio
            </button>
          </div>

          <div className="pt-2">
            <Link
              to="#natural-burial"
              className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-5 py-2 text-xs font-semibold text-slate-700 shadow-md shadow-slate-900/10 transition hover:bg-white/90 dark:border-slate-600/60 dark:bg-slate-900/60 dark:text-slate-200"
            >
              Natural Burial
              <BsArrowUpRight />
            </Link>
          </div>
        </div>
        <figure className="overflow-hidden rounded-2xl border border-white/40 shadow-inner shadow-slate-900/10 dark:border-slate-700/60">
          <img
            src={donationImage}
            alt="Historic stones marking the conservation donation"
            className="h-full w-full object-cover"
          />
        </figure>
      </section>

      <section className={`${glassPanel} space-y-4`}>
        <h2 className="text-2xl font-semibold">Story steps timeline</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Follow the milestones that brought the woodland from churchyard trail
          to protected community treasure:
        </p>
        <div className="grid gap-4 md:grid-cols-5">
          {timeline.map(({ year, title, body }) => (
            <article
              key={year}
              className="group rounded-2xl border border-white/40 bg-white/70 p-4 shadow-inner shadow-slate-900/5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-500/10 dark:border-slate-700/60 dark:bg-slate-900/55"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500 dark:text-emerald-300">
                {year}
              </p>
              <h3 className="mt-2 text-base font-semibold text-slate-800 dark:text-slate-100">
                {title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${glassPanel} space-y-6`}>
        <h2 className="text-2xl font-semibold">
          Choose your own woodland adventure
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Every stop along the loop feels like a storybook page. Use these
          images to spark scavenger hunts or plan themed visits for classrooms,
          clubs, or family outings.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {photoStories.map(({ image, title, caption }) => (
            <figure
              key={title}
              className="overflow-hidden rounded-2xl border border-white/40 bg-white/60 shadow-inner shadow-slate-900/10 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/10 dark:border-slate-700/60 dark:bg-slate-900/55"
            >
              <img
                src={image}
                alt={title}
                className="h-56 w-full object-cover sm:h-64"
              />
              <figcaption className="space-y-3 px-5 py-4">
                <div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {caption}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {[
                    "Trailhead Warm-Up",
                    "Labyrinth of Quiet Steps",
                    "Listening Telephone",
                    "Farmhouse Foundations",
                    "Historic Wells",
                  ].includes(title) ? (
                    <Link
                      to="/sitemap"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 transition hover:underline dark:text-slate-200"
                    >
                      Trail Map
                      <FaMapMarkedAlt className="text-sm" />
                    </Link>
                  ) : null}
                  {title === "Meet the Woodland Neighbours" ? (
                    <Link
                      to="/ecology"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 transition hover:underline dark:text-slate-200"
                    >
                      Ecology
                      <BsArrowUpRight />
                    </Link>
                  ) : null}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className={`${glassPanel} space-y-4`}>
        <h2 className="text-2xl font-semibold">Trail discovery prompts</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Turn every visit into a mini mission and share your discoveries with
          neighbours and friends.
        </p>
        <div className="grid gap-3 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
          {trailDiscoveryIdeas.map((idea) => (
            <div
              key={idea}
              className="flex items-start gap-2 rounded-2xl border border-white/40 bg-white/65 p-3 shadow-inner shadow-slate-900/5 dark:border-slate-700/60 dark:bg-slate-900/55"
            >
              <FaCompass className="mt-1 text-emerald-500" />
              <span>{idea}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={`${glassPanel} grid gap-6 md:grid-cols-2`}>
        <figure className="order-last overflow-hidden rounded-2xl border border-white/40 shadow-inner shadow-slate-900/10 dark:border-slate-700/60 md:order-first">
          <img
            src={lakeshoreImage}
            alt="Brine Lake lookout at the end of the woodland trail"
            className="h-full w-full object-cover"
          />
        </figure>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">How we keep the promise</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Volunteers coordinate with Halifax Regional Municipality staff,
            conservation partners, and the Green Burial Society of Canada to
            protect the woodland through a conservation easement. This legal
            promise keeps the land natural while supporting green burial
            certification.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Want to help? Join monthly trail care events, offer nature lessons,
            or support the conservation fund. Every hour shared on the trail
            keeps the woodland thriving for future generations.
          </p>
          <div className="grid gap-2 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-2">
              <FaLeaf className="mt-1 text-emerald-500" />
              <span>
                Share stewardship ideas or request a guided tour through our{" "}
                <Link
                  to="/contact"
                  className="underline decoration-emerald-400 decoration-2 underline-offset-4"
                >
                  contact page
                </Link>
                .
              </span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
