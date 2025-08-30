"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import CountUp from "react-countup";
import { ArrowRight, Share2, Activity, Cloud, Sparkles } from "lucide-react";
import AnimatedCard from "../ui/AnimatedCard";
import AnimatedBeamCard from "../ui/AnimatedBeamCard";

const stats = [
  { label: "AI-Powered Content Tokens", value: 2500000, suffix: "+" },
  { label: "Content Generation Speed", value: 1.2, suffix: "sec" },
  { label: "Brands Accelerating Growth", value: 900, suffix: "+" },
  { label: "Optimized Social Platforms", value: 7, suffix: "+" },
  { label: "MCP Social Automation", value: 5, suffix: "" },
];

const textMotion = ({ 
  delay = 0, duration = 1.25, startY = -50, startOpacity = 0, endY = 0, endOpacity = 1, easingType = "spring" 
} = {}) => ({
  hidden: { y: startY, opacity: startOpacity },
  show: {
    y: endY, opacity: endOpacity,
    transition: { type: easingType, duration, delay },
  },
});

const textMotionFromLeft = ({ delay = 0, duration = 1.25, startX = -50, startOpacity = 0, endX = 0, endOpacity = 1, easingType = "spring" } = {}) => ({
  hidden: { x: startX, opacity: startOpacity },
  show: { x: endX, opacity: endOpacity, transition: { type: easingType, duration, delay } },
});

const textMotionFromRight = ({ delay = 0, duration = 1.25, startX = 50, startOpacity = 0, endX = 0, endOpacity = 1, easingType = "spring" } = {}) => ({
  hidden: { x: startX, opacity: startOpacity },
  show: { x: endX, opacity: endOpacity, transition: { type: easingType, duration, delay } },
});

export default function HeroSection() {
  const [startCount, setStartCount] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStartCount(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section className="w-full text-white py-24 px-6 md:px-12 -mb-25">
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ fontFamily: "Ancizar Serif, sans-serif" }}
          className="inline-block mb-6 px-6 py-1.5 rounded-full border border-white/20 hover:border-cyan-500 text-sm text-neutral-300"
        >
          🌟 Experience the Future of Quillix AI
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{ fontFamily: "Times New Roman, serif" }}
          className="text-4xl md:text-6xl font-extrabold leading-tight"
        >
          Rise to the Top with{" "}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            NexGen-Quillix
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          style={{ fontFamily: "Ancizar Serif, sans-serif" }}
          className="mt-6 text-lg text-neutral-400 max-w-3xl mx-auto"
        >
          NexGen-Quillix is your AI-powered content engine—built to craft
          high-impact, platform-ready posts for LinkedIn, Instagram, and X in
          seconds. With trend-aware AI, adaptive learning, and MCP integration,
          it creates seamless content that drives growth and engagement.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{ fontFamily: "Ancizar Serif, sans-serif" }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href="#"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition"
          >
            Get Started 🚀 <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#"
            className="px-6 py-3 rounded-xl border border-white/20 text-white font-medium hover:bg-white/10 transition"
          >
            Watch Demo 🎥
          </a>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-6xl mx-auto mt-7 items-stretch">
          <motion.div variants={textMotionFromLeft({ delay: 1.2, duration: 1, startY: -100, easingType: "easeOut" })} initial="hidden" animate="show">
            <AnimatedCard
              icon={<Sparkles size={28} className="text-white" />}
              title="Instant Impact"
              description="Create trend-smart, goal-aligned content in just seconds with NexGen Quillix AI—intelligently auto-optimized for every platform to maximize visibility, reach, engagement, and sustainable brand growth effortlessly."
              className="p-6 -mt-20"
            />
          </motion.div>

          <div className="flex flex-col justify-between gap-6">
            <motion.div variants={textMotion({ delay: 2.8, duration: 1, startY: -100, easingType: "easeOut" })} initial="hidden" animate="show">
              <AnimatedBeamCard
                icon={<Activity className="text-white" size={28} />}
                title="Performance Optimized"
                description="AI-powered speed delivers fast, precise content without compromise."
                beamColorFrom="#06b6d4"
              />
            </motion.div>
            <motion.div variants={textMotion({ delay: 3.2, duration: 1, startY: -100, easingType: "easeOut" })} initial="hidden" animate="show">
              <AnimatedBeamCard
                icon={<Share2 className="text-white" size={28} />}
                title="Effortless Automation"
                description="Simplify content creation with unified AI-driven scheduling and publishing."
                beamColorFrom="#06b6d4"
                beamColorTo="#06b6d4"
              />
            </motion.div>
          </div>

          <motion.div variants={textMotionFromRight({ delay: 1.8, duration: 1, startY: -100, easingType: "easeOut" })} initial="hidden" animate="show">
            <AnimatedCard
              icon={<Cloud size={36} className="text-white" />}
              title="MCP Social Automation"
              description="Unlock full-scale automation with NexGen Quillix—streamlining content creation, scheduling, and multi-platform publishing through MCP for effortless, goal-driven growth."
              className="p-6 -mt-20"
            />
          </motion.div>
        </div>

        <div
          ref={statsRef}
          className="mt-16 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 text-center"
        >
          {stats.map((stat, i) => (
            <div key={i}>
                {typeof stat.value === "number" && stat.value < 10 ? "" : "+"}
                style={{ fontFamily: "Ancizar Serif, sans-serif" }}
                className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
              >
                {startCount ? (
                  <CountUp
                    end={stat.value}
                    duration={3.5}
                    separator=","
                    decimals={stat.value % 1 !== 0 ? 1 : 0}
                  />
                ) : (
                  "0"
                )}
                {stat.suffix}
              </p>
              <p
                style={{ fontFamily: "Ancizar Serif, sans-serif" }}
                className="text-md text-neutral-400 mt-2"
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
