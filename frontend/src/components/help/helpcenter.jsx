"use client";

import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";
import {
  PiNumberOneBold,
  PiNumberTwoBold,
  PiNumberThreeBold,
  PiNumberFourBold,
} from "react-icons/pi";

const textVariant = (delay) => ({
  hidden: { y: -40, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", duration: 1.2, delay },
  },
});

const contentSteps = [
  {
    title: "Choose Your Platform",
    description:
      "Pick LinkedIn, X, Instagram, Facebook, or YouTube. Each unlocks tailored fields instantly.",
    icon: <PiNumberOneBold className="text-white text-[1.8rem]" />,
  },
  {
    title: "Add Prompt & Preferences",
    description:
      "Enter your prompt, then select template, tone, other fields, and generation style.",
    icon: <PiNumberTwoBold className="text-white text-[1.8rem]" />,
  },
  {
    title: "Generate & Refine",
    description:
      "Quillix AI creates platform-ready drafts. Edit or regenerate until perfectly aligned.",
    icon: <PiNumberThreeBold className="text-white text-[1.8rem]" />,
  },
  {
    title: "Finalize & Schedule",
    description:
      "Approve, schedule, and save variants for multiple platforms in one flow.",
    icon: <PiNumberFourBold className="text-white text-[1.8rem]" />,
  },
];

const mcpSteps = [
  {
    title: "Connect via MCP Server",
    description:
      "Securely link accounts with API keys. Quillix never posts unauthorized content.",
    icon: <PiNumberOneBold className="text-white text-[1.8rem]" />,
  },
  {
    title: "Map Platforms & Rules",
    description:
      "Select accounts, set posting windows, and configure per-platform automation rules.",
    icon: <PiNumberTwoBold className="text-white text-[1.8rem]" />,
  },
  {
    title: "Automate Delivery",
    description:
      "Content flows through MCP directly to platforms—no manual uploads required.",
    icon: <PiNumberThreeBold className="text-white text-[1.8rem]" />,
  },
  {
    title: "Monitor & Iterate",
    description:
      "Track results, adjust prompts, and refine scheduling for continuous improvement.",
    icon: <PiNumberFourBold className="text-white text-[1.8rem]" />,
  },
];

