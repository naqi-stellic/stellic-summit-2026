import { cn } from "cn"
import { useState, type ReactNode } from "react"

import { Icon } from "@/components/icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { STUDENT } from "@/data/plan"
import { ADVISOR, longWhen, shortWhen, type Review } from "@/data/review"

/* Where a request stands once it has gone out. The plan itself carries a mark
 * on the terms under review; this is the account of who asked, for what, and
 * how far it has got. */

const TABS = ["Changes", "Plan Reviews", "Graduation Clearance"] as const

/** One step of a request: done, under way, or still to come. */
function Marker({ state }: { state: "done" | "now" | "later" }) {
  if (state === "done") {
    return (
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-success-50 text-white">
        <Icon name="check" size={12} />
      </span>
    )
  }
  if (state === "now") {
    return <Icon name="timelapse" size={20} className="shrink-0 text-warning-50" />
  }
  return <span className="size-5 shrink-0 rounded-full border border-gray-40" />
}

function Stage({
  state,
  title,
  last,
  children,
}: {
  state: "done" | "now" | "later"
  title: string
  /** The last stage has nothing under it, so it carries no gap. */
  last?: boolean
  children?: ReactNode
}) {
  return (
    <div className="flex w-full gap-3">
      <Marker state={state} />
      <div className={cn("flex min-w-0 flex-1 flex-col gap-1", !last && "pb-4")}>
        <span className="text-body-md font-semibold text-foreground">{title}</span>
        {children}
      </div>
    </div>
  )
}

/** A line of the request's own detail: what it is against, and which terms. */
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex gap-2 text-body-md">
      <span className="w-[100px] shrink-0 text-gray-80">{label}</span>
      <span className="min-w-0 flex-1 text-foreground">{value}</span>
    </span>
  )
}

function RequestCard({
  review,
  open,
  onToggle,
  onCancel,
}: {
  review: Review
  open: boolean
  onToggle: () => void
  onCancel: () => void
}) {
  const pending = review.status === "pending"

  return (
    <div className="flex w-full flex-col rounded-md border border-gray-40 bg-card">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-2 p-[15px] text-left"
      >
        <span className="min-w-0 flex-1 truncate text-body-md text-foreground">
          Requested {shortWhen(review.requestedAt)}
        </span>
        <Badge variant={pending ? "warning" : "success"}>{pending ? "Pending" : "Complete"}</Badge>
        <Icon
          name={open ? "expand-less" : pending ? "expand-more" : "chevron-right"}
          size={16}
          className="shrink-0 text-gray-80"
        />
      </button>

      {open && (
        <div className="flex w-full flex-col gap-4 px-[15px] pb-[15px]">
          <div className="flex w-full flex-col">
            <Stage state="done" title="Request to Review">
              <span className="text-body-md text-foreground">{STUDENT.name}</span>
              <span className="flex flex-col gap-1 pt-1">
                <Detail label="Reference Plan:" value={review.plan} />
                <Detail label="Terms:" value={review.termNames.join(", ")} />
              </span>
              <span className="pt-2 text-body-md text-gray-80">
                {longWhen(review.requestedAt)}
              </span>
            </Stage>
            <Stage state={pending ? "now" : "done"} title="Review">
              <span className="text-body-md text-foreground">{ADVISOR.name}</span>
            </Stage>
            <Stage state={pending ? "later" : "done"} title="Complete" last />
          </div>

          {review.notes && (
            <p className="w-full rounded-md border border-gray-40 bg-gray-0 p-[11px] text-body-md text-gray-100">
              {review.notes}
            </p>
          )}

          {pending && (
            <button
              type="button"
              onClick={onCancel}
              className="w-fit cursor-pointer text-body-md text-gray-100 underline [text-underline-position:from-font]"
            >
              Cancel Request
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function ReviewPanel({
  reviews,
  onCancel,
  onClose,
}: {
  /** Newest first. */
  reviews: Review[]
  onCancel: (id: string) => void
  onClose: () => void
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Plan Reviews")
  /* The request being waited on opens itself; the ones behind it are history
     until they are asked for. */
  const [open, setOpen] = useState<string[]>(
    reviews.filter((r) => r.status === "pending").map((r) => r.id)
  )
  const pending = reviews.filter((r) => r.status === "pending").length

  return (
    <aside className="flex h-full w-full flex-col overflow-x-clip overflow-y-auto bg-card">
      <header className="flex shrink-0 items-center justify-end px-6 pt-3">
        <Button variant="ghost" size="icon" aria-label="Close plan reviews" onClick={onClose}>
          <Icon name="s-close" size={16} />
        </Button>
      </header>

      <div className="flex shrink-0 items-center gap-6 border-b border-gray-40 px-6">
        {TABS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setTab(name)}
            className={cn(
              "flex cursor-pointer items-center gap-2 border-b-2 pt-1 pb-3 text-body-md transition-colors",
              tab === name
                ? "border-primary-50 font-semibold text-primary-50"
                : "border-transparent text-gray-100 hover:text-gray-80"
            )}
          >
            {name}
            {name === "Plan Reviews" && pending > 0 && (
              <Badge variant="secondary">{pending}</Badge>
            )}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-6">
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
                open={open.includes(review.id)}
                onToggle={() =>
                  setOpen((current) =>
                    current.includes(review.id)
                      ? current.filter((id) => id !== review.id)
                      : [...current, review.id]
                  )
                }
                onCancel={() => onCancel(review.id)}
              />
            ))
          )
        ) : (
          <p className="text-body-md text-gray-80">
            {tab === "Changes"
              ? "Nothing has changed on this plan since it was last reviewed."
              : "Graduation clearance opens in your final year."}
          </p>
        )}
      </div>
    </aside>
  )
}
