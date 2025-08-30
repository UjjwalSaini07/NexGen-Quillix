"use client";

import { motion } from "framer-motion";
import { Users, Rocket, PenTool, Briefcase } from "lucide-react";

const features = [
  {
    icon: <Users className="w-6 h-6 text-white" />,
    title: "Marketers",
    subtitle: "Smarter Campaigns, Less Effort",
    desc: "Amplify your brand presence with AI-powered campaigns that deliver consistent messaging, optimized performance, and measurable impact—across LinkedIn, Instagram, X, and beyond.",
    points: [
      "Platform-specific content optimization",
      "Always-on, on-brand messaging",
      "Automated end-to-end campaign flows",
      "Real-time performance insights & analytics",
    ],
    cta: "Empower Marketing",
  },
  {
    icon: <Rocket className="w-6 h-6 text-white" />,
    title: "Entrepreneurs",
    subtitle: "Build Authority & Influence Fast",
    desc: "Establish yourself as a thought leader with intelligent content that reflects your expertise, sparks meaningful conversations, and grows your professional influence.",
    points: [
      "Tailored personal branding strategies",
      "Industry-relevant insights delivered at scale",
      "High-engagement content for visibility",
      "Network-expanding, credibility-building posts",
    ],
    cta: "Launch Growth",
  },
  {
    icon: <PenTool className="w-6 h-6 text-white" />,
    title: "Content Creators",
    subtitle: "Engage, Inspire & Expand Reach",
    desc: "Tap into trend-aware, viral-ready content ideas designed to resonate deeply with your community, fuel conversations, and accelerate audience growth.",
    points: [
      "AI-driven, never-ending content inspiration",
      "Boosted audience engagement strategies",
      "Effortless cross-platform publishing",
      "Growth-focused performance analytics",
    ],
    cta: "Start Creating",
  },
  {
    icon: <Briefcase className="w-6 h-6 text-white" />,
    title: "Agencies",
    subtitle: "Deliver More, Scale Seamlessly",
    desc: "Manage multiple clients effortlessly with adaptive AI that mirrors each unique brand voice, enabling high-quality output at scale without added complexity.",
    points: [
      "Multi-client, multi-brand workflows",
      "White-label solutions for agencies",
      "Bulk content generation in seconds",
      "Smart, automated client reporting",
    ],
    cta: "Scale Clients",
  },
];

export default function FeaturesSection() {
  return (
    <section className="relative w-full py-20 px-6 md:px-12 lg:px-20 -mb-20">
      <div className="text-center mb-16">
        <h2
          className="text-4xl md:text-5xl font-extrabold text-white"
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          Built for{" "}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Every Modern Visionary
          </span>
        </h2>
        <p
          className="text-neutral-300 mt-4 max-w-2xl mx-auto text-lg leading-relaxed"
          style={{ fontFamily: "Ancizar Serif, sans-serif" }}
        >
          Visionaries don’t just create content—they build movements. Whether
          you’re a <span className="text-white font-semibold">marketer</span>,{" "}
          <span className="text-white font-semibold">entrepreneur</span>,{" "}
          <span className="text-white font-semibold">creator</span>, or{" "}
          <span className="text-white font-semibold">agency</span>,{" "}
          <span className="text-cyan-400 font-semibold">Quillix AI</span> is
          your partner. It adapts to your voice, amplifies your impact, and
          helps you scale smarter—without losing authenticity.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.2 }}
            viewport={{ once: true }}
            className="rounded-2xl p-8 bg-black/40 border border-white/10 backdrop-blur-xl shadow-lg hover:shadow-cyan-500/30 hover:border-cyan-400/30 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
                {f.icon}
              </div>
              <div>
                <h3
                  className="text-2xl font-semibold text-white"
                  style={{ fontFamily: "Times New Roman, serif" }}
                >
                  {f.title}
                </h3>
                <p className="text-cyan-400 text-sm">{f.subtitle}</p>
              </div>
            </div>

            <p
              className="text-neutral-300 text-md leading-relaxed mb-6"
              style={{ fontFamily: "Ancizar Serif, sans-serif" }}
            >
              {f.desc}
            </p>

            <ul className="text-neutral-300 text-md space-y-2 mb-6">
              {f.points.map((p, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 leading-relaxed"
                  style={{ fontFamily: "Ancizar Serif, sans-serif" }}
                >
                  <span className="text-cyan-400">•</span> {p}
                </li>
              ))}
            </ul>

            <button
              className="w-full px-5 py-2 rounded-lg bg-black/60 border border-white/10 text-white font-medium text-sm hover:border-cyan-500 hover:text-cyan-400 transition"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              {f.cta}
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
