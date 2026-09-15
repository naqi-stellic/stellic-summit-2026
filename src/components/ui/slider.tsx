import { cn } from "cn"
import { Slider as SliderPrimitive } from "radix-ui"
import * as React from "react"

/* Retuned to the Figma slider: a 6px track on the muted ground, filled in
 * primary up to the value, with a 16px white thumb ringed in the same primary. */

function Slider({
  className,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted"
      >
        <SliderPrimitive.Range data-slot="slider-range" className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        data-slot="slider-thumb"
        className="block size-4 shrink-0 cursor-grab rounded-full border border-primary bg-background shadow-sm transition-[color,box-shadow] focus-visible:ring-4 focus-visible:ring-ring/50 focus-visible:outline-hidden active:cursor-grabbing"
      />
    </SliderPrimitive.Root>
  )
}

export { Slider }
