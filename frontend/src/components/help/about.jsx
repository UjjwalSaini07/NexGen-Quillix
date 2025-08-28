"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const textVariant = (delay) => ({
  hidden: { y: 30, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", duration: 1.2, delay },
  },
});

export default function About() {
  return (
    <section
      id="about"
      className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-16"
    >
      <div className="absolute top-20 left-10 w-40 h-40 bg-cyan-500/40 rounded-full blur-3xl opacity-40 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-52 h-52 bg-cyan-400/30 rounded-full blur-3xl opacity-50 animate-pulse"></div>

      <div className="relative text-center mb-16">
        <motion.div variants={textVariant(0.2)} initial="hidden" animate="show">
          <h2
            style={{ fontFamily: "Orbitron, sans-serif" }}
            className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight"
          >
            Experience the Future of{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
              Quillix AI
            </span>{" "}
            🌟
          </h2>
        </motion.div>

        <motion.div variants={textVariant(0.6)} initial="hidden" animate="show">
          <p
            style={{ fontFamily: "Merriweather, serif" }}
            className="text-md md:text-lg text-neutral-200 mt-6 max-w-3xl mx-auto opacity-90"
          >
            NexGen-Quillix is your AI-powered content creation engine—designed
            to craft high-impact, platform-ready posts for LinkedIn, Instagram,
            X (Twitter), and beyond. It adapts to your tone, industry, and goals
            while analyzing real-time trends—so your voice is always relevant
            and engaging.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <motion.div variants={textVariant(1)} initial="hidden" animate="show">
          <div className="p-8 bg-neutral-900/60 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-lg text-center hover:shadow-cyan-500/30 transition-transform transform hover:-translate-y-2">
            <h3
              style={{ fontFamily: "Cormorant Upright, serif" }}
              className="text-2xl font-bold text-white"
            >
              Trend-Aware Content
            </h3>
            <p
              style={{ fontFamily: "Merriweather, serif" }}
              className="mt-3 text-neutral-300"
            >
              Stay ahead with AI that taps into real-time insights to generate
              posts that resonate with your audience.
            </p>
          </div>
        </motion.div>

        <motion.div variants={textVariant(1.3)} initial="hidden" animate="show">
          <div className="p-8 bg-neutral-900/60 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-lg text-center hover:shadow-cyan-500/30 transition-transform transform hover:-translate-y-2">
            <h3
              style={{ fontFamily: "Cormorant Upright, serif" }}
              className="text-2xl font-bold text-white"
            >
              Adaptive Tone
            </h3>
            <p
              style={{ fontFamily: "Merriweather, serif" }}
              className="mt-3 text-neutral-300"
            >
              Whether you want professional, witty, or inspiring—Quillix adjusts
              the language to match your unique brand voice.
            </p>
          </div>
        </motion.div>

        <motion.div variants={textVariant(1.6)} initial="hidden" animate="show">
          <div className="p-8 bg-neutral-900/60 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-lg text-center hover:shadow-cyan-500/30 transition-transform transform hover:-translate-y-2">
            <h3
              style={{ fontFamily: "Cormorant Upright, serif" }}
              className="text-2xl font-bold text-white"
            >
              Cross-Platform Ready
            </h3>
            <p
              style={{ fontFamily: "Merriweather, serif" }}
              className="mt-3 text-neutral-300"
            >
              Generate optimized posts for LinkedIn, Instagram, and X—all
              formatted perfectly and ready to publish instantly.
            </p>
          </div>
        </motion.div>
      </div>

      <div className="mt-20 text-center">
<motion.div variants={textVariant(2)} initial="hidden" animate="show">
  <h3
    style={{ fontFamily: "Times New Roman, serif" }}
    className="text-4xl font-bold text-white"
  >
    Let AI Handle the Heavy Lifting
  </h3>
</motion.div>

<motion.div variants={textVariant(2.3)} initial="hidden" animate="show">
  <p
    style={{ fontFamily: "Merriweather, serif" }}
    className="mt-5 text-lg text-neutral-200 max-w-3xl mx-auto leading-relaxed"
  >
    Focus on growth, strategy, and creativity while{" "}
    <span className="text-cyan-400 font-semibold">Quillix AI</span> automates
    the rest. From generating high-quality, trend-aware content to ensuring it
    aligns perfectly with your brand’s unique voice, Quillix takes care of the
    heavy lifting behind the scenes.{" "}
    <br />
    <br />
    But we don’t stop at content creation—our platform also integrates with{" "}
    <span className="text-cyan-400 font-semibold">MCP Server</span>, enabling
    end-to-end automation across your social platforms. With a single click,
    your posts can be created, optimized, and delivered directly to your
    audience, all powered by the intelligence of Quillix AI.{" "}
    <br />
    <br />
    The result? A seamless, AI-driven workflow that empowers you to connect,
    engage, and scale your digital presence—without the manual grind.
  </p>
</motion.div>


        <motion.div variants={textVariant(2.6)} initial="hidden" animate="show">
          <div className="mt-8">
            <Link
              href="/linkedin"
              style={{ fontFamily: "Almendra, serif" }}
              className="inline-block px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full shadow-lg transition-transform transform hover:scale-110 hover:shadow-cyan-500/40"
            >
              Get Started
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="mt-16 text-center text-sm text-neutral-500">
        <p className="inline-flex items-center gap-1 transition-colors duration-300">
          <span className="text-neutral-500">Developed with {" "}</span>
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
