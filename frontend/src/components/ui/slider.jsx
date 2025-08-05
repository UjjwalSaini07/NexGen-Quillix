"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "../../lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}) {
  const _values = React.useMemo(() => {
    const vals = Array.isArray(value)
      ? value
      : Array.isArray(defaultValue)
        ? defaultValue
        : [min, max];
    return vals.slice().sort((a, b) => a - b);
  }, [value, defaultValue, min, max]);

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      {/* Track — this is the unfilled part (dark gray) */}
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="bg-neutral-800 relative grow overflow-hidden rounded-full h-1.5 w-full"
      >
        {/* Range — filled part (white) */}
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="bg-white absolute h-full"
        />
      </SliderPrimitive.Track>

      {/* Thumb */}
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="bg-white border-white ring-white/20 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-none"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider }
