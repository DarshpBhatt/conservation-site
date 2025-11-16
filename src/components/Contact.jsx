// Purpose: To display the Contact section of the Woodland Conservation website

import React, { useState, useRef, useEffect } from "react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Footer from "./Footer";

const Contact = () => {
  const [contactReason, setContactReason] = useState("");

  const glassPanel =
    "rounded-3xl border border-white/40 bg-white/60 p-6 shadow-lg shadow-slate-900/10 backdrop-blur-2xl transition-colors duration-300 dark:border-slate-700/60 dark:bg-slate-900/55";

  return (
    <div className="flex flex-col gap-8 text-slate-800 dark:text-slate-100">
      <header className={`${glassPanel} flex flex-col gap-5 md:flex-row md:items-center md:justify-between`}>
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Get in touch</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            We would love to hear from you. Use the form below or connect with us through our social channels to share feedback, volunteer, or plan a visit.
          </p>
        </div>
        <button
          onClick={handleTextToSpeech}
          className="flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-5 py-2 text-sm font-semibold text-emerald-700 shadow-md shadow-slate-900/10 hover:bg-white dark:border-slate-600/60 dark:bg-slate-900/70 dark:text-emerald-200 transition-colors"
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
      </header>

      <section className={`${glassPanel} p-6`}>
        <form className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                label: "Name",
                id: "name",
                type: "text",
                placeholder: "Your name",
                prompt: "Please enter a name",
              },
              {
                label: "Email",
                id: "email",
                type: "email",
                placeholder: "you@example.com",
                prompt: "Please enter an email address",
              },
            ].map(({ label, id, type, placeholder, prompt }) => (
              <div key={id} className="space-y-2">
                <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                  {label}
                </label>
                <input
                  id={id}
                  type={type}
                  placeholder={placeholder}
                  className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm shadow-inner shadow-slate-900/5 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:border-slate-700/60 dark:bg-slate-900/70"
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label htmlFor="reason" className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
              Reason for Contact
            </label>
            <select
              id="reason"
              value={contactReason}
              onChange={(e) => setContactReason(e.target.value)}
              className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm shadow-inner shadow-slate-900/5 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:border-slate-700/60 dark:bg-slate-900/70"
            >
              <option value="">Select a reason...</option>
              <option value="volunteering">Volunteering / Trail Care</option>
              <option value="natural-burial">Natural Burial Inquiries</option>
              <option value="shop">Shop / Product Questions</option>
              <option value="visit">Planning a Visit</option>
              <option value="general">General Questions / Feedback</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
              Message
            </label>
            <textarea
              id="message"
              rows="5"
              placeholder="Share your thoughts or questions"
              className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm shadow-inner shadow-slate-900/5 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:border-slate-700/60 dark:bg-slate-900/70"
            />
          </div>

          <button
            type="button"
            className="w-full rounded-full border border-emerald-500 bg-emerald-500/90 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-500"
            onClick={(e) => {
              e.preventDefault();
              alert("Thank you for your message. We'll get back to you soon!");
            }}
          >
            Send
          </button>
        </form>
      </section>

      <section className={`${glassPanel} grid gap-6 p-6 md:grid-cols-2`}>
        <div>
          <h2 className="text-2xl font-semibold">Direct contacts</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-3">
              <FaPhone className="text-emerald-500" />
              <span>+1 (123) 456-7890</span>
            </div>
            <div className="flex items-center gap-3">
              <FaEnvelope className="text-emerald-500" />
              <span>info@woodlandconservation.ca</span>
            </div>
            <div className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-emerald-500" />
              <span>Halifax, Nova Scotia</span>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Follow us</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Join our community online for event updates, volunteer days, and trail highlights.
          </p>
          <div className="mt-4 flex gap-4">
            {[
              { icon: <FaFacebook />, href: "https://facebook.com" },
              { icon: <FaInstagram />, href: "https://instagram.com" },
              { icon: <FaXTwitter />, href: "https://twitter.com" },
            ].map(({ icon, href }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/50 bg-white/70 text-emerald-600 shadow-inner shadow-slate-900/5 transition hover:bg-white dark:border-slate-600/60 dark:bg-slate-900/60 dark:text-emerald-200"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Contact;
