import { cn } from "cn"
import { useState } from "react"

import { Icon } from "@/components/icon"
import { Alert } from "@/components/ui/alert"
import { useTermIssues } from "@/components/stellic/plan-issues"
import type { Term } from "@/data/plan"

/* What a term is waiting on. The term view states it outright above the
 * schedule; the planner, where every term is on screen at once, states the
 * count and opens onto the same lines. */

/** One line per course, saying what it is missing and how to settle it. */
export function ActionLines({
  term,
  onPickSection,
}: {
  term: Term
  /** Settles a course on a section. Stands in for a section search. */
  onPickSection?: (termId: string, courseId: string) => void
}) {
  const issues = useTermIssues(term)

  return (
    <>
      {issues.map((issue, i) => (
        <p key={`${issue.course.id}-${i}`} className="flex w-full flex-wrap items-center gap-2 text-body-md">
          <Icon name="warning" size={16} className="shrink-0 text-warning-50" />
          <span className="font-semibold">{issue.course.name}</span>
          <span>{issue.says}</span>
          {issue.action && (
            <button
              type="button"
              onClick={() => onPickSection?.(term.id, issue.course.id)}
              className="cursor-pointer underline [text-underline-position:from-font]"
            >
              {issue.action}
            </button>
          )}
        </p>
      ))}
    </>
  )
}

/** The planner's version: a count that opens onto the lines. Folded to begin
 *  with, because the point on the canvas is that there is something to do
 *  here at all — the detail is one click away. */
export function TermActions({
  term,
  onPickSection,
}: {
  term: Term
  onPickSection?: (termId: string, courseId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const actions = useTermIssues(term)
  if (actions.length === 0) return null

  return (
    /* pt-4 for the same reason the credit group has it: the card separates its
       blocks by 24px and its list by 8px, and 8px of that 24 is the stack's own
       gap. Without it this block alone sits tight under the banner. */
    <div className="flex w-full flex-col gap-2 pt-4">
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
          <ActionLines term={term} onPickSection={onPickSection} />
        </Alert>
      )}
    </div>
  )
}
