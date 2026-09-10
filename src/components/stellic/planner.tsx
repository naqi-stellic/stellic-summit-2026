import { useDroppable } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "cn"
import type { ReactNode } from "react"

import { Icon } from "@/components/icon"
import { AddSlot, AuditIcon, StatusPill } from "@/components/stellic/primitives"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { PlannedCourse, Term, Year, YearPhase } from "@/data/plan"

/* ============================================================ AuditRow
   One course inside a semester card. Padding subtracts the border width
   (see button.tsx for why). */

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
  return (
    <div
      className={cn(
        "group relative flex w-full items-center gap-2 rounded-md border border-gray-40 bg-card",
        locked ? "px-[15px] py-[7px]" : "p-[7px]",
        !locked && "cursor-grab transition-colors hover:bg-gray-5",
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
          <p className="text-body-md font-semibold text-foreground">{course.name}</p>
        </div>
        {course.section && (
          <p className="flex items-center gap-1 text-body-md text-foreground">
            <Icon name="calendar-today" size={14} />
            {course.section}
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
   "In Progress (27 Credits)" / "Planned (27 Credits)", with optional deltas.
   The design gives the Planned row a 24px band; In Progress hugs at 20px. */

function CreditGroup({ group }: { group: NonNullable<Term["group"]> }) {
  return (
    <div className="flex w-full items-center justify-between pt-4">
      <p
        className={cn(
          "flex items-center gap-2 text-body-md font-semibold text-gray-80",
          /* The design gives planned groups a 24px band; registered hug at 20. */
          group.state === "planned" && "h-6"
        )}
      >
        <AuditIcon state={group.state} />
        {group.label} ({group.credits} Credits)
      </p>
      {group.deltas && (
        <div className="flex items-center gap-1">
          <Badge variant="success">+{group.deltas.added}</Badge>
          <Badge variant="danger">-{group.deltas.removed}</Badge>
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
  onRemoveCourse,
}: {
  term: Term
  alert?: ReactNode
  onRemoveCourse: (courseId: string) => void
}) {
  const { setNodeRef, isOver, active } = useDroppable({ id: term.id, disabled: term.locked })

  /* Only light up while something is actually being dragged. */
  const isTarget = isOver && active != null

  /* The design only gives the header a bottom gap when something follows it
   * other than the course list. */
  const headerHasGap = term.alert != null || term.courses.length === 0

  return (
    <Card
      ref={setNodeRef}
      data-term={term.id}
      className={cn(
        "min-w-0 flex-1 self-stretch gap-0 rounded-md border-gray-40 p-[23px] shadow-none transition-colors",
        isTarget && "border-primary bg-primary-0/40"
      )}
    >
      <div className="flex w-full flex-col gap-2">
        <div className={cn("flex w-full items-center justify-between", headerHasGap && "pb-4")}>
          <div className="flex flex-col gap-1">
            <h4 className="flex items-center gap-1 text-caption-lg font-semibold text-gray-100">
              {term.name}
              <Icon name="chevron-right" size={16} className="text-gray-80" />
            </h4>
            <p className="text-body-md text-gray-80">{term.meta}</p>
          </div>
          <StatusPill
            status={term.reviewed ? "reviewed" : "unreviewed"}
            className={cn(!term.reviewed && "opacity-0")}
          >
            {term.reviewed ? "reviewed" : "Unreviewed"}
          </StatusPill>
        </div>

        {alert}

        {term.group && <CreditGroup group={term.group} />}

        <SortableContext
          items={term.courses.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {term.courses.map((course) =>
              term.locked ? (
                <AuditRow key={course.id} course={course} locked />
              ) : (
                <SortableAuditRow
                  key={course.id}
                  course={course}
                  onRemove={() => onRemoveCourse(course.id)}
                />
              )
            )}
            <AddSlot>+ Add to Term</AddSlot>
          </div>
        </SortableContext>
      </div>
    </Card>
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
  onRemoveCourse,
}: {
  year: Year
  renderAlert?: (term: Term) => ReactNode
  onRemoveCourse: (courseId: string) => void
}) {
  return (
    <section className="flex items-start gap-4">
      <TimelineRail phase={year.phase} nodes={2} />
      <div className="flex min-w-0 flex-1 flex-col items-start pb-8">
        <div className="-mb-px flex w-full items-center justify-between pb-4">
          <h3 className="flex items-center gap-1 text-h300 font-semibold text-gray-100">
            {year.label}
            <Icon name="unfold-less" size={16} />
          </h3>
          <Button>
            <Icon name="add" size={16} />
            Add Term
          </Button>
        </div>
        <div className="flex w-full items-start gap-4">
          {year.terms.map((term) => (
            <SemesterCard
              key={term.id}
              term={term}
              alert={renderAlert?.(term)}
              onRemoveCourse={onRemoveCourse}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
