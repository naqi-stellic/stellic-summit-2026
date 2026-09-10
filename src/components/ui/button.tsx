import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

/* Retuned to the Figma button spec.
 *
 * Figma paints strokes inside the frame, so its "16px padding, 1px stroke"
 * measures 16px from the outer edge to the content. A CSS border sits outside
 * the padding box, hence px-[15px] / px-[11px]. Every variant carries a border
 * (transparent where the design has none) so the geometry stays uniform. */

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md border text-button-md font-medium whitespace-nowrap transition-all outline-none " +
    "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-primary-selected " +
    "data-[selected=true]:border-ring data-[selected=true]:shadow-[0_0_0_3px_var(--color-primary-selected)] " +
    "disabled:pointer-events-none disabled:opacity-50 " +
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        /* Tertiary is the workhorse: white surface, hairline, xs lift.
         * aria-pressed is Figma's Selected variant, for buttons that toggle
         * something open — the Generate plan panel, for instance. */
        tertiary:
          "border-input bg-card text-foreground shadow-xs hover:bg-gray-5 " +
          "aria-pressed:border-primary-50 aria-pressed:bg-primary-0 aria-pressed:text-primary-50 aria-pressed:hover:bg-primary-0",
        primary:
          "border-transparent bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        ghost: "border-transparent hover:bg-gray-5",
      },
      size: {
        default: "h-9 px-[15px]",
        sm: "h-8 px-[11px]",
        icon: "size-9 px-[15px]",
      },
    },
    defaultVariants: {
      variant: "tertiary",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  selected,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    /** Segmented-control selection: ring-coloured hairline plus a 3px ring. */
    selected?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-selected={selected}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
