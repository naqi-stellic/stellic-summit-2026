import { cn } from "cn"
import { useState, type ReactNode } from "react"

import { Icon } from "@/components/icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { STUDENT, type Year } from "@/data/plan"
import {
  ADVISOR,
  REVIEW_INSTRUCTIONS,
  changesSince,
  longWhen,
  shortWhen,
  type Review,
} from "@/data/review"

/* Where a request stands once it has gone out. The plan itself carries a mark
 * on the terms under review; this is the account of who asked, for what, and
 * how far it has got. */

const TABS = ["Changes", "Plan Reviews", "Graduation Clearance"] as const

/** One step of a request: done, under way, or still to come. */
function Marker({ state }: { state: "done" | "now" | "later" }) {
  if (state === "done") {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success-50 text-white">
        <Icon name="check" size={14} />
      </span>
    )
  }
  if (state === "now") {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-warning-25 text-white">
        <Icon name="watch-later" size={14} />
      </span>
    )
  }
  return <span className="size-6 shrink-0 rounded-full border border-gray-40 bg-card" />
}

function Stage({
  state,
  title,
  last,
  action,
  children,
}: {
  state: "done" | "now" | "later"
  title: string
  /** The rail stops at the last stage rather than running past it. */
  last?: boolean
  /** What can be done at this step, drawn at the end of its first row. */
  action?: ReactNode
  children?: ReactNode
}) {
  return (
    <div className="flex w-full gap-[15px]">
      {/* The rail hangs from the marker through this stage's own content, so
          it stretches with whatever the stage has to say. */}
      <div className="flex flex-col items-center">
        <Marker state={state} />
        {!last && <span className="w-px flex-1 bg-gray-40" />}
      </div>

      <div className={cn("flex min-w-0 flex-1 flex-col gap-4", !last && "pb-4")}>
        <div className="flex w-full items-start gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {/* The step that has happened is stated; the ones still to come
                are only labelled. */}
            <span
              className={cn(
                state === "done"
                  ? "text-body-md leading-4 font-semibold text-foreground"
                  : "text-label-md text-foreground"
              )}
            >
              {title}
            </span>
            {children}
          </div>
          {action}
        </div>
      </div>
    </div>
  )
}

/** A line of the request's own detail: what it is against, and which terms. */
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex gap-4 text-body-md text-gray-80">
      <span className="w-[100px] shrink-0">{label}</span>
      <span className="min-w-0 flex-1">{value}</span>
    </span>
  )
}

