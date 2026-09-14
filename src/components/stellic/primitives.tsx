import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import * as React from "react"

import { Icon, type IconName } from "@/components/icon"
import { RadioGroupItem } from "@/components/ui/radio-group"

/* Small Stellic-specific pieces that have no shadcn equivalent. Anything here
 * used by a second page should stay here; page-local composition does not. */

/* ============================================================ StatusPill
   The small uppercase marker that says where something stands: a term's review
   state in the planner, a class's registration state in a term. */

const statusPillVariants = cva(
  "inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-overline font-medium uppercase whitespace-nowrap",
  {
    variants: {
      status: {
        reviewed: "bg-success-5 text-success-100",
        unreviewed: "bg-gray-5 text-gray-100",
        ready: "bg-primary-0 text-primary-100",
        "needs review": "bg-warning-5 text-warning-50",
      },
    },
    defaultVariants: { status: "reviewed" },
  }
)

const STATUS_ICON: Record<string, IconName> = {
  reviewed: "check-circle",
  unreviewed: "error-outline",
  ready: "thumb-up",
  "needs review": "warning",
}

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
      <Icon name={STATUS_ICON[status ?? "reviewed"]} size={12} />
      {children}
    </span>
  )
}

/* ============================================================ AuditIcon
   16x16 square marking a course group's audit state. The leaf sizes are the
   design's, measured off the Figma render — they are not a uniform inset. */

export function AuditIcon({
  state,
  size = 16,
}: {
  state: "registered" | "planned"
  size?: 16 | 24
}) {
  const registered = state === "registered"
  const glyph = registered ? 10.667 : 9.333

  return (
    <span
      style={{ width: size, height: size }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md",
        registered
          ? "bg-warning-50 text-white"
          : "border-[0.667px] border-warning-50 bg-warning-5 text-warning-50"
      )}
    >
      <Icon name={registered ? "watch-later" : "check"} size={(glyph * size) / 16} />
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

/* ============================================================ RadioCard
   A bordered option in a RadioGroup: the radio, the label, and the line about
   it on the same row, which is what keeps the box shallow enough to scan a
   list of them. The line has to earn its place in four or five words — it
   wraps underneath only when the panel is too narrow to hold both.
   `children` is for an option that opens up when it is the one chosen. */

export function RadioCard({
  value,
  label,
  detail,
  selected,
  children,
}: {
  value: string
  label: string
  detail: string
  selected: boolean
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2 rounded-md border p-[11px] transition-colors",
        selected ? "border-primary-50" : "border-gray-40"
      )}
    >
      <label className="flex w-full cursor-pointer items-center gap-3">
        <span className="flex items-center py-0.5">
          <RadioGroupItem value={value} />
        </span>
        <span className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-3 gap-y-0.5 text-body-md">
          <span className="text-foreground">{label}</span>
          <span className="text-gray-80">{detail}</span>
        </span>
      </label>
      {children}
    </div>
  )
}
