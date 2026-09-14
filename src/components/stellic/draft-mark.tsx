import { cn } from "cn"

import { Icon, type IconName } from "@/components/icon"
import type { DraftMark, PlannedCourse } from "@/data/plan"

/* How a draft marks a course it wants to add, relocate or drop. A marked course
 * keeps its place wherever it is shown — on the canvas, in a term's list, or
 * beside a term's calendar — so the same change reads the same everywhere. */

export const DRAFT_STYLE: Record<DraftMark, { card: string; note: string; icon: IconName }> = {
  added: { card: "border-success-50 bg-success-5", note: "text-success-100", icon: "add" },
  moved: { card: "border-warning-50 bg-warning-5", note: "text-warning-50", icon: "remove" },
  removed: { card: "border-alert-50 bg-alert-5", note: "text-alert-100", icon: "remove" },
}

/** Whether the draft has struck this course out of where it sits. */
export function isStruck(course: PlannedCourse): boolean {
  return course.draft?.mark === "moved" || course.draft?.mark === "removed"
}

/** The line under a marked course saying what the draft did and why. */
export function DraftNote({ course, className }: { course: PlannedCourse; className?: string }) {
  const draft = course.draft
  if (!draft) return null
  const style = DRAFT_STYLE[draft.mark]

  return (
    <span className={cn("flex items-center gap-1 text-label-md", style.note, className)}>
      <Icon name={style.icon} size={16} className="shrink-0" />
      {draft.note}
    </span>
  )
}
