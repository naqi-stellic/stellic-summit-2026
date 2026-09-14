import { useDroppable } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "cn"
import type { ReactNode } from "react"

import { Icon } from "@/components/icon"
import { AddCourseMenu } from "@/components/stellic/add-course-menu"
import { DRAFT_STYLE, DraftNote, isStruck } from "@/components/stellic/draft-mark"
import { AuditIcon, StatusPill } from "@/components/stellic/primitives"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { CatalogEntry } from "@/data/catalog"
import {
  CREDIT_GROUP_LABEL,
  termCredits,
  termMeta,
  type PlannedCourse,
  type Term,
  type Year,
  type YearPhase,
} from "@/data/plan"

/* ============================================================ AuditRow
   One course inside a semester card. Padding subtracts the border width
   (see button.tsx for why). */

/** How far apart the cards of a landing draft arrive. The tallies count in
 *  step with it, so the same value drives both. */
export const STREAM_MS = 130

/** The last card that gets a delay of its own; past this the tail lands
 *  together rather than keeping a long plan arriving for half a minute. */
export const STREAM_CAP = 36

/** Entrance delay. The generator places one course at a time and the cards
 *  follow it, far enough apart to be seen arriving one by one. */
function enterDelay(order: number): string {
  return `${Math.min(order, STREAM_CAP) * STREAM_MS}ms`
}

/** The same idea on the way out: accepting a draft settles the cards in the
 *  order the generator placed them rather than all at once. */
function settleDelay(order: number): string {
  return `${Math.min(order, 14) * 35}ms`
}

type AuditRowProps = {
  course: PlannedCourse
  /** Registered courses are fixed in place: no handle, no hover affordance. */
  locked?: boolean
  /** The row left behind while its course rides the drag overlay. */
  ghosted?: boolean
  /** The copy under the cursor. */
  overlay?: boolean
  /** The draft is being accepted: marks come off, struck cards leave. */
  settling?: boolean
  /** The draft is still landing. The stagger belongs to that arrival, not to
   *  the card: once the plan is on screen a card that mounts again — dropped
   *  somewhere new, say — should appear at once. */
  streaming?: boolean
  /** Present only where the course can leave the plan; reveals the × on hover. */
  onRemove?: () => void
}

