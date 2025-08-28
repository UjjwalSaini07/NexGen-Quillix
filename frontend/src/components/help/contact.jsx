"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const textVariant = (delay) => ({
  hidden: { y: 30, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", duration: 1.2, delay },
  },
});

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://static-bundles.visme.co/forms/vismeforms-embed.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      setIsLoading(false);
      toast.dismiss(toastId);
    };

    return () => {
      document.body.removeChild(script);
      toast.dismiss(toastId);
    };
  }, []);

  return (
    <section
      id="contact"
      className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-20"
    >
      <div className="absolute top-8 right-10 w-56 h-56 bg-cyan-400/30 rounded-full blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute top-8 left-10 w-46 h-46 bg-cyan-500/40 rounded-full blur-3xl opacity-40 animate-pulse"></div>

      <div className="relative text-center mb-16">
        <motion.div variants={textVariant(0.2)} initial="hidden" animate="show">
          <h2
            style={{ fontFamily: "Orbitron, sans-serif" }}
            className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight"
          >
            Let’s <span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">Connect</span> 🌐
          </h2>
        </motion.div>

        <motion.div variants={textVariant(0.6)} initial="hidden" animate="show">
          <p
            style={{ fontFamily: "Merriweather, serif" }}
            className="text-md md:text-lg text-neutral-200 mt-6 max-w-3xl mx-auto opacity-90 -mb-8"
          >
            Have questions, feedback, or ideas? We’d love to hear from you. Whether you’re exploring collaboration, need support, or simply want to learn how Quillix AI can help, our team is here to assist. Drop us a message through the form, and we’ll respond promptly.
          </p>
        </motion.div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center mt-12 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-cyan-500"></div>
          <p className="text-lg font-semibold text-neutral-400">Loading Contact Form...</p>
        </div>
      )}

      <motion.div
        variants={textVariant(1)}
        initial="hidden"
        animate="show"
        className={`relative z-10 ${isLoading ? "hidden" : "block"}`}
      >
        <div
          className="visme_d"
          data-title="Quillix-Contact Form"
          data-url="nmnw1do7-quillix-contact-form"
          data-domain="forms"
          data-full-page="false"
          data-min-height="500px"
          data-form-id="142990"
        ></div>
      </motion.div>

      <motion.div variants={textVariant(1.4)} initial="hidden" animate="show">
        <div className="mt-16 text-center text-sm text-neutral-500">
          <p className="inline-flex items-center gap-1">
            <span className="text-neutral-500">Developed with </span>
            <span className="animate-pulse text-red-600">❤️</span>
            <span className="text-neutral-500"> by </span>
            <a
              href="https://ujjwalsaini.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-cyan-500 hover:text-cyan-400 hover:underline underline-offset-4 transition-all duration-300"
            >
              UjjwalS
            </a>
            <span className="animate-pulse text-cyan-400">✦</span>
          </p>
        </div>
      </motion.div>
    </section>
  );
}
