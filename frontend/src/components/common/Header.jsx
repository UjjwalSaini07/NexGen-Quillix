"use client";

import { Orbitron } from "next/font/google";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  FaLinkedinIn,
  FaInstagram,
  FaXTwitter,
  FaFacebookF,
  FaYoutube,
} from "react-icons/fa6";
import "react-toastify/dist/ReactToastify.css";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["400", "900"] });

const Header = () => {
  const [selectedSocial, setSelectedSocial] = useState(null);

  useEffect(() => {
    const savedBot = localStorage.getItem("selectedBot");
    if (savedBot) {
      setSelectedSocial(savedBot);
    }
  }, []);

  const handleSocialClick = (name) => {
    setSelectedSocial(name);
    localStorage.setItem("selectedBot", name);
    toast.success(`${name} Bot Activated!`);
  };

  const socialPlatforms = [
    { name: "LinkedIn", icon: <FaLinkedinIn className="w-5 h-5 sm:w-6 sm:h-6" />, color: "text-blue-400", href: "/linkedin" },
    { name: "Instagram", icon: <FaInstagram className="w-5 h-5 sm:w-6 sm:h-6" />, color: "text-pink-400", href: "/instagram" },
    { name: "X", icon: <FaXTwitter className="w-5 h-5 sm:w-6 sm:h-6" />, color: "text-gray-400", href: "/x" },
    { name: "Facebook", icon: <FaFacebookF className="w-5 h-5 sm:w-6 sm:h-6" />, color: "text-blue-400", href: "/facebook" },
    { name: "YouTube", icon: <FaYoutube className="w-5 h-5 sm:w-6 sm:h-6" />, color: "text-pink-400", href: "/youtube" },
  ];

  return (
    <header className="fixed top-0 z-50 w-full flex justify-center mt-4 px-4">
      <div className="relative w-full max-w-8xl bg-black rounded-full shadow-xl py-3 px-4 flex items-center justify-between flex-wrap sm:flex-nowrap">
        <Link
          href="/"
          aria-label="Go to homepage"
          className={`text-white font-extrabold text-lg sm:text-2xl tracking-wide hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white transition-colors duration-200 mb-2 sm:mb-0 sm:mr-4 ${orbitron.className}`}
        >
          NexGen<span className="text-white">-Quillix</span>
        </Link>

        <nav className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-2 sm:mb-0">
          {socialPlatforms.map(({ name, icon, color, href }) => (
            <Link
              key={name}
              href={href}
              aria-label={name}
              onClick={() => handleSocialClick(name)}
              className={`transition-colors duration-200 text-white hover:${color} ${
                selectedSocial === name ? color : ""
              } focus:outline-none focus:ring-2 rounded`}
            >
              {icon}
            </Link>
          ))}
        </nav>

        <button
          onClick={() =>
            toast.success(
              selectedSocial
                ? `${selectedSocial} Bot Active`
                : "Bot is Not Activated!"
            )
          }
          className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm sm:text-base font-semibold rounded-full shadow-md hover:scale-105 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300"
          aria-label="Toggle Bot Mode"
        >
          {selectedSocial ? `${selectedSocial} Bot` : "Select Any Bot"}
          <span className="w-2.5 h-2.5 bg-black rounded-full animate-pulse" />
        </button>
      </div>
    </header>
  );
};

export default Header;