export function AuditRow({
  course,
  locked,
  ghosted,
  overlay,
  settling,
  streaming,
  onRemove,
}: AuditRowProps) {
  const draft = course.draft
  const style = draft ? DRAFT_STYLE[draft.mark] : null
  const struck = isStruck(course)
  /* A seat held against a requirement, with no course chosen for it: there is
   * no code to show and nothing to register, so it is drawn as an outline
   * waiting to be filled rather than as a course. */
  const held = course.placeholder
  /* What the draft struck out is on its way off the plan; what it added is on
   * its way to being an ordinary course. */
  const leaving = settling && struck
  const joining = settling && draft?.mark === "added"
  /* Only two things earn an entrance: a draft landing, and the card you just
   * acted on, which the generator numbers zero. Anything else that happens to
   * mount again — a neighbour re-rendering after a drop — stays put rather
   * than flashing back in. */
  const entering = draft != null && (streaming || draft.order === 0)

  return (
    <div
      data-draft-mark={draft?.mark}
      style={
        draft
          ? {
              animationDelay: leaving ? settleDelay(draft.order) : enterDelay(draft.order),
              transitionDelay: joining ? settleDelay(draft.order) : undefined,
            }
          : undefined
      }
      className={cn(
        "group relative flex w-full items-center gap-2 rounded-md border bg-card",
        locked ? "px-[15px] py-[7px]" : "p-[7px]",
        style && !joining ? style.card : "border-gray-40",
        !locked && !draft && "cursor-grab transition-colors hover:bg-gray-5",
        /* Same reason as the draft bar: a marked card carries the transition
           all along, so losing its tint is something it can animate. */
        draft && "transition-colors duration-500",
        entering && "animate-rise",
        /* Listed after animate-rise so it wins the animation slot. */
        leaving && "animate-vanish overflow-hidden",
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
        {held ? (
          <>
            <p
              className={cn(
                "text-body-md font-semibold text-foreground",
                struck && "line-through"
              )}
            >
              {course.name}
            </p>
            <span>
              <Badge variant="secondary">{course.credits} credits</Badge>
            </span>
          </>
        ) : (
          <>
            <div>
              <p className="text-body-md text-gray-80">{course.code}</p>
              <p
                className={cn(
                  "text-body-md font-semibold text-foreground",
                  struck && "line-through"
                )}
              >
                {course.name}
              </p>
            </div>
            {course.section && (
              <p className="flex items-center gap-1 text-body-md text-foreground">
                <Icon name="calendar-today" size={14} />
                {course.section}
              </p>
            )}
          </>
        )}
        {draft && (
          <span
            style={joining ? { animationDelay: settleDelay(draft.order) } : undefined}
            /* The reason a course was added goes with the tint that framed it,
               so the card ends up the size an ordinary one is. */
            className={cn("pt-1", joining && "animate-vanish overflow-hidden")}
          >
            <DraftNote course={course} />
          </span>
        )}
      </div>

      {/* A seat is filled by finding a class for it. */}
      {held && !overlay && (
        <Button
          size="icon"
          aria-label={`Search classes for ${course.name}`}
          onPointerDown={(e) => e.stopPropagation()}
          className="shrink-0"
        >
          <Icon name="s-search" size={16} />
        </Button>
      )}

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
  settling,
  streaming,
  onRemove,
}: {
  course: PlannedCourse
  settling?: boolean
  streaming?: boolean
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
      <AuditRow
        course={course}
        ghosted={isDragging}
        settling={settling}
        streaming={streaming}
        onRemove={onRemove}
      />
    </div>
  )
}

/* ============================================================ CreditGroup
   "In Progress (12 Credits)" / "Planned (6 Credits)" — summed from the term's
   own courses, so the heading can never drift from the list beneath it. The
   badges tally what a draft proposes for this term. */

function CreditGroup({
  term,
  settling,
  revealed,
}: {
  term: Term
  settling?: boolean
  revealed: number
}) {
  const credits = termCredits(term)
  /* A card that has not arrived yet is not in the tally yet. */
  const landed = term.courses.filter((c) => c.draft && c.draft.order < revealed)
  const added = landed.filter((c) => c.draft!.mark === "added").length
  const dropped = landed.filter((c) => c.draft!.mark !== "added").length
  const eventual = term.courses.filter((c) => c.draft).length

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
      {eventual > 0 && (
        <div
          className={cn(
            "flex shrink-0 items-center gap-1 transition-opacity duration-300",
            settling && "opacity-0"
          )}
        >
          <Badge variant="success">+{added}</Badge>
          {term.courses.some((c) => c.draft && c.draft.mark !== "added") && (
            <Badge variant="danger">-{dropped}</Badge>
          )}
        </div>
      )}
    </div>
  )
}

/* ============================================================ DropSlot
   The space a dragged course is about to take. Sorting inside a term already
   opens a gap on its own; this is for the crossing, where the card being
   dragged belongs to another term's list and cannot. */

function DropSlot({ height }: { height: number }) {
  return (
    <div
      aria-hidden="true"
      style={{ height }}
      className="animate-fade w-full shrink-0 rounded-md border border-dashed border-input bg-gray-5"
    />
  )
}

/* ============================================================ SemesterCard
   Also the drop target: the whole card accepts a course unless it is locked. */

export function SemesterCard({
  term,
  alert,
  settling,
  revealed,
  dropAt,
  dropHeight,
  addable,
  onRemoveCourse,
  onAddCourse,
  onOpen,
}: {
  term: Term
  alert?: ReactNode
  /** The draft is being accepted. */
  settling?: boolean
  /** How much of a landing draft has arrived; Infinity once it all has. */
  revealed: number
  /** Where a course crossing into this term would land, and how tall it is. */
  dropAt?: number
  dropHeight: number
  /** What "+ Add to Term" can offer. */
  addable: CatalogEntry[]
  onRemoveCourse: (courseId: string) => void
  onAddCourse: (entry: CatalogEntry) => void
  /** Opens the term on its own, with its classes and — when the schedule is
   *  out — its calendar. */
  onOpen?: () => void
}) {
  const { setNodeRef, isOver, active } = useDroppable({ id: term.id, disabled: term.locked })

  /* Only light up while something is actually being dragged. */
  const isTarget = isOver && active != null

  /* The design only gives the header a bottom gap when something follows it
   * other than the course list. */
  const headerHasGap = term.alert != null || term.courses.length === 0

  /* Infinity means the draft has finished arriving. */
  const streaming = revealed !== Infinity

  const rows: ReactNode[] = term.courses.map((course) => {
    const struck = course.draft?.mark === "moved" || course.draft?.mark === "removed"
    return term.locked || struck ? (
      <AuditRow
        key={course.id}
        course={course}
        locked={term.locked}
        settling={settling}
        streaming={streaming}
      />
    ) : (
      <SortableAuditRow
        key={course.id}
        course={course}
        settling={settling}
        streaming={streaming}
        onRemove={() => onRemoveCourse(course.id)}
      />
    )
  })

  return (
    <Card
      ref={setNodeRef}
      data-term={term.id}
      /* Its own container: a term beside two others has to make different calls
         about what fits than the same term on its own. */
      className={cn(
        "@container/term w-full min-w-0 gap-0 rounded-md border-gray-40 p-[23px] shadow-none transition-colors",
        isTarget && "border-primary bg-primary-0/40"
      )}
    >
      <div className="flex w-full flex-col gap-2">
        <div
          className={cn(
            "flex w-full items-center justify-between gap-2",
            headerHasGap && "pb-4"
          )}
        >
          <div className="flex min-w-0 flex-col gap-1">
            <h4 className="flex min-w-0 items-center text-caption-lg font-semibold text-gray-100">
              <button
                type="button"
                onClick={onOpen}
                className="flex min-w-0 cursor-pointer items-center gap-1 rounded-md text-left hover:underline [text-underline-position:from-font]"
              >
                <span className="truncate">{term.name}</span>
                <Icon name="chevron-right" size={16} className="shrink-0 text-gray-80" />
              </button>
            </h4>
            <p className="text-body-md text-gray-80">{termMeta(term)}</p>
          </div>
          <StatusPill
            status={term.reviewed ? "reviewed" : "unreviewed"}
            className={cn("shrink-0", !term.reviewed && "opacity-0")}
          >
            {term.reviewed ? "reviewed" : "Unreviewed"}
          </StatusPill>
        </div>

        {alert}

        {term.courses.length > 0 && (
          <CreditGroup term={term} settling={settling} revealed={revealed} />
        )}

        <SortableContext
          items={term.courses.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {dropAt == null
              ? rows
              : [
                  ...rows.slice(0, dropAt),
                  <DropSlot key="drop" height={dropHeight} />,
                  ...rows.slice(dropAt),
                ]}
            {!term.locked && <AddCourseMenu options={addable} onPick={onAddCourse} />}
          </div>
        </SortableContext>
      </div>
    </Card>
  )
}

/* ============================================================ NoActionsAlert
   The quiet counterpart to the registration banner: this term needs nothing
   from you right now. */

export function NoActionsAlert() {
  return (
    <Alert variant="quiet" className="animate-fade">
      <Icon name="thumb-up" size={16} className="shrink-0 text-gray-100" />
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
  settling,
  revealed,
  drop,
  addable,
  onRemoveCourse,
  onAddCourse,
  onOpenTerm,
}: {
  year: Year
  renderAlert?: (term: Term) => ReactNode
  settling?: boolean
  revealed: number
  /** The term a dragged course is crossing into, where it would sit, and how
   *  much room it needs. */
  drop: { termId: string; index: number; height: number } | null
  addable: CatalogEntry[]
  onRemoveCourse: (courseId: string) => void
  onAddCourse: (termId: string, entry: CatalogEntry) => void
  onOpenTerm?: (termId: string) => void
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
        {/* A term needs ~384px to read properly: two fit from 768px, three from
            1152px. Below that they stack rather than squeeze. */}
        <div
          className={cn(
            "grid w-full grid-cols-1 gap-4 @3xl:grid-cols-2",
            year.terms.length > 2 && "@6xl:grid-cols-3"
          )}
        >
          {year.terms.map((term) => (
            <SemesterCard
              key={term.id}
              term={term}
              alert={renderAlert?.(term)}
              settling={settling}
              revealed={revealed}
              dropAt={drop?.termId === term.id ? drop.index : undefined}
              dropHeight={drop?.height ?? 64}
              addable={addable}
              onRemoveCourse={onRemoveCourse}
              onAddCourse={(entry) => onAddCourse(term.id, entry)}
              onOpen={onOpenTerm && (() => onOpenTerm(term.id))}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
