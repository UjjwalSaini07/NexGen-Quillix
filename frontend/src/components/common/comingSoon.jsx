"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const ComingSoon = () => {
  const containerRef = useRef(null);

  const textVariant = (delay) => ({
    hidden: { y: -50, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", duration: 1.5, delay },
    },
  });

  const adjustOpacity = () => {
    if (containerRef.current) {
      const distanceFromTop = window.scrollY;
      const startDistance = window.innerWidth < 798 ? 240 : 350;
      const maxDistance = 500;

      if (distanceFromTop > startDistance) {
        const adjustedDistance = distanceFromTop - startDistance;
        const opacity = Math.max(
          0,
          Math.min(1, 1 - adjustedDistance / (maxDistance - startDistance))
        );
        containerRef.current.style.opacity = opacity;
        containerRef.current.style.zIndex = opacity === 0 ? "-1" : "2";
      } else {
        containerRef.current.style.opacity = 1;
        containerRef.current.style.zIndex = "2";
      }
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", adjustOpacity);
    return () => window.removeEventListener("scroll", adjustOpacity);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex flex-col items-center justify-center bg-black text-center text-white z-20 overflow-hidden px-4"
    >
      <motion.h1
        variants={textVariant(0.3)}
        initial="hidden"
        animate="show"
        style={{fontFamily: "Times New Roman, serif"}}
        className="text-4xl md:text-6xl font-bold mb-4"
      >
        🚧 Work Is In Progress 🚧
      </motion.h1>

      <motion.p
        variants={textVariant(0.6)}
        initial="hidden"
        animate="show"
        style={{fontFamily: "Times New Roman, serif"}}
        className="text-md md:text-xl text-gray-300 mb-12 max-w-2xl"
      >
        We’re building something exciting for you. Stay tuned while we finish up!
      </motion.p>

      <motion.div
        variants={textVariant(0.9)}
        initial="hidden"
        animate="show"
        className="w-full overflow-hidden"
      >
        <div className="whitespace-nowrap">
          <span className="inline-block text-[6rem] md:text-[10rem] font-serif text-white animate-marquee">
            Coming Soon....
          </span>
        </div>
      </motion.div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 20s linear infinite; /* slower = 20s */
        }
      `}</style>
    </div>
  );
};

export default ComingSoon;
