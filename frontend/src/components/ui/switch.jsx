"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "../../lib/utils";

function Switch({ className, ...props }) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5 w-9 items-center rounded-full border transition-all shadow-sm outline-none",
        // Background changes based on state
        "data-[state=checked]:bg-white data-[state=unchecked]:bg-black",
        // Optional subtle border
        "border-white/20 dark:border-white/10",
        // Focus ring
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full shadow-md ring-0 transition-transform",
          // Position animation
          "data-[state=checked]:translate-x-[18px] data-[state=unchecked]:translate-x-[2px]",
          // Thumb color opposite of base
          "data-[state=checked]:bg-black data-[state=unchecked]:bg-white"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
