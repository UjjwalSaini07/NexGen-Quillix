"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { TrendingUp, Brain, Zap, Cpu, Layers, Share } from "lucide-react";

const features = [
  {
    icon: <TrendingUp className="w-6 h-6 text-white" />,
    title: "Real-Time Trend Analysis",
    desc: "Stay ahead with AI that identifies trending topics and ensures your content is always relevant and high-impact.",
  },
  {
    icon: <Brain className="w-6 h-6 text-white" />,
    title: "Adaptive Tone & Style",
    desc: "Quillix AI learns your brand voice and audience preferences, delivering content that feels authentic and engaging every time.",
  },
  {
    icon: <Zap className="w-6 h-6 text-white" />,
    title: "Instant Content Generation",
    desc: "Create ready-to-post content for LinkedIn, Instagram, X, and more in seconds—eliminating creative blocks and saving valuable time.",
  },
  {
    icon: <Cpu className="w-6 h-6 text-white" />,
    title: "MCP Platform Integration",
    desc: "Automate publishing, monitor performance, and streamline campaigns end-to-end for maximum efficiency and reach.",
  },
  {
    icon: <Layers className="w-6 h-6 text-white" />,
    title: "Platform-Smart Optimization",
    desc: "Content auto-optimized for each platform, ensuring maximum engagement wherever your audience is active.",
  },
  {
    icon: <Share className="w-6 h-6 text-white" />,
    title: "Cross-Channel Analytics",
    desc: "Receive actionable insights on engagement, audience behavior, and growth opportunities across all platforms.",
  },
  {
    icon: <Zap className="w-6 h-6 text-white" />,
    title: "AI-Powered Recommendations",
    desc: "Get smart suggestions to boost reach, interaction, and content effectiveness for every post.",
  },
];

export default function FeaturesMarquee() {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.scrollWidth / 2);
    }
  }, []);

  return (
    <section className="relative w-full overflow-hidden py-20 bg-black -mb-20">
      <div className="text-center mb-12">
        <h2
          style={{ fontFamily: "Times New Roman, sans-serif" }}
          className="text-4xl md:text-5xl font-extrabold text-white"
        >
          Enterprise-Grade{" "}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Features
          </span>
        </h2>
        <p
          style={{ fontFamily: "Ancizar Serif, sans-serif" }}
          className="text-neutral-400 mt-4 max-w-2xl mx-auto"
        >
          Designed for professionals who demand speed, precision, and results. Every feature is engineered for maximum impact and effortless automation.
        </p>
      </div>

      <div className="relative flex overflow-hidden">
        <motion.div
          ref={containerRef}
          className="flex gap-6"
          animate={{ x: [-width, 0] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 50,
              ease: "linear",
            },
          }}
        >
          {[...features, ...features].map((feature, i) => (
            <div
              key={i}
              className="min-w-[300px] max-w-[300px] p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl shadow-lg flex flex-col gap-4
                hover:shadow-cyan-500/50 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600">
                {feature.icon}
              </div>
              <h3 className="text-white font-semibold text-lg">{feature.title}</h3>
              <p className="text-neutral-300 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
