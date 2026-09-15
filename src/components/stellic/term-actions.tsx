import { cn } from "cn"
import { useState } from "react"

import { Icon } from "@/components/icon"
import { Alert } from "@/components/ui/alert"
import { missingLine, termActions, type Term } from "@/data/plan"

/* What a term is waiting on. The term view states it outright above the
 * schedule; the planner, where every term is on screen at once, states the
 * count and opens onto the same lines. */

/** One line per course, saying what it is missing and how to settle it. */
export function ActionLines({ term }: { term: Term }) {
  return (
    <>
      {termActions(term).map((course) => {
        const missing = missingLine(course, term)
        return (
          <p key={course.id} className="flex w-full flex-wrap items-center gap-2 text-body-md">
            <Icon name="warning" size={16} className="shrink-0 text-warning-50" />
            <span className="font-semibold">{course.name}</span>
            <span>{missing.says}</span>
            <button
              type="button"
              className="cursor-pointer underline [text-underline-position:from-font]"
            >
              {missing.action}
            </button>
          </p>
        )
      })}
    </>
  )
}

/** The planner's version: a count that opens onto the lines. Folded to begin
 *  with, because the point on the canvas is that there is something to do
 *  here at all — the detail is one click away. */
export function TermActions({ term }: { term: Term }) {
  const [open, setOpen] = useState(false)
  const actions = termActions(term)
  if (actions.length === 0) return null

  return (
    <div className="flex w-full flex-col gap-2">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((shown) => !shown)}
        className={cn(
          "flex cursor-pointer items-center gap-1 self-start text-body-md font-semibold",
          "text-warning-50"
        )}
      >
        <Icon name="warning" size={16} className="shrink-0" />
        {actions.length} action{actions.length === 1 ? "" : "s"} required
        <Icon name={open ? "expand-more" : "chevron-right"} size={16} className="shrink-0" />
      </button>

      {open && (
        <Alert variant="warning" className="flex-col items-start gap-2 p-[15px]">
          <ActionLines term={term} />
        </Alert>
      )}
    </div>
  )
}
