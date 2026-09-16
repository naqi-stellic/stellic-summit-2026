import { cn } from "cn"
import type { ReactNode } from "react"

import { Icon } from "@/components/icon"
import { Badge } from "@/components/ui/badge"
import { Face } from "@/components/stellic/staff-chrome"
import type { Step } from "@/data/staff-queue"

/* One row grammar for the whole page.
 *
 * Every list on Staff Home — publish requests, exceptions, workflows, notes,
 * appointments, insights — is read left to right in the same three moves: who
 * or what it is about, what the thing is, and what you can do about it. The
 * columns hold their widths across the lists so the eye keeps its place when
 * the tab changes under it. */

export function Row({
  onToggle,
  open,
  label,
  leaving,
  children,
  detail,
}: {
  /** Given, the row opens onto its detail. */
  onToggle?: () => void
  open?: boolean
  /** What the chevron says it opens, for a reader who cannot see the row. */
  label?: string
  /** On its way out after being cleared: it fades, then the list closes up. */
  leaving?: boolean
  children: ReactNode
  detail?: ReactNode
}) {
  return (
    <div
      className={cn(
        "overflow-hidden border-b border-divider last:border-b-0",
        leaving && "animate-vanish"
      )}
    >
      {/* The chevron is the control; clicking anywhere else on the row is a
          convenience on top of it. A button around the whole row would have to
          contain the row's own buttons, which is neither valid nor operable. */}
      <div
        onClick={onToggle}
        className={cn(
          "flex w-full items-start gap-3.5 p-4 text-left transition-colors hover:bg-gray-0",
          onToggle && "cursor-pointer"
        )}
      >
        {onToggle ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onToggle()
            }}
            aria-expanded={!!open}
            aria-label={open ? `Hide ${label}` : `Show ${label}`}
            className="mt-[3px] shrink-0 cursor-pointer text-gray-60"
          >
            <Icon
              name="chevron-right"
              size={13}
              className={cn("transition-transform", open && "rotate-90")}
            />
          </button>
        ) : (
          <span className="w-[13px] shrink-0" />
        )}
        {children}
      </div>
      {open && detail}
    </div>
  )
}

/** Who the row is about: 252px, so the column of names reads as a column. */
export function RowSubject({
  face,
  title,
  sub,
  subStrong,
}: {
  face?: { initials: string; color: string }
  title: ReactNode
  sub?: ReactNode
  /** A version or a term is a fact, not a caption — it keeps full contrast. */
  subStrong?: boolean
}) {
  return (
    <>
      {face && <Face initials={face.initials} color={face.color} size={32} className="mt-px" />}
      <div className="w-[252px] shrink-0 max-lg:w-[180px]">
        <p className="text-body-md font-semibold text-foreground">{title}</p>
        {sub && (
          <p className={cn("mt-0.5 text-label-md", subStrong ? "text-gray-100" : "text-gray-80")}>
            {sub}
          </p>
        )}
      </div>
    </>
  )
}

/** What the row is. The wide middle column. */
export function RowBody({ children }: { children: ReactNode }) {
  return <div className="min-w-0 flex-1">{children}</div>
}

/** What you can do about it. */
export function RowActions({ children }: { children: ReactNode }) {
  /* Inside a row that opens on click, so the buttons keep their press to
     themselves rather than folding the row out from under the pointer. */
  return (
    <div
      onClick={(event) => event.stopPropagation()}
      className="ml-2 flex shrink-0 flex-wrap items-center justify-end gap-[7px]"
    >
      {children}
    </div>
  )
}

/* ---------------------------------------------------------------- lines
   Three kinds of line inside a row body, and only three, so a reader learns
   them once: the thing itself, a labelled fact about it, and the quiet prose
   around it. */

/** The statement the row leads with. */
export const Headline = ({ children }: { children: ReactNode }) => (
  <p className="text-body-md font-semibold text-foreground">{children}</p>
)

/** "Label: value". The label is what recurs down the column; the value is what
 *  differs, so the value is the one at full contrast. */
