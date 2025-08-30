"use client";

import { cn } from "../../lib/utils";
import { motion } from "framer-motion";

export const BorderBeam = ({
  className,
  size = 800,
  delay = 0,
  duration = 6,
  colorFrom = "#06b6d4",
  colorTo = "#06b6d4",
  colorExtra = "#06b6d4",
  transition,
  style,
  reverse = false,
  initialOffset = 0,
}) => {
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]"
    >
      <motion.div
        className={cn(
          "absolute aspect-square",
          "bg-gradient-to-l from-[var(--color-from)] via-[var(--color-extra)] to-[var(--color-to)]",
          className
        )}
        style={{
          width: size,
          "--color-from": colorFrom,
          "--color-to": colorTo,
          "--color-extra": colorExtra,
          ...style,
        }}
        initial={{ offsetDistance: `${initialOffset}%` }}
        animate={{
          offsetDistance: reverse
            ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
            : [`${initialOffset}%`, `${100 + initialOffset}%`],
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration,
          delay: -delay,
          ...transition,
        }}
      />
    </div>
  );
};
