"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Marketing Director",
    company: "TechFlow Inc.",
    feedback:
      "NexGen-Quillix transformed our content strategy completely. We've seen a 300% increase in engagement across all platforms. The AI truly understands our brand voice.",
    initials: "SC",
  },
  {
    name: "Marcus Rodriguez",
    role: "Serial Entrepreneur",
    company: "Founder of 3 Startups",
    feedback:
      "As someone juggling multiple ventures, this tool is a lifesaver. I can maintain active social presence across all my businesses without the time investment.",
    initials: "MR",
  },
  {
    name: "Emily Watson",
    role: "Content Creator",
    company: "500K+ Followers",
    feedback:
      "The trend analysis feature is incredible. My posts are always relevant and timely. It's like having a crystal ball for social media trends.",
    initials: "EW",
  },
  {
    name: "David Lee",
    role: "Growth Strategist",
    company: "ScaleUp Agency",
    feedback:
      "Quillix AI cut down our campaign planning time drastically. Now we focus on creativity while AI handles optimization.",
    initials: "DL",
  },
];

export default function TestimonialsMarquee() {
  const containerRef = useRef(null);
  useEffect(() => {
    if (containerRef.current) {
      const children = Array.from(containerRef.current.children);
      children.forEach((child) => {
        const clone = child.cloneNode(true);
        containerRef.current.appendChild(clone);
      });
    }
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-neutral-950 py-20">
      <div className="text-center mb-12">
        <h2 style={{ fontFamily: "Times New Roman, sans-serif" }} className="text-4xl md:text-5xl font-extrabold text-white">
          Loved by{" "}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Creators Worldwide
          </span>
        </h2>
        <p style={{ fontFamily: "Ancizar Serif, sans-serif" }} className="text-neutral-400 mt-4 max-w-2xl mx-auto">
          Join thousands of marketers, entrepreneurs, and creators who've transformed their content strategy with NexGen-Quillix, unlocking smarter workflows and lasting growth.
        </p>
      </div>

      <div className="relative flex overflow-hidden">
        <motion.div
          ref={containerRef}
          className="flex gap-6"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            duration: 40,
            ease: "linear",
          }}
        >
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="min-w-[350px] max-w-[350px] p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl shadow-lg"
            >
              <div className="text-cyan-400 text-3xl mb-4">❝</div>

              <p style={{ fontFamily: "Ancizar Serif, sans-serif" }} className="text-neutral-200 text-base leading-relaxed mb-6">
                {t.feedback}
              </p>

              <div className="h-px bg-white/10 mb-4"></div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                  {t.initials}
                </div>
                <div>
                  <p style={{ fontFamily: "Ancizar Serif, sans-serif" }} className="text-white font-semibold">{t.name}</p>
                  <p style={{ fontFamily: "Ancizar Serif, sans-serif" }} className="text-neutral-400 text-sm">{t.role}</p>
                  <p style={{ fontFamily: "Ancizar Serif, sans-serif" }} className="text-cyan-400 text-xs">{t.company}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
