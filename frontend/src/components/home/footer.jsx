import React from "react";
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import useWindowSize from "../hooks/use-WindowSize";

export default function Footer() {
  const { width } = useWindowSize();

  return (
    <footer className="relative overflow-hidden bg-black text-gray-400 rounded-t-3xl border-t border-gray-800 md:rounded-t-[4rem]">
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute top-1/4 right-0 h-72 w-72 rounded-full bg-blue-500/20 blur-[100px]" />
      </div>

      <div className="container mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <div className="md:w-1/2">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="mb-5 flex items-center gap-4 cursor-pointer focus:outline-none"
            >
              <img src="/NexGenQuillixLogo.png" alt="logo" className="h-10 w-10 rounded-full" />
              <span style={{ fontFamily: 'Orbitron, sans-serif' }} className="text-3xl font-extrabold bg-gradient-to-br from-blue-300 to-cyan-500 bg-clip-text text-transparent">
                NexGen Quillix
              </span>
            </button>

            <p style={{ fontFamily: 'Ancizar Serif, sans-serif' }} className="mb-6 max-w-md text-[1rem] leading-relaxed text-justify">
              NexGen-Quillix is an AI-powered platform that crafts impactful, trend-driven social media content—enhancing engagement, creativity, and workflow efficiency.
            </p>
            <div className="flex gap-4">
              <SocialIcon href="https://github.com/UjjwalSaini07" icon={<FaGithub size={20} />} />
              <SocialIcon href="#" icon={<FaXTwitter size={20} />} />
              <SocialIcon href="#" icon={<FaInstagram size={20} />} />
              <SocialIcon href="https://www.linkedin.com/in/ujjwalsaini07" icon={<FaLinkedin size={20} />} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:w-1/2 md:justify-end">
            <FooterColumn
              title="Products"
              links={[
                { label: "Linkedin Post Gen", href: "/linkedin" },
                { label: "Instagram Post Gen", href: "/instagram" },
                { label: "X Post Gen", href: "/x" },
                { label: "Facebook Post Gen", href: "/facebook" },
                { label: "Youtube Post Gen", href: "/youtube" },
              ]}
            />
            <FooterColumn
              title="Company"
              links={[
                { label: "Terms & Conditions", href: "/terms&conditions" },
                { label: "Privacy Policy", href: "/privacypolicy" },
                { label: "License Issued", href: "/license" },
              ]}
            />
            {width > 650 && (
                <FooterColumn
                title="Support"
                links={[
                    { label: "About Us", href: "/about" },
                    { label: "Contact Us", href: "/contact" },
                    { label: "Help-Center", href: "/helpcenter" },
                ]}
                />
            )}
          </div>
        </div>

        <div className="relative mt-14 border-t border-gray-800 pt-6">
          <div className="absolute left-1/2 top-0 h-0.5 w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse" />
          <div style={{ fontFamily: 'Ancizar Serif, sans-serif' }} className="flex flex-col items-center justify-between text-sm text-gray-500 md:flex-row">
            <p className="text-[0.95rem]">
              © {new Date().getFullYear()}{" "}
              <span className="font-semibold text-white">NexGen-Quillix</span>. All
              rights reserved.
            </p>
            <p className="inline-flex items-center gap-1 transition-colors text-[0.95rem] duration-300 mt-3 md:mt-0">
              <span className="text-neutral-500">Building in public with{" "}</span>
              <span className="animate-pulse text-red-700">❤️</span>
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
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ href, icon }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center rounded-full bg-gray-900 p-2 shadow-md hover:scale-110 hover:bg-gray-800 transition-all duration-200 hover:ring-1 hover:ring-cyan-500"
    >
      <span className="text-gray-300 hover:text-white transition">{icon}</span>
    </a>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 style={{ fontFamily: 'Playfair Display SC, sans-serif' }} className="mb-5 text-sm font-bold text-white tracking-widest uppercase">
        {title}
      </h3>
      <ul style={{ fontFamily: 'Ancizar Serif, sans-serif' }} className="space-y-3 text-md">
        {links.map(({ label, href }) => (
          <li key={label}>
            <a
              href={href}
              className="group relative inline-flex items-center gap-2 text-gray-400 hover:text-white transition"
            >
              <span className="absolute -left-4 top-1/2 h-1 w-1 rounded-full bg-cyan-400 opacity-0 group-hover:opacity-100 transform -translate-y-1/2 transition-all duration-200" />
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}