import { useDroppable } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "cn"
import type { ReactNode } from "react"

import { Icon, type IconName } from "@/components/icon"
import { AddSlot, AuditIcon, StatusPill } from "@/components/stellic/primitives"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  CREDIT_GROUP_LABEL,
  termCredits,
  termMeta,
  type DraftMark,
  type PlannedCourse,
  type Term,
  type Year,
  type YearPhase,
} from "@/data/plan"

/* ============================================================ AuditRow
   One course inside a semester card. Padding subtracts the border width
   (see button.tsx for why). */

/* How a draft marks a course it wants to add, relocate or drop. A marked course
 * keeps its place on the canvas so the student can see what changed. */
const DRAFT_STYLE: Record<DraftMark, { card: string; note: string; icon: IconName }> = {
  added: { card: "border-success-50 bg-success-5", note: "text-success-100", icon: "add" },
  moved: { card: "border-warning-50 bg-warning-5", note: "text-warning-50", icon: "remove" },
  removed: { card: "border-alert-50 bg-alert-5", note: "text-alert-100", icon: "remove" },
}

/** Entrance delay, so a term's cards land one after another rather than all at
 *  once. Capped, or the tail of a long plan would still be arriving. */
function enterDelay(order: number): string {
  return `${Math.min(order, 14) * 45}ms`
}

type AuditRowProps = {
  course: PlannedCourse
  /** Registered courses are fixed in place: no handle, no hover affordance. */
  locked?: boolean
  /** The row left behind while its course rides the drag overlay. */
  ghosted?: boolean
  /** The copy under the cursor. */
  overlay?: boolean
  /** Present only where the course can leave the plan; reveals the × on hover. */
  onRemove?: () => void
}

export function AuditRow({ course, locked, ghosted, overlay, onRemove }: AuditRowProps) {
  const draft = course.draft
  const style = draft ? DRAFT_STYLE[draft.mark] : null
  const struck = draft?.mark === "moved" || draft?.mark === "removed"

  return (
    <div
      style={draft ? { animationDelay: enterDelay(draft.order) } : undefined}
      className={cn(
        "group relative flex w-full items-center gap-2 rounded-md border bg-card",
        locked ? "px-[15px] py-[7px]" : "p-[7px]",
        style ? style.card : "border-gray-40",
        !locked && !draft && "cursor-grab transition-colors hover:bg-gray-5",
        draft && "animate-rise",
        ghosted && "opacity-40",
        overlay && "cursor-grabbing shadow-secondary"
      )}
    >
      {onRemove && (
        <button
          type="button"
          aria-label={`Remove ${course.name}`}
          /* Keep the drag sensor out of it, or the press starts a drag. */
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onRemove}
          className="absolute top-1 right-1 flex size-5 cursor-pointer items-center justify-center rounded-md text-gray-80 opacity-0 transition-opacity hover:bg-gray-40 hover:text-gray-100 focus-visible:opacity-100 group-hover:opacity-100"
        >
          <Icon name="close" size={12} />
        </button>
      )}
      {!locked && <Icon name="drag-indicator" size={16} className="text-foreground" />}

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
        <div>
          <p className="text-body-md text-gray-80">{course.code}</p>
          <p className={cn("text-body-md font-semibold text-foreground", struck && "line-through")}>
            {course.name}
          </p>
        </div>
        {course.section && (
          <p className="flex items-center gap-1 text-body-md text-foreground">
            <Icon name="calendar-today" size={14} />
            {course.section}
          </p>
        )}
        {draft && style && (
          <p className={cn("flex items-center gap-1 pt-1 text-label-md", style.note)}>
            <Icon name={style.icon} size={16} />
            {draft.note}
          </p>
        )}
      </div>

      {course.notes != null && (
        <Badge variant="quiet">
          <Icon name="sticky-note-2" size={12} />
          {course.notes}
        </Badge>
      )}
    </div>
  )
}

function SortableAuditRow({
  course,
  onRemove,
}: {
  course: PlannedCourse
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: course.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      /* touch-none stops the browser from claiming the gesture as a scroll. */
      className="touch-none outline-none"
      {...attributes}
      {...listeners}
    >
      <AuditRow course={course} ghosted={isDragging} onRemove={onRemove} />
    </div>
  )
}

/* ============================================================ CreditGroup
   "In Progress (12 Credits)" / "Planned (6 Credits)" — summed from the term's
   own courses, so the heading can never drift from the list beneath it. The
   badges tally what a draft proposes for this term. */

function CreditGroup({ term }: { term: Term }) {
  const credits = termCredits(term)
  const added = term.courses.filter((c) => c.draft?.mark === "added").length
  const dropped = term.courses.filter(
    (c) => c.draft?.mark === "removed" || c.draft?.mark === "moved"
  ).length

  return (
    <div className="flex w-full items-center justify-between gap-2 pt-4">
      <p
        className={cn(
          "flex items-center gap-2 text-body-md font-semibold text-gray-80",
          /* The design gives planned groups a 24px band; registered hug at 20. */
          term.state === "planned" && "h-6"
        )}
      >
        <AuditIcon state={term.state} />
        {CREDIT_GROUP_LABEL[term.state]} ({credits} Credit{credits === 1 ? "" : "s"})
      </p>
      {added + dropped > 0 && (
        <div className="flex shrink-0 items-center gap-1">
          {added > 0 && <Badge variant="success">+{added}</Badge>}
          {dropped > 0 && <Badge variant="danger">-{dropped}</Badge>}
        </div>
      )}
    </div>
  )
}

/* ============================================================ SemesterCard
   Also the drop target: the whole card accepts a course unless it is locked. */

