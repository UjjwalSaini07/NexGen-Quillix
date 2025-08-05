"use client";

import { Orbitron } from "next/font/google";
import { usePathname } from "next/navigation";
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
import useWindowSize from "../hooks/use-WindowSize";
import "react-toastify/dist/ReactToastify.css";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["400", "900"] });

const Header = () => {
  const pathname = usePathname();
  const [selectedSocial, setSelectedSocial] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { width } = useWindowSize();

  useEffect(() => {
    const savedBot = localStorage.getItem("selectedBot");
    setSelectedSocial(savedBot || null);
  }, []);

  useEffect(() => {
    if (pathname === "/") {
      setSelectedSocial(null);
      localStorage.removeItem("selectedBot");
    }
  }, [pathname]);

  const handleSocialClick = (name) => {
    setSelectedSocial(name);
    localStorage.setItem("selectedBot", name);
    toast.success(`${name} Bot Activated!`);
  };

  const isHome = pathname === "/";

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
        <div className="lg:absolute lg:left-4">
          <Link
            href="/"
            aria-label="Go to homepage"
            className={`text-white font-extrabold text-lg sm:text-2xl tracking-wide hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white transition duration-200 mb-2 sm:mb-0 sm:mr-4 ${orbitron.className}`}
          >
            NexGen<span className="text-white">-Quillix</span>
          </Link>
        </div>

        {width < 500 ? (
          <>
            {/* Hamburger Button */}
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Toggle Menu"
              className="relative z-50 w-9 h-9 flex flex-col items-center justify-center gap-1 group"
            >
              <span
                className={`h-0.5 w-7 bg-white rounded transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}
              />
              <span
                className={`h-0.5 w-7 bg-white rounded transition-all duration-300 ${isMenuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`h-0.5 w-7 bg-white rounded transition-all duration-300 ${isMenuOpen ? "-rotate-50 -translate-y-1.5" : ""}`}
              />
            </button>

            {/* Mobile Dropdown */}
            <div
              className={`absolute top-full left-0 w-full bg-zinc-900 text-white rounded-xl shadow-2xl p-4 flex flex-col gap-3 mt-2 transition-all duration-300 ${
                isMenuOpen ? "opacity-100 visible scale-100" : "opacity-0 invisible scale-95"
              }`}
            >
              {socialPlatforms.map(({ name, href }) => (
                <Link
                  key={name}
                  href={href}
                  onClick={() => {
                    handleSocialClick(name);
                    setIsMenuOpen(false);
                  }}
                  className={`text-sm font-medium transition-colors hover:text-blue-400 ${
                    selectedSocial === name ? "text-blue-400" : "text-white"
                  }`}
                >
                  {name}
                </Link>
              ))}
            </div>
          </>
        ) : (
          <nav className="lg:relative flex flex-wrap lg:left-1/2 lg:transform lg:-translate-x-1/2 lg:items-center justify-center gap-4 sm:gap-6 mb-2 sm:mb-0">
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
        )}

        {width > 1023 && (
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
            {isHome && !selectedSocial
              ? "No Bot Selected"
              : selectedSocial
              ? `${selectedSocial} Bot`
              : "Select Any Bot"}
            <span className="w-2.5 h-2.5 bg-black rounded-full animate-pulse" />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