function RequestCard({
  review,
  changes,
  open,
  onToggle,
  onComplete,
  onCancel,
}: {
  review: Review
  /** How much of the plan has moved since the request went out. */
  changes: number
  open: boolean
  onToggle: () => void
  onComplete: () => void
  onCancel: () => void
}) {
  const pending = review.status === "pending"

  return (
    <div className="flex w-full flex-col rounded-md border border-gray-40 bg-card shadow-secondary">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-2 px-6 py-[15px] text-left"
      >
        <span className="min-w-0 flex-1 truncate text-body-md font-semibold text-foreground">
          Requested {shortWhen(review.requestedAt)}
        </span>
        <Badge
          className={cn(
            "text-label-sm font-normal",
            pending ? "bg-warning-5 text-warning-100" : "bg-success-5 text-success-100"
          )}
        >
          {pending ? "Pending" : "Complete"}
        </Badge>
        <Icon
          name={open ? "expand-less" : "expand-more"}
          size={24}
          className="shrink-0 text-gray-100"
        />
      </button>

      {open && (
        <div className="flex w-full flex-col gap-6 px-6 pb-6">
          <div className="flex w-full flex-col">
            <Stage state="done" title="Request to Review">
              <span className="text-body-md text-foreground">{STUDENT.name}</span>
              <span className="flex flex-col gap-1 pt-3">
                <Detail label="Reference Plan:" value={review.plan} />
                <Detail label="Terms:" value={review.termNames.join(", ")} />
              </span>
              {review.notes && (
                <span className="flex gap-4 pt-1 text-body-md text-gray-80">
                  <span className="w-[100px] shrink-0">Notes:</span>
                  <span className="min-w-0 flex-1">{review.notes}</span>
                </span>
              )}
              <span className="pt-3 text-body-md text-gray-80">
                {longWhen(review.requestedAt)}
              </span>
            </Stage>

            <Stage
              state={pending ? "now" : "done"}
              title="Review"
              action={
                pending && (
                  <Button variant="primary" onClick={onComplete}>
                    Complete
                  </Button>
                )
              }
            >
              <span className="text-body-md text-foreground">{ADVISOR.name}</span>
              <span className="flex gap-4 pt-3 text-body-md text-gray-80">
                <span className="w-[100px] shrink-0">Instructions:</span>
                <span className="min-w-0 flex-1">{REVIEW_INSTRUCTIONS}</span>
              </span>
            </Stage>

            <Stage state={pending ? "later" : "done"} title="Complete" last />
          </div>

          <div className="flex flex-wrap items-start gap-6 text-body-md text-gray-80">
            {changes > 0 && (
              <span className="underline [text-underline-position:from-font]">
                {changes} change{changes === 1 ? "" : "s"} during review request
              </span>
            )}
            {pending && (
              <button
                type="button"
                onClick={onCancel}
                className="cursor-pointer underline [text-underline-position:from-font]"
              >
                Cancel Request
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function ReviewPanel({
  reviews,
  years,
  onComplete,
  onCancel,
  onClose,
}: {
  /** Newest first. */
  reviews: Review[]
  /** The plan as it stands, for counting what has moved since a request. */
  years: Year[]
  onComplete: (id: string) => void
  onCancel: (id: string) => void
  onClose: () => void
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Plan Reviews")
  /* The request being waited on opens itself; the ones behind it are history
     until they are asked for. */
  const [open, setOpen] = useState<string[]>(
    reviews.filter((r) => r.status === "pending").map((r) => r.id)
  )

  const pending = reviews.find((r) => r.status === "pending")
  const changes = pending ? changesSince(pending.at, years) : 0
  const counts: Partial<Record<(typeof TABS)[number], number>> = {
    Changes: changes,
    "Plan Reviews": reviews.filter((r) => r.status === "pending").length,
  }

  return (
    <aside className="flex h-full w-full flex-col items-end gap-4 overflow-x-clip overflow-y-auto bg-background p-6">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close plan reviews"
        className="shrink-0 cursor-pointer rounded-md text-gray-100"
      >
        <Icon name="close" size={24} />
      </button>

      <div className="flex w-full min-w-0 flex-col gap-4">
        {/* The strip the panel is read through, and what it is showing. */}
        <div className="flex w-full items-end gap-0 overflow-x-auto border-b border-gray-40">
          {TABS.map((name) => {
            const active = tab === name
            const count = counts[name]
            return (
              <button
                key={name}
                type="button"
                onClick={() => setTab(name)}
                className={cn(
                  "flex h-10 shrink-0 cursor-pointer items-center justify-center gap-3 px-4 py-2",
                  "text-caption-lg font-semibold whitespace-nowrap transition-colors",
                  active
                    ? "border-b-2 border-primary-50 text-primary-50"
                    : "border-b-2 border-transparent text-gray-100 hover:text-gray-80"
                )}
              >
                {name}
                {count != null && count > 0 && (
                  <Badge
                    className={cn(
                      "px-2 text-body-md font-semibold",
                      active ? "bg-primary-0 text-primary-50" : "bg-gray-5 text-gray-100"
                    )}
                  >
                    {count}
                  </Badge>
                )}
              </button>
            )
          })}
        </div>

        {tab === "Plan Reviews" ? (
          reviews.length === 0 ? (
            <p className="text-body-md text-gray-80">
              No reviews have been asked for on this plan yet.
            </p>
          ) : (
            reviews.map((review) => (
              <RequestCard
                key={review.id}
                review={review}
                changes={review.status === "pending" ? changes : 0}
                open={open.includes(review.id)}
                onToggle={() =>
                  setOpen((current) =>
                    current.includes(review.id)
                      ? current.filter((id) => id !== review.id)
                      : [...current, review.id]
                  )
                }
                onComplete={() => onComplete(review.id)}
                onCancel={() => onCancel(review.id)}
              />
            ))
          )
        ) : (
          <p className="text-body-md text-gray-80">
            {tab === "Changes"
              ? changes > 0
                ? `${changes} course${changes === 1 ? " has" : "s have"} moved since the review was asked for.`
                : "Nothing has changed on this plan since it was last reviewed."
              : "Graduation clearance opens in your final year."}
          </p>
        )}
      </div>
    </aside>
  )
}
