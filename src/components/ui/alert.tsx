import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

/* Retuned to the Figma alert spec: a flex banner rather than shadcn's icon
 * grid, since the design puts the icon, title and meta on one row with an
 * action beneath. Padding subtracts the border width (inside-stroke rule). */

const alertVariants = cva(
  "flex w-full items-center gap-2 rounded-md border p-[15px] text-body-md",
  {
    variants: {
      variant: {
        info: "border-primary-100 bg-primary-0 text-foreground",
        warning: "border-warning-50 bg-warning-5 text-foreground",
        danger: "border-alert-100 bg-alert-5 text-foreground",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
  )
}

function AlertBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-body"
      className={cn("flex min-w-0 flex-1 flex-col items-start gap-2", className)}
      {...props}
    />
  )
}

function AlertHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-header"
      /* Wraps so the closing date drops to its own line when the card is
         narrow, rather than being truncated. */
      className={cn("flex w-full flex-wrap items-center gap-2", className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="alert-title"
      className={cn("flex items-center gap-2 font-semibold", className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<"span">) {
  /* nowrap so it moves to the next line whole instead of squeezing. */
  return (
    <span data-slot="alert-description" className={cn("whitespace-nowrap", className)} {...props} />
  )
}

export { Alert, AlertBody, AlertHeader, AlertTitle, AlertDescription }
