"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import { Card, CardContent } from "./card";
import { cn } from "../../lib/utils";

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const generateRandomString = (length) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const AnimatedCard = ({ icon, title, description, className }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [randomString, setRandomString] = useState("");

  useEffect(() => {
    setRandomString(generateRandomString(1500));
  }, []);

  const handleMouseMove = (e) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
    setRandomString(generateRandomString(1500));
  };

  const maskImage = useMotionTemplate`radial-gradient(200px at ${mouseX}px ${mouseY}px, white, transparent)`;
  const maskStyle = { maskImage, WebkitMaskImage: maskImage };

  return (
    <Card
      onMouseMove={handleMouseMove}
      className={cn(
        "relative overflow-hidden group/card bg-black/40 border border-white/10 rounded-2xl backdrop-blur-xl transition-shadow shadow-xl hover:shadow-blue-600/20",
        className
      )}
    >
      {/* Radial hover gradient behind text */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-600 to-indigo-700 opacity-0 group-hover/card:opacity-80 transition duration-500 pointer-events-none z-0"
        style={maskStyle}
      />

      {/* Binary character grid effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover/card:opacity-100 transition duration-500 mix-blend-overlay pointer-events-none z-0"
        style={maskStyle}
      >
        <p className="absolute inset-0 px-6 py-6 text-[10px] leading-[15px] whitespace-pre-wrap break-words text-white font-mono font-bold select-none">
          {randomString}
        </p>
      </motion.div>

      {/* Foreground content */}
      <CardContent className="relative z-10 flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center">
        <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-white/10 border border-white/10 backdrop-blur-md shadow-inner">
          {icon}
        </div>
        <h3
          style={{ fontFamily: "Times New Roman, sans-serif" }}
          className="text-2xl font-bold text-white mb-2"
        >
          {title}
        </h3>
        <p
          style={{ fontFamily: "Ancizar Serif, sans-serif" }}
          className="text-gray-300 text-md"
        >
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

export default AnimatedCard;
