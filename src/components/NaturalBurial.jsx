// Purpose: Natural Burial page component with Azure TTS support

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaLeaf,
  FaTree,
  FaFeatherAlt,
  FaCloudSun,
  FaHandsHelping,
  FaPeace,
} from "react-icons/fa";
import { IoVolumeHigh, IoVolumeOff } from "react-icons/io5";
import ttsData from "../data/tts.json";
import Footer from "./Footer";
import { speakText, stopSpeech } from "../utils/azureTTS";

const glassPanel =
  "rounded-3xl border border-white/40 bg-white/60 shadow-lg shadow-slate-900/12 backdrop-blur-2xl transition-colors duration-300 dark:border-slate-700/60 dark:bg-slate-900/55";

export default function NaturalBurial() {
  const [isPlaying, setIsPlaying] = useState(false);
  const synthRef = useRef(null);


  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        stopSpeech(synthRef.current);
        synthRef.current = null;
      }
    };
  }, []);

  const cards = [
    {
      title: "Helping Nature",
      icon: <FaLeaf className="text-emerald-600 dark:text-emerald-300 text-4xl" />,
      img: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
      description: ttsData.naturalBurial.helpingNature,
      extraNote:
        "This is about caring for the land, not only for today, but for many years after.",
    },
    {
      title: "The Forest in St. Margaret's Bay",
      icon: <FaTree className="text-emerald-600 dark:text-emerald-300 text-4xl" />,
      img: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&h=600&fit=crop",
      description: ttsData.naturalBurial.forest,
      extraNote:
        "The site is meant to stay wild, not turn into roads and stone walls.",
    },
    {
      title: "A Peaceful Resting Place",
      icon: (
        <FaFeatherAlt className="text-emerald-600 dark:text-emerald-300 text-4xl" />
      ),
      img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop",
      description: ttsData.naturalBurial.peacefulPlace,
      extraNote:
        "It is quiet. It is respectful. It is kind to the Earth and kind to people.",
    },
  ];

  const benefits = [
    {
      title: "Kind to the Earth",
      icon: <FaCloudSun className="text-xl text-emerald-700 dark:text-emerald-300" />,
      text: "No harsh fluids, no heavy building. Less waste. Less damage. The body returns to the soil in a natural way.",
    },
    {
      title: "Simple and Honest",
      icon: <FaPeace className="text-xl text-emerald-700 dark:text-emerald-300" />,
      text: "The idea is not fancy. It is calm. It is about love, memory, and real connection to land.",
    },
    {
      title: "Helps the Community",
      icon: (
        <FaHandsHelping className="text-xl text-emerald-700 dark:text-emerald-300" />
      ),
      text: "This kind of burial can support local conservation. The land can stay safe instead of being sold and changed.",
    },
  ];

  const handleTextToSpeech = () => {
    if (isPlaying && synthRef.current) {
      stopSpeech(synthRef.current);
      synthRef.current = null;
      setIsPlaying(false);
    } else {
      const fullText = `${ttsData.naturalBurial.intro} ${ttsData.naturalBurial.helpingNature} ${ttsData.naturalBurial.forest} ${ttsData.naturalBurial.peacefulPlace} ${ttsData.naturalBurial.benefits}`;
      synthRef.current = speakText(
        fullText,
        () => {
          synthRef.current = null;
          setIsPlaying(false);
        },
        () => {
          synthRef.current = null;
          setIsPlaying(false);
        }
      );
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex flex-col gap-8 text-slate-800 dark:text-slate-100">
      {/* HEADER SECTION */}
      <motion.section
        className={`${glassPanel} p-6 md:p-8`}
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-semibold text-emerald-700 dark:text-emerald-300 mb-4">
              Natural Burial
            </h1>
            <p className="text-base md:text-lg leading-relaxed text-slate-700 dark:text-slate-200">
              Natural burial is a simple, Earth-friendly way to be laid to rest.
              There is no concrete, no metal casket, and no heavy use of chemicals.
              The body returns to the land in a natural way. The burial space looks
              and feels like part of the forest, not like a normal city cemetery.
              The goal is to protect the land and keep it alive for the future. At
              the St. Margaret's Bay Woodland Conservation Site, the idea is to make
              a calm place that respects people, and also respects nature.
            </p>
          </div>
          <button
            onClick={handleTextToSpeech}
            className="flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-5 py-2.5 text-sm font-semibold text-emerald-700 shadow-md shadow-slate-900/10 hover:bg-white/90 dark:border-slate-600/60 dark:bg-slate-900/70 dark:text-emerald-200 transition-colors"
          >
            {isPlaying ? (
              <>
                <IoVolumeOff />
                Stop
              </>
            ) : (
              <>
                <IoVolumeHigh />
                Listen
              </>
            )}
          </button>
        </div>
      </motion.section>

      {/* IMAGE CARDS SECTION */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            className={`${glassPanel} p-5 flex flex-col transition-all hover:shadow-2xl hover:-translate-y-1`}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
          >
            <div className="relative w-full h-48 rounded-xl overflow-hidden group cursor-pointer mb-4">
              <img
                src={card.img}
                alt={card.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/800x600/16a34a/ffffff?text=" +
                    encodeURIComponent(card.title);
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-medium flex items-center gap-2">
                  <IoVolumeHigh />
                  Tap to hear about: {card.title}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 mb-4">
              {card.icon}
              <h2 className="text-xl font-semibold text-emerald-700 dark:text-emerald-300 text-center">
                {card.title}
              </h2>
            </div>

            <p className="text-sm md:text-base text-slate-700 dark:text-slate-200 mb-3 leading-relaxed text-center flex-1">
              {card.description.trim()}
            </p>

            <p className="text-xs text-slate-500 dark:text-slate-400 italic text-center">
              {card.extraNote}
            </p>
          </motion.div>
        ))}
      </section>

      {/* BENEFITS SECTION */}
      <motion.section
        className={`${glassPanel} p-6 md:p-8`}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl md:text-3xl font-semibold text-center text-emerald-700 dark:text-emerald-300 mb-6">
          Why Natural Burial Matters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {benefits.map((b, i) => (
            <div key={i} className="text-center flex flex-col items-center px-4">
              <div className="flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/40 rounded-full w-12 h-12 shadow-md mb-4">
                {b.icon}
              </div>
              <div className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
                {b.title}
              </div>
              <div className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {b.text}
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-slate-700 dark:text-slate-300 text-base md:text-lg leading-relaxed mt-8 md:mt-10">
          This place is not only for today. It is for the future. The idea is to
          protect a living forest in Nova Scotia so that families, visitors,
          animals, and plants can all share it with care. Natural burial is part
          of that promise.
        </p>
      </motion.section>

      <Footer />
    </div>
  );
}

