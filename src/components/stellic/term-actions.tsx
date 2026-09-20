import { cn } from "cn"
import { useState } from "react"

import { Icon } from "@/components/icon"
import { Alert } from "@/components/ui/alert"
import { useTermIssues } from "@/components/stellic/plan-issues"
import { worstOf } from "@/data/issues"
import type { Term } from "@/data/plan"

/* What a term is waiting on. The term view states it outright above the
 * schedule; the planner, where every term is on screen at once, states the
 * count and opens onto the same lines. */

/** One line per course, saying what it is missing and how to settle it. */
export function ActionLines({
  term,
  onPickSection,
  onOpenCourse,
}: {
  term: Term
  /** Settles a course on a section. Stands in for a section search. */
  onPickSection?: (termId: string, courseId: string) => void
  /** Opens the course the line is about, which is where the rest of the
   *  answer is: what it asks for, and where it fits. */
  onOpenCourse?: (courseId: string) => void
}) {
  const issues = useTermIssues(term)

  return (
    <>
      {/* One line each, wrapping rather than truncating: the course, what is
          wrong with it, and the way to the rest of the answer. */}
      {issues.map((issue, i) => (
        <p key={`${issue.course.id}-${i}`} className="w-full text-body-md">
          {/* A prerequisite that is not met is the one thing here that stops a
              term happening, so it is the one thing drawn in red. */}
          <Icon
            name={issue.severity === "error" ? "error-outline" : "warning"}
            size={16}
            className={cn(
              "mr-2 -mb-0.5 inline-block shrink-0",
              issue.severity === "error" ? "text-alert-100" : "text-warning-50"
            )}
          />
          <span className="font-semibold">{issue.course.code}</span>{" "}
          <span>
            {issue.course.name}: {issue.says}
          </span>{" "}
          <button
            type="button"
            onClick={() =>
              issue.kind === "section"
                ? onPickSection?.(term.id, issue.course.id)
                : onOpenCourse?.(issue.course.id)
            }
            className="cursor-pointer underline [text-underline-position:from-font]"
          >
            {issue.action}
          </button>
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
  onOpenCourse,
}: {
  term: Term
  onPickSection?: (termId: string, courseId: string) => void
  onOpenCourse?: (courseId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const actions = useTermIssues(term)
  const worst = worstOf(actions)
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
          worst === "error" ? "text-alert-100" : "text-warning-50"
        )}
      >
        <Icon
          name={worst === "error" ? "error-outline" : "warning"}
          size={16}
          className="shrink-0"
        />
        {actions.length} action{actions.length === 1 ? "" : "s"} required
        <Icon name={open ? "expand-more" : "chevron-right"} size={16} className="shrink-0" />
      </button>

      {open && (
        <Alert
          variant={worst === "error" ? "danger" : "warning"}
          className="flex-col items-start gap-2 p-[15px]"
        >
          <ActionLines
            term={term}
            onPickSection={onPickSection}
            onOpenCourse={onOpenCourse}
          />
        </Alert>
      )}
    </div>
  )
}
