'use client';

import { Orbitron } from "next/font/google";
import { toast } from 'react-toastify';
import { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '900'] });

const Header = () => {

  const handleModeChange = () => {
    toast.success("Agricultural Mode Activated!");
  };

  return (
    <header className="w-full flex fixed justify-center z-50 mt-4">
      <div className="bg-black rounded-full w-full max-w-full mt-1 px-4 lg:mx-4 lg:px-5 py-2 flex items-center justify-between shadow-xl">
        <h1 className={`${orbitron.className} text-white font-extrabold text-xl sm:text-2xl tracking-wider`}>
          NexGen<span className="text-white">-Quillix</span>
        </h1>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleModeChange}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-semibold shadow-xl transition-all duration-300 transform scale-105"
          >
            PostGen Bot
            <span className="w-2.5 h-2.5 bg-black rounded-full animate-pulse" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;