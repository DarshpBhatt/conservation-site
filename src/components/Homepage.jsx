// Purpose: To display the Homepage (landing page) of the Woodland Conservation website
import React, { useState, useEffect, useRef } from "react";
import bannerImage from "../assets/homepage-banner.jpg";
import { Link } from "react-router-dom";
import { FaTree, FaCamera, FaMapMarkedAlt } from "react-icons/fa";
import { BsArrowRightCircle, BsArrowUpRight } from "react-icons/bs";
import Footer from "./Footer";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

const glassPanel =
  "rounded-3xl border border-white/40 bg-white/60 p-6 shadow-lg shadow-slate-900/10 backdrop-blur-2xl transition-colors duration-300 dark:border-slate-700/60 dark:bg-slate-900/55";

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

const Homepage = () => {
  // ---- TEXT TO SPEECH (Azure) FOR HERO SECTION ----
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthesizerRef = useRef(null);
  const playerRef = useRef(null);

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
    speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural"; // choose your neural voice

    const player = new SpeechSDK.SpeakerAudioDestination();
    const audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(player);

    const synthesizer = new SpeechSDK.SpeechSynthesizer(
      speechConfig,
      audioConfig
    );

    synthesizerRef.current = synthesizer;
    playerRef.current = player;

    return () => {
      if (synthesizerRef.current) {
        synthesizerRef.current.close();
      }
      synthesizerRef.current = null;
      playerRef.current = null;
    };
  }, []);

  const playHeroAudio = () => {
    const synthesizer = synthesizerRef.current;
    const player = playerRef.current;
    if (!synthesizer) return;

    const text =
      "Saint Margaret's Bay Area Woodland. " +
      "A community forest that keeps local history and coastal birch standing strong. " +
      "Welcome to the French Village Conservation Woodland at seventy one Saint Pauls Lane—twenty-seven acres of protected forest and wetlands. " +
      "Walk the one-way trail to eight simple stops, from the exercise bar to the labyrinth. " +
      "Discover community stories along the way, and return the same route as the forest soundtrack changes around you.";

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
        setIsSpeaking(false);
      }
    );
  };

  const stopHeroAudio = () => {
    const synthesizer = synthesizerRef.current;
    const player = playerRef.current;

    if (player) {
      player.pause(); // immediate stop of local audio
    }

    if (!synthesizer) {
      setIsSpeaking(false);
      return;
    }

    synthesizer.stopSpeakingAsync(
      () => {
        setIsSpeaking(false);
      },
      (err) => {
        console.error("Stop speaking error:", err);
        setIsSpeaking(false);
      }
    );
  };
  // ---- END TEXT TO SPEECH ----

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

          {/* AUDIO BUTTONS FOR HERO SECTION */}
          <div className="flex flex-wrap gap-3 pt-1">
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

          <div className="flex flex-wrap gap-3 pt-3">
            <Link
              to="/sitemap"
              className="flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-5 py-2 text-xs font-semibold text-slate-700 shadow-md shadow-slate-900/10 transition hover:bg-white/90 dark:border-slate-600/60 dark:bg-slate-900/60 dark:text-slate-200"
            >
              Trail Map
              <FaMapMarkedAlt />
            </Link>
            <Link
              to="/about"
              className="flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-5 py-2 text-xs font-semibold text-slate-700 shadow-md shadow-slate-900/10 transition hover:bg-white/90 dark:border-slate-600/60 dark:bg-slate-900/60 dark:text-slate-200"
            >
              About
              <BsArrowUpRight />
            </Link>
            <Link
              to="/ecology"
              className="flex items-center gap-2 rounded-full border border-white/50 bg-white/55 px-5 py-2 text-xs font-semibold text-slate-700 shadow-md shadow-slate-900/10 transition hover:bg-white/80 dark:border-slate-600/60 dark:bg-slate-900/60 dark:text-slate-200"
            >
              Ecology
              <BsArrowUpRight />
            </Link>
            <Link
              to="/contact"
              className="flex items-center gap-2 rounded-full border border-white/50 bg-white/55 px-5 py-2 text-xs font-semibold text-slate-700 shadow-md shadow-slate-900/10 transition hover:bg-white/80 dark:border-slate-600/60 dark:bg-slate-900/60 dark:text-slate-200"
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/50 bg-white/70 shadow-inner shadow-slate-900/10 dark:border-slate-600/60 dark:bg-slate-900/60">
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
            className="rounded-2xl border border-white/40 bg-white/60 p-4 text-center shadow-inner shadow-slate-900/5 dark:border-slate-700/60 dark:bg-slate-900/55"
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
