"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, Bot, MessageSquare, Globe } from "lucide-react";
import { FaArrowRightLong } from "react-icons/fa6";
import { SiTicktick } from "react-icons/si";
import { RiAiGenerate2, RiCalendarScheduleLine } from "react-icons/ri";
import { IoPersonAdd } from "react-icons/io5";

const features = [
  {
    icon: <Bot className="w-7 h-7 text-cyan-400" />,
    title: "AI Post Generation",
    description:
      "Generate engaging content automatically with AI that adapts to your brand tone and audience.",
  },
  {
    icon: <Calendar className="w-7 h-7 text-cyan-400" />,
    title: "Smart Scheduling",
    description:
      "Maximize reach with intelligent timing across all platforms—no guesswork, only results.",
  },
  {
    icon: <MessageSquare className="w-7 h-7 text-cyan-400" />,
    title: "Auto Messaging",
    description:
      "Engage your followers with contextual AI-powered responses and streamlined conversations.",
  },
  {
    icon: <Globe className="w-7 h-7 text-cyan-400" />,
    title: "5+ Platforms",
    description:
      "Connect Instagram, Twitter, LinkedIn, TikTok, and more with seamless automation.",
  },
];

export default function AutomationSection() {
  return (
    <section className="relative w-full py-24 px-6 md:px-12 bg-black text-white">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          style={{ fontFamily: "Times New Roman, serif" }}
          className="text-4xl md:text-5xl font-extrabold leading-tight"
        >
          Automate Your{" "}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Social Media
          </span>{" "}
          Completely
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          viewport={{ once: true }}
          className="mt-6 text-lg text-neutral-400 max-w-3xl mx-auto"
          style={{ fontFamily: "Ancizar Serif, sans-serif" }}
        >
          From AI-powered post generation to smart scheduling and automated
          messaging—experience seamless{" "}
          <span className="text-cyan-400 font-medium">
            hustle-free social media automation
          </span>{" "}
          across 5+ platforms with MCP server integration.
        </motion.p>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="p-6 bg-gradient-to-b from-neutral-900 to-neutral-950 rounded-2xl border border-white/10 hover:border-cyan-500/40 transition-all shadow-lg"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 mx-auto mb-5">
                {f.icon}
              </div>
              <h3 style={{ fontFamily: "Times New Roman, sans-serif" }} className="text-lg font-semibold mb-3">{f.title}</h3>
              <p style={{ fontFamily: "Ancizar Serif, sans-serif" }} className="text-sm text-neutral-400 leading-relaxed">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 -mb-20 text-center">
          <h3 style={{ fontFamily: "Times New Roman, serif" }} className="text-3xl font-bold mb-4">
            The Complete{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Automation Process
            </span>
          </h3>
          <p style={{ fontFamily: "Ancizar Serif, sans-serif" }} className="text-neutral-400 max-w-2xl mx-auto mb-12 text-sm md:text-base">
            From creating high-quality content to scheduling posts and engaging
            with your audience — everything is fully automated with AI
            precision.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="p-6 bg-neutral-950 rounded-2xl border border-white/10 text-center w-full md:w-72 border border-white/10 hover:border-cyan-500/40 transition-all shadow-lg"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 mx-auto mb-4">
                <RiAiGenerate2 className="w-7 h-7 text-cyan-400" />
              </div>
              <h4 style={{ fontFamily: "Times New Roman, sans-serif" }} className="text-lg font-semibold mb-2">Generate</h4>
              <p style={{ fontFamily: "Ancizar Serif, sans-serif" }} className="text-sm text-neutral-400 leading-relaxed">
                AI creates engaging posts tailored to your brand voice and
                audience preferences.
              </p>
              <p style={{ fontFamily: "Times New Roman, sans-serif" }} className="mt-3 text-cyan-500 font-medium text-sm flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full animate-pulse bg-cyan-500" />{" "}
                AI-Powered
              </p>
            </motion.div>

            <span className="hidden md:block text-2xl text-neutral-500"><FaArrowRightLong/></span>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="p-6 bg-neutral-950 rounded-2xl border border-white/10 text-center w-full md:w-72 border border-white/10 hover:border-cyan-500/40 transition-all shadow-lg"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 mx-auto mb-4">
                <RiCalendarScheduleLine  className="w-7 h-7 text-cyan-400" />
              </div>
              <h4 style={{ fontFamily: "Times New Roman, sans-serif" }} className="text-lg font-semibold mb-2">Schedule</h4>
              <p style={{ fontFamily: "Ancizar Serif, sans-serif" }} className="text-sm text-neutral-400 leading-relaxed">
                Smart timing optimization across all platforms with intelligent
                scheduling algorithms.
              </p>
              <p style={{ fontFamily: "Times New Roman, sans-serif" }} className="mt-3 text-cyan-500 font-medium text-sm flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full animate-pulse bg-cyan-500" />{" "}
                Smart Timing
              </p>
            </motion.div>

            <span className="hidden md:block text-2xl text-neutral-500"><FaArrowRightLong/></span>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              viewport={{ once: true }}
              className="p-6 bg-neutral-950 rounded-2xl border border-white/10 text-center w-full md:w-72 border border-white/10 hover:border-cyan-500/40 transition-all shadow-lg"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 mx-auto mb-4">
                <IoPersonAdd className="w-7 h-7 text-cyan-400" />
              </div>
              <h4 style={{ fontFamily: "Times New Roman, sans-serif" }} className="text-lg font-semibold mb-2">Engage</h4>
              <p style={{ fontFamily: "Ancizar Serif, sans-serif" }} className="text-sm text-neutral-400 leading-relaxed">
                Automated responses and effortless community management with
                contextual AI messaging.
              </p>
              <p style={{ fontFamily: "Times New Roman, sans-serif" }} className="mt-3 text-cyan-500 font-medium text-sm flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full animate-pulse bg-cyan-500" />{" "}
                Auto Engage
              </p>
            </motion.div>
          </div>
          <div className="mt-8">
            <Link href="/mcpAutomation">
                <button
                    style={{ fontFamily: "Ancizar Serif, sans-serif" }}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-sky-400 via-cyan-500 to-teal-600 font-semibold text-neutral-900 hover:scale-105 transition-transform shadow-lg"
                >
                    Start Free Automation
                </button>
            </Link>
            <p style={{ fontFamily: "Times New Roman, sans-serif" }} className="text-neutral-400 text-md mt-4">
              No credit card required • 5+ platforms included • MCP-powered
              automation • 24/7 support
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-6 mt-5 text-sm font-medium">
            <div className="flex items-center gap-2"><SiTicktick className="text-green-400" /> Enterprise Security</div>
            <div className="flex items-center gap-2"><SiTicktick className="text-green-400" /> 99.9% Uptime</div>
            <div className="flex items-center gap-2"><SiTicktick className="text-green-400" /> ISO Certified</div>
          </div>
        </div>
      </div>
    </section>
  );
}
