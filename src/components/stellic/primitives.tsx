import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import * as React from "react"

import { Icon } from "@/components/icon"

/* Small Stellic-specific pieces that have no shadcn equivalent. Anything here
 * used by a second page should stay here; page-local composition does not. */

/* ============================================================ StatusPill
   The REVIEWED / UNREVIEWED marker in a semester card header. */

const statusPillVariants = cva(
  "inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-overline font-medium uppercase whitespace-nowrap",
  {
    variants: {
      status: {
        reviewed: "bg-success-5 text-success-100",
        unreviewed: "bg-gray-5 text-gray-100",
      },
    },
    defaultVariants: { status: "reviewed" },
  }
)

export function StatusPill({
  status = "reviewed",
  className,
  children,
}: VariantProps<typeof statusPillVariants> & {
  className?: string
  children: React.ReactNode
}) {
  return (
    <span className={cn(statusPillVariants({ status }), className)}>
      <Icon name={status === "reviewed" ? "check-circle" : "error-outline"} size={12} />
      {children}
    </span>
  )
}

/* ============================================================ AuditIcon
   16x16 square marking a course group's audit state. The leaf sizes are the
   design's, measured off the Figma render — they are not a uniform inset. */

export function AuditIcon({ state }: { state: "registered" | "planned" }) {
  const registered = state === "registered"

  return (
    <span
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-md",
        registered
          ? "bg-warning-50 text-white"
          : "border-[0.667px] border-warning-50 bg-warning-5 text-warning-50"
      )}
    >
      <Icon name={registered ? "watch-later" : "check"} size={registered ? 10.667 : 9.333} />
    </span>
  )
}

/* ============================================================ AddSlot
   Dashed drop target. `tone` switches between the in-card course slot and the
   larger add-a-year slot. */

const addSlotVariants = cva(
  "flex w-full flex-col items-center justify-center rounded-md border border-dashed border-input bg-card p-[15px]",
  {
    variants: {
      tone: {
        course: "text-label-md text-gray-60",
        year: "text-h300 font-semibold text-gray-80",
      },
    },
    defaultVariants: { tone: "course" },
  }
)

export function AddSlot({
  tone,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof addSlotVariants>) {
  return (
    <button type="button" className={cn(addSlotVariants({ tone }), className)} {...props}>
      {tone === "year" ? <span className="w-full text-left">{children}</span> : children}
    </button>
  )
}