export function SemesterCard({
  term,
  alert,
  frozen,
  onRemoveCourse,
  onExplain,
}: {
  term: Term
  alert?: ReactNode
  /** A draft is on screen: its cards are a proposal, not something to rearrange. */
  frozen?: boolean
  onRemoveCourse: (courseId: string) => void
  /** Offered only while there is a draft to explain. */
  onExplain?: () => void
}) {
  const { setNodeRef, isOver, active } = useDroppable({
    id: term.id,
    disabled: term.locked || frozen,
  })

  /* Only light up while something is actually being dragged. */
  const isTarget = isOver && active != null

  /* The design only gives the header a bottom gap when something follows it
   * other than the course list. */
  const headerHasGap = term.alert != null || term.courses.length === 0 || frozen

  const rows = term.courses.map((course) =>
    term.locked || frozen ? (
      <AuditRow key={course.id} course={course} locked={term.locked} />
    ) : (
      <SortableAuditRow
        key={course.id}
        course={course}
        onRemove={() => onRemoveCourse(course.id)}
      />
    )
  )

  return (
    <Card
      ref={setNodeRef}
      data-term={term.id}
      className={cn(
        "w-full min-w-0 gap-0 rounded-md border-gray-40 p-[23px] shadow-none transition-colors",
        "@3xl:w-auto @3xl:flex-1 @3xl:self-stretch",
        isTarget && "border-primary bg-primary-0/40"
      )}
    >
      <div className="flex w-full flex-col gap-2">
        <div
          className={cn(
            "flex w-full flex-wrap items-center justify-between gap-x-2 gap-y-1",
            headerHasGap && "pb-4"
          )}
        >
          <div className="flex flex-col gap-1">
            <h4 className="flex items-center gap-1 text-caption-lg font-semibold text-gray-100">
              {term.name}
              <Icon name="chevron-right" size={16} className="text-gray-80" />
            </h4>
            <p className="text-body-md text-gray-80">{termMeta(term)}</p>
          </div>
          {onExplain ? (
            <Button size="sm" onClick={onExplain}>
              <Icon name="auto-awesome" size={16} />
              Explain
            </Button>
          ) : (
            <StatusPill
              status={term.reviewed ? "reviewed" : "unreviewed"}
              className={cn(!term.reviewed && "opacity-0")}
            >
              {term.reviewed ? "reviewed" : "Unreviewed"}
            </StatusPill>
          )}
        </div>

        {alert}

        {term.courses.length > 0 && <CreditGroup term={term} />}

        {frozen ? (
          <div className="flex flex-col gap-2">{rows}</div>
        ) : (
          <SortableContext
            items={term.courses.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {rows}
              <AddSlot>+ Add to Term</AddSlot>
            </div>
          </SortableContext>
        )}
      </div>
    </Card>
  )
}

/* ============================================================ NoActionsAlert
   The quiet counterpart to the registration banner: this term needs nothing
   from you right now. */

export function NoActionsAlert() {
  return (
    <Alert variant="success" className="animate-fade">
      <Icon name="check-circle" size={16} className="shrink-0 text-success-100" />
      <span className="min-w-0 flex-1 truncate font-semibold">
        No actions required at the moment
      </span>
    </Alert>
  )
}

/* ============================================================ TimelineRail
   The spine down the left of the planner. Phase drives both the node glyph and
   the connector colour. */

const RAIL_NODE = {
  complete: { icon: "check-circle", tone: "text-success-100" },
  active: { icon: "timelapse", tone: "text-warning-50" },
  future: { icon: "arrow-circle-right", tone: "text-gray-60" },
} as const

export function TimelineRail({ phase, nodes }: { phase: YearPhase; nodes: 1 | 2 }) {
  const { icon, tone } = RAIL_NODE[phase]
  const line = phase === "active" ? "bg-warning-50" : "bg-gray-60"

  /* A single node sits in a 24px gutter with a 4px lead; a pair hugs to 20px
   * and is joined by the connector. Both come straight from the design. */
  if (nodes === 1) {
    return (
      <div className="flex w-6 shrink-0 flex-col items-center self-stretch pt-1">
        <Icon name={icon} size={20} className={tone} />
      </div>
    )
  }

  return (
    <div className="flex shrink-0 flex-col items-center self-stretch">
      <span className="h-3" />
      <Icon name={icon} size={20} className={tone} />
      <span className={cn("w-0.5 min-h-0 flex-1", line)} />
      <Icon name={icon} size={20} className={tone} />
    </div>
  )
}

/* ============================================================ YearSection */

export function YearSection({
  year,
  renderAlert,
  frozen,
  onRemoveCourse,
  onExplain,
}: {
  year: Year
  renderAlert?: (term: Term) => ReactNode
  frozen?: boolean
  onRemoveCourse: (courseId: string) => void
  onExplain?: (term: Term) => void
}) {
  return (
    <section className="flex items-start gap-4">
      <TimelineRail phase={year.phase} nodes={2} />
      <div className="flex min-w-0 flex-1 flex-col items-start pb-8">
        <div className="-mb-px flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-2 pb-4">
          <h3 className="flex items-center gap-1 text-h300 font-semibold text-gray-100">
            {year.label}
            <Icon name="unfold-less" size={16} />
          </h3>
          <Button>
            <Icon name="add" size={16} />
            Add Term
          </Button>
        </div>
        {/* Two cards need ~768px of planner; below that they stack. */}
        <div className="flex w-full flex-col gap-4 @3xl:flex-row @3xl:items-start">
          {year.terms.map((term) => (
            <SemesterCard
              key={term.id}
              term={term}
              alert={renderAlert?.(term)}
              frozen={frozen}
              onRemoveCourse={onRemoveCourse}
              onExplain={onExplain && !term.locked ? () => onExplain(term) : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