export default function HelpCenter() {
  useEffect(() => {
    AOS.init({
      offset: 100,
      delay: 10,
      duration: 2000,
      easing: "ease",
      once: false,
    });
  }, []);

  return (
    <section
      id="help-center"
      className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-16"
    >
      <div className="absolute top-10 left-10 w-24 h-24 bg-cyan-500 rounded-full blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-10 right-10 w-28 h-28 bg-cyan-600 rounded-full blur-2xl opacity-40 animate-pulse" />

      <div className="text-center mb-16 relative">
        <motion.div variants={textVariant(0.3)} initial="hidden" animate="show">
          <h2
            style={{ fontFamily: "Orbitron, sans-serif" }}
            className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight"
          >
            How It Works —{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
              Quillix Help Center
            </span>
          </h2>
        </motion.div>

        <motion.div variants={textVariant(0.7)} initial="hidden" animate="show">
          <p
            style={{ fontFamily: "Merriweather, serif" }}
            className="text-lg text-neutral-200 mt-6 max-w-3xl mx-auto opacity-90"
          >
            Two streamlined guides: generate platform-perfect content with
            Quillix AI, then automate delivery across your social accounts via
            MCP Server integration.
          </p>
        </motion.div>

        <motion.div variants={textVariant(1)} initial="hidden" animate="show">
          <div className="mt-4 h-1 w-20 mx-auto bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full" />
        </motion.div>
      </div>

      {/* --- Section 1: Content Creation Guide --- */}
      <div className="grid lg:grid-cols-2 items-center gap-12 mb-24">
        <motion.div variants={textVariant(1.2)} initial="hidden" animate="show">
          <div className="relative">
            <img
              src="https://meanit.ie/wp-content/uploads/2021/12/AI-Content-Creation-Machine-Learning.jpg"
              alt="Content creation flow"
              className="rounded-2xl shadow-xl w-full h-auto object-cover object-center transition-all duration-700 transform hover:scale-105"
            />
            <div className="absolute -top-4 -right-4 w-14 h-14 bg-cyan-400 rounded-full opacity-75 blur-lg animate-pulse"></div>
          </div>
          <h3
            style={{ fontFamily: "Ancizar Serif, sans-serif" }}
            className="mt-6 text-3xl font-bold text-center text-gray-200"
          >
            Content Creation Guide
          </h3>
          <p
            style={{ fontFamily: "Merriweather, serif" }}
            className="mt-2 text-center text-neutral-300 max-w-xl mx-auto"
          >
            Generate posts for LinkedIn, X, Instagram, Facebook, and YouTube.
            Provide a prompt, select template & tone, choose generation method,
            add special events, and use platform-specific fields.
          </p>
        </motion.div>

        <div className="space-y-10 relative">
          <div className="absolute left-5 top-0 h-full w-1 bg-gradient-to-b from-cyan-500 to-cyan-600 rounded-full opacity-50"></div>

          {contentSteps.map((step, index) => (
            <motion.div
              key={`content-${index}`}
              variants={textVariant(1.2 + index * 0.2)}
              initial="hidden"
              animate="show"
              className="flex items-center gap-6 text-white group"
            >
              <div className="w-12 h-12 flex items-center z-10 justify-center bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full shadow-lg transform transition-all group-hover:scale-110">
                {step.icon}
              </div>
              <div className="transition-all duration-300 group-hover:translate-x-2">
                <h4
                  style={{ fontFamily: "Cormorant Upright, sans-serif" }}
                  className="text-2xl font-semibold mb-1"
                >
                  {step.title}
                </h4>
                <p
                  style={{ fontFamily: "Ancizar Serif, sans-serif" }}
                  className="opacity-90"
                >
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}

          <div className="mt-6 pl-5 text-center">
            <button className="transform hover:scale-110 justify-center align-items-center transition-transform duration-300 shadow-xl">
              <a
                href="/"
                style={{ fontFamily: "Playfair Display SC, sans-serif" }}
                className="inline-block bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-cyan-500/40 transition-all duration-300"
              >
                Start Creating
              </a>
            </button>
          </div>
        </div>
      </div>

      {/* --- Section 2: MCP Server Integration Guide --- */}
      <div className="grid lg:grid-cols-2 items-center gap-12">
        <div className="order-2 lg:order-1 space-y-10 relative">
          <div className="absolute left-5 top-0 h-full w-1 bg-gradient-to-b from-cyan-500 to-cyan-600 rounded-full opacity-80"></div>

          {mcpSteps.map((step, index) => (
            <motion.div
              key={`mcp-${index}`}
              variants={textVariant(1.2 + index * 0.2)}
              initial="hidden"
              animate="show"
              className="flex items-center gap-6 text-white group"
            >
              <div className="w-12 h-12 flex items-center justify-center z-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full shadow-lg transform transition-all group-hover:scale-110">
                {step.icon}
              </div>
              <div className="transition-all duration-300 group-hover:translate-x-2">
                <h4
                  style={{ fontFamily: "Cormorant Upright, sans-serif" }}
                  className="text-2xl font-semibold mb-1"
                >
                  {step.title}
                </h4>
                <p
                  style={{ fontFamily: "Ancizar Serif, sans-serif" }}
                  className="opacity-90"
                >
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}

          <div className="mt-6 pl-5 text-center">
            <button className="transform hover:scale-110 justify-center transition-transform duration-300 shadow-xl">
              <a
                href="/"
                style={{ fontFamily: "Playfair Display SC, sans-serif" }}
                className="inline-block bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-cyan-500/40 transition-all duration-300"
              >
                Integrate MCP
              </a>
            </button>
          </div>
        </div>

        <motion.div
          variants={textVariant(1.2)}
          initial="hidden"
          animate="show"
          className="order-1 lg:order-2"
        >
          <div className="relative">
            <img
              src="https://www.knowledgenile.com/wp-content/uploads/2024/11/AI-social-media-1.jpg"
              alt="MCP integration flow"
              className="rounded-2xl shadow-xl w-full h-auto object-cover object-center transition-all duration-700 transform hover:scale-105"
            />
            <div className="absolute -bottom-4 -left-4 w-14 h-14 bg-cyan-400 rounded-full opacity-75 blur-lg animate-pulse"></div>
          </div>
          <h3
            style={{ fontFamily: "Ancizar Serif, sans-serif" }}
            className="mt-6 text-3xl font-bold text-center text-gray-200"
          >
            MCP Server Integration Guide
          </h3>
          <p
            style={{ fontFamily: "Merriweather, serif" }}
            className="mt-2 text-center text-neutral-300 max-w-xl mx-auto"
          >
            Users provide API keys so Quillix can automate publishing to your
            connected social platforms—securely and hands-free.
          </p>
        </motion.div>
      </div>

      <div className="text-center text-sm text-neutral-500 -mt-4 md:mt-16">
        <p className="inline-flex items-center gap-1 transition-colors duration-300">
          <span className="text-neutral-500">Developed with{" "}</span>
          <span className="animate-pulse text-red-700">❤️</span>
          <span className="text-neutral-500">by{" "}</span>
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
    </section>
  );
}
