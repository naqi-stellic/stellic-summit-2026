import type { ComponentProps, ReactNode } from "react"
import { cn } from "cn"

import { Icon, type IconName } from "@/components/icon"

/* The pieces the transcript steps are made of.
 *
 * Every step of this flow is the same white card saying the same heading —
 * "Add your transcript" — with a different question under it, so the card, the
 * heading and the two-up chooser are components rather than three copies. The
 * flow reads as one screen changing its mind rather than four screens.
 *
 * Padding subtracts the border width throughout, for the reason the README
 * gives: Figma paints strokes inside the frame, so its 32 is our 31. */

export function ExploreCard({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      /* No `overflow-hidden`: nothing bleeds to the card's edge — the body
         is inset by 32 — and clipping it would swallow the institution
         dropdown, which has to escape the card it opens inside. */
      className={cn("rounded-md border border-gray-40 bg-card", className)}
      {...props}
    />
  )
}

/** The card's own body: 32 all round, 32 between blocks. */
export function ExploreCardBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-8 p-[31px]", className)} {...props} />
}

export function CardHeading({
  title,
  description,
  className,
}: {
  title: string
  description?: string
  className?: string
}) {
  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <p className="text-h400 font-semibold text-gray-100">{title}</p>
      {description && <p className="text-field text-gray-80">{description}</p>}
    </div>
  )
}

/** A heading one level down, for a block inside the card. */
export function SectionLabel({ className, ...props }: ComponentProps<"p">) {
  return (
    <p className={cn("text-body-md font-semibold text-gray-100", className)} {...props} />
  )
}

/* ============================================================ ChoiceCard */

/** The two-up tile the flow asks every either/or question with: credit type,
 *  then upload-or-type. Drawn at 80% in the file — the design's resting state
 *  for a tile nobody has touched — so hover takes it to full rather than
 *  adding a colour the design does not have.
 *
 *  `disabled` is for a branch this prototype does not carry. It stays drawn,
 *  because leaving it out would misreport the design. */
export function ChoiceCard({
  icon,
  title,
  description,
  disabled,
  className,
  ...props
}: ComponentProps<"button"> & {
  icon: IconName
  title: string
  description: string
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "flex min-w-0 flex-1 flex-col items-start gap-1 rounded-md border border-gray-40 p-[15px] text-left opacity-80 transition-all",
        disabled
          ? "cursor-not-allowed"
          : "hover:border-primary-50 hover:bg-gray-0 hover:opacity-100",
        className
      )}
      {...props}
    >
      <Icon name={icon} size={16} className="text-gray-100" />
      <span className="w-full text-body-md font-semibold text-gray-100">{title}</span>
      <span className="w-full text-body-md text-gray-80">{description}</span>
    </button>
  )
}

/** Two tiles side by side, one under the other once the card is narrow. */
export function ChoiceRow({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex w-full flex-col gap-4 @xl:flex-row @xl:items-start", className)}
      {...props}
    />
  )
}

/* ============================================================ SearchField */

/** The repo's Input has no room for a leading glyph and this is the only place
 *  that wants one, so the field is composed here rather than the primitive
 *  being widened for one caller. */
export function SearchField({
  className,
  searching = true,
  ...props
}: Omit<ComponentProps<"input">, "size"> & {
  /** The glyph is an invitation to type. Once the field holds an answer there
   *  is nothing left to search for, so the design drops it. */
  searching?: boolean
}) {
  return (
    <div
      className={cn(
        "flex h-9 w-full items-center gap-1 rounded-md border border-input bg-card px-[11px] shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        className
      )}
    >
      {searching && <Icon name="search" size={16} className="text-gray-80" />}
      <input
        className="min-w-0 flex-1 bg-transparent text-body-md text-gray-100 outline-none placeholder:text-gray-80"
        {...props}
      />
    </div>
  )
}

/* ============================================================ TranscriptAlert */

/** The banner that carries the whole wait.
 *
 * It is the shared `Alert` in spirit but not in geometry: this one aligns to
 * the top because its body runs to two lines, keeps a neutral hairline where
 * the shared variants colour their border, and holds a changing right-hand
 * slot — a percentage while it reads, edit and delete once it has. Bending the
 * shared Alert into that would have left three variants nobody else uses. */
export function TranscriptAlert({
  tone,
  icon,
  title,
  description,
  children,
}: {
  tone: "reading" | "ready"
  icon: ReactNode
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex w-full items-start gap-3 rounded-md border border-gray-40 px-[15px] py-[11px]",
        tone === "reading" ? "bg-warning-5" : "bg-success-5"
      )}
    >
      <div className="flex shrink-0 pt-0.5">{icon}</div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 text-body-md text-gray-100">
        <p className="truncate font-semibold">{title}</p>
        <p>{description}</p>
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  )
}

/** Reading, rather than done: an arc rather than a filling bar, because the
 *  percentage beside it is already the measurement. */
export function ReadingSpinner() {
  return (
    <span
      aria-hidden="true"
      className="block size-4 animate-spin rounded-full border-2 border-warning-25/40 border-t-warning-100"
    />
  )
}

/** The flow's own quiet link: underlined body text, no button chrome. */
export function InlineLink({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "text-body-md text-gray-80 underline underline-offset-2 hover:text-gray-100",
        className
      )}
      {...props}
    />
  )
}
