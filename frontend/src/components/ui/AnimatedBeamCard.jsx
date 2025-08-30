"use client";

import React from "react";
import { Card, CardContent } from "./card";
import { cn } from "../../lib/utils";
import { BorderBeam } from "./border-beam";

const AnimatedBeamCard = ({
  icon,
  title,
  description,
  className,
  beamColorFrom = "#06b6d4", // cyan-500
  beamColorTo = "#06b6d4",   // cyan-500
}) => {
  return (
    <Card
      className={cn(
        "relative group/card bg-black/50 border border-white/10 rounded-2xl backdrop-blur-xl p-6 overflow-hidden transition-shadow duration-500 ease-out hover:shadow-[0_6px_20px_rgba(6,182,212,0.35)]", // updated shadow tint to cyan
        className
      )}
    >
      {/* Beam effect */}
      <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none">
        <BorderBeam
          colorFrom={beamColorFrom}
          colorTo={beamColorTo}
          size={140}
          style={{ strokeWidth: 10 }}
        />
      </div>

      {/* Foreground content */}
      <CardContent className="relative z-10 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-14 h-14 flex items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-md shadow-inner">
          {icon}
        </div>
        <h3
          style={{ fontFamily: "Times New Roman, sans-serif" }}
          className="text-xl font-semibold text-white"
        >
          {title}
        </h3>
        <p
          style={{ fontFamily: "Ancizar Serif, sans-serif" }}
          className="text-md text-gray-300 max-w-xs"
        >
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

export default AnimatedBeamCard;