export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <p className="mt-[3px] text-label-md text-gray-80">
    {label}: <span className="text-gray-100">{children}</span>
  </p>
)

/** Unlabelled metadata — a date, mostly. */
export const Quiet = ({ children }: { children: ReactNode }) => (
  <p className="mt-[3px] text-label-md text-gray-80">{children}</p>
)

export function Chips({ items }: { items: { label: string; icon?: boolean }[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Badge key={item.label} variant="secondary" className="gap-1.5 py-0.5 font-medium">
          {item.icon && <Icon name="person" size={11} className="text-gray-80" />}
          {item.label}
        </Badge>
      ))}
    </div>
  )
}

/** The amber dot and a state, for a request that is mid-flight. */
export const StatusLine = ({ children }: { children: ReactNode }) => (
  <p className="mt-[3px] flex items-center gap-1.5 text-label-md text-gray-80">
    <span className="size-[7px] shrink-0 rounded-full bg-warning-50" />
    Status: <span className="text-gray-100">{children}</span>
  </p>
)

/* ============================================================ StepRail
   What has happened to a request and what has not.

   The rail is the honest answer to "where is this?", which a status word never
   is: it says who approved, who waived their step, who it is sitting with now
   and how long it has been there. The actions hang off the step that is waiting
   on *you* rather than off the row, because on a workflow with two open steps
   only one of them is yours. */

const NODE = {
  done: { ground: "bg-success-50 text-white", icon: "check" },
  cur: { ground: "bg-warning-25 text-white", icon: "watch-later" },
  todo: { ground: "border-[1.5px] border-gray-40 bg-card", icon: null },
  skip: { ground: "border-[1.5px] border-dashed border-gray-40 bg-card text-gray-60", icon: "remove" },
} as const

export function StepRail({
  steps,
  actions,
  footer,
}: {
  steps: Step[]
  /** Rendered against the step that is waiting on you. */
  actions?: ReactNode
  footer?: ReactNode
}) {
  const yours = steps.find((step) => step.state === "cur" && (step.who ?? "").startsWith("You"))

  return (
    <div className="border-t border-divider bg-gray-0 py-4 pr-5 pl-[89px] max-lg:pl-12">
      <div className="flex flex-col">
        {steps.map((step, i) => {
          const node = NODE[step.state]
          const [who, verdict] = (step.who ?? "").split(" · ")
          const when = step.when === "now" ? (step.since ? `Waiting since ${step.since}` : "Waiting") : step.when
          const meta = [verdict && verdict[0].toUpperCase() + verdict.slice(1), when]
            .filter(Boolean)
            .join(" · ")

          return (
            <div key={step.label} className="relative flex gap-3.5 pb-6 last:pb-0">
              {/* The rail runs between the nodes, not through them. */}
              {i < steps.length - 1 && (
                <span className="absolute top-[31px] bottom-[-3px] left-[13.25px] w-[1.5px] bg-divider" />
              )}
              <span
                className={cn(
                  "relative z-1 flex size-7 shrink-0 items-center justify-center rounded-full",
                  node.ground
                )}
              >
                {node.icon && <Icon name={node.icon} size={14} />}
              </span>
              <div className="min-w-0 flex-1 pt-[3px] md:max-w-[560px]">
                <p className="text-body-md font-semibold text-foreground">{step.label}</p>
                {who && <p className="mt-px text-label-md text-gray-100">{who}</p>}
                {step.fields && (
                  <dl className="mt-2.5 grid max-w-[520px] grid-cols-[150px_1fr] gap-x-4 gap-y-1 text-label-md">
                    {step.fields.map(([key, value]) => (
                      <div key={key} className="contents">
                        <dt className="text-gray-80">{key}</dt>
                        <dd className="text-gray-100">{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {meta && <p className="mt-0.5 text-label-md text-gray-80">{meta}</p>}
              </div>
              {actions && step === yours && (
                <div className="ml-auto flex shrink-0 items-center gap-[7px] pt-px pl-4">
                  {actions}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {footer && <div className="mt-3.5 flex items-center gap-2">{footer}</div>}
    </div>
  )
}
