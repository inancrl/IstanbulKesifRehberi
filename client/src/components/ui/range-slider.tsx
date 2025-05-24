import * as React from "react";
import { cn } from "@/lib/utils";

interface RangeSliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (value: number) => void;
}

const RangeSlider = React.forwardRef<HTMLInputElement, RangeSliderProps>(
  ({ className, onValueChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      onValueChange?.(value);
      props.onChange?.(e);
    };

    return (
      <input
        type="range"
        className={cn(
          "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
          "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4",
          "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600",
          "[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md",
          "[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full",
          "[&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:cursor-pointer",
          "[&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:shadow-md",
          className
        )}
        ref={ref}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

RangeSlider.displayName = "RangeSlider";

export { RangeSlider };
