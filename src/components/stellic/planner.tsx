import { useDroppable } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "cn"
import type { ReactNode } from "react"

import { Icon } from "@/components/icon"
import { AddCourseMenu } from "@/components/stellic/add-course-menu"
import { DRAFT_STYLE, DraftNote, isStruck } from "@/components/stellic/draft-mark"
import { CourseActivity, CourseTags } from "@/components/stellic/course-metadata"
import { TermActions } from "@/components/stellic/term-actions"
import { AuditIcon, StatusPill } from "@/components/stellic/primitives"
import { usePendingReview } from "@/components/stellic/review-state"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { CatalogEntry } from "@/data/catalog"
import {
  CREDIT_GROUP_LABEL,
  canAddTerm,
  creditGroup,
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
  /** Opens a held seat on its own — on what it is holding a place for, or
   *  straight on the courses that could fill it. */
  onOpenSeat?: (view: "detail" | "search") => void
  /** Opens a course on its own: the catalogue entry for it and what the plan
   *  has chosen about it. */
  onOpenCourse?: () => void
  /** This seat's panel is the one open. */
  selected?: boolean
}

export function AuditRow({
  course,
  locked,
  ghosted,
  overlay,
  settling,
  streaming,
  onRemove,
  onOpenSeat,
  onOpenCourse,
  selected,
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
        style && !joining ? style.card : held ? "border-gray-40 bg-gray-0" : "border-gray-40",
        /* A held seat is drawn as an outline waiting to be filled, and stays
           that way while a draft is proposing it — the dashes are what say it
           is a seat rather than a course, whatever colour the draft gives it. */
        held && "border-dashed",
        ((held && onOpenSeat) || (!held && onOpenCourse)) && !overlay && "cursor-pointer",
        /* The seat whose panel is open says so. */
        selected && "border-primary-50 bg-primary-0/40",
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
      {!locked && <Icon name="drag-indicator" size={16} className="text-foreground" />}

      <div
        className="flex min-w-0 flex-1 flex-col justify-center gap-2"
        onClick={
          overlay
            ? undefined
            : held
              ? onOpenSeat && (() => onOpenSeat("detail"))
              : onOpenCourse
        }
      >
        {held ? (
          <p className="flex items-center gap-2 text-body-md font-semibold text-foreground">
            <Icon name="hourglass-bottom" size={14} className="shrink-0" />
            <span className={cn("min-w-0 truncate", struck && "line-through")}>{course.name}</span>
          </p>
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

        {/* What Plan details is showing — nothing, until it is asked for. */}
        <CourseTags course={course} />
        <CourseActivity course={course} />
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

      {/* What can be done to this row, at the end of it: a seat is filled by
          finding a class for it, anything can be written about, and anything
          can be taken out. Only the search button is there at rest — the other
          two take no room until the cursor is on the row — so a seat ends in
          its search button until it is hovered, and then the three sit side by
          side. */}
      {!overlay && (held || onRemove) && (
        <span className="flex shrink-0 items-center gap-1">
          {held && (
            <Button
              size="icon"
              aria-label={`Search classes for ${course.name}`}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onOpenSeat?.("search")}
            >
              <Icon name="s-search" size={16} />
            </Button>
          )}
          {onRemove && (
            <Button
              size="icon"
              aria-label={`Write a note on ${course.name}`}
              onPointerDown={(e) => e.stopPropagation()}
              className="hidden group-hover:inline-flex"
            >
              <Icon name="sticky-note-2" size={16} />
            </Button>
          )}
          {onRemove && (
            <Button
              size="icon"
              aria-label={`Remove ${course.name}`}
              /* Keep the drag sensor out of it, or the press starts a drag. */
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onRemove}
              className="hidden group-hover:inline-flex"
            >
              <Icon name="close" size={16} />
            </Button>
          )}
        </span>
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
  onOpenSeat,
  onOpenCourse,
  selected,
}: {
  course: PlannedCourse
  settling?: boolean
  streaming?: boolean
  onRemove: () => void
  onOpenSeat?: (view: "detail" | "search") => void
  onOpenCourse?: () => void
  selected?: boolean
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
        onOpenSeat={onOpenSeat}
        onOpenCourse={onOpenCourse}
        selected={selected}
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
        <AuditIcon state={creditGroup(term)} />
        {CREDIT_GROUP_LABEL[creditGroup(term)]} ({credits} Credit{credits === 1 ? "" : "s"})
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
  onOpenSeat,
  onOpenCourse,
  openSeatId,
  onPickSection,
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
  /** Opens one of this term's held seats on its own. */
  onOpenSeat?: (courseId: string, view: "detail" | "search") => void
  /** Opens one of its courses on its own. */
  onOpenCourse?: (courseId: string) => void
  /** The seat whose panel is open, if it is one of this term's. */
  openSeatId?: string | null
  /** Settles one of this term's courses on a section. */
  onPickSection?: (termId: string, courseId: string) => void
}) {
  const { setNodeRef, isOver, active } = useDroppable({ id: term.id, disabled: term.locked })

  /* Only light up while something is actually being dragged. */
  const isTarget = isOver && active != null

  /* Out with an advisor: the term says so until the request comes back. */
  const pending = usePendingReview(term.id)

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
        onOpenSeat={
          onOpenSeat ? (view) => onOpenSeat(course.id, view) : undefined
        }
        onOpenCourse={onOpenCourse && (() => onOpenCourse(course.id))}
        selected={openSeatId === course.id}
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
          {/* A term waiting on an advisor says so; otherwise it says whether
              anyone has looked at it. */}
          <StatusPill
            status={pending ? "pending review" : term.reviewed ? "reviewed" : "unreviewed"}
            className={cn("shrink-0", !pending && !term.reviewed && "opacity-0")}
          >
            {pending ? "Pending Review" : term.reviewed ? "reviewed" : "Unreviewed"}
          </StatusPill>
        </div>

        {alert}

        {/* Under the invitation to register, the same way the term itself reads:
            here is the window, and here is what is stopping you using it. */}
        <TermActions term={term} onPickSection={onPickSection} />

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
  complete: { icon: "check-circle", tone: "text-success-100", line: "bg-success-100" },
  active: { icon: "timelapse", tone: "text-warning-50", line: "bg-warning-50" },
  future: { icon: "arrow-circle-right", tone: "text-gray-60", line: "bg-gray-60" },
} as const

export function TimelineRail({ phase, nodes }: { phase: YearPhase; nodes: 1 | 2 }) {
  /* The line runs between two nodes, so it is the colour of the nodes it
     joins — a finished year is green from end to end. */
  const { icon, tone, line } = RAIL_NODE[phase]

  /* One gutter and one lead whether the year is folded or not: the node sits
   * level with the year's heading either way, so unfolding moves nothing. */
  return (
    <div className="flex w-6 shrink-0 flex-col items-center self-stretch pt-2">
      <Icon name={icon} size={20} className={tone} />
      {nodes === 2 && (
        <>
          <span className={cn("w-0.5 min-h-0 flex-1", line)} />
          <Icon name={icon} size={20} className={tone} />
        </>
      )}
    </div>
  )
}

/* ============================================================ YearSection */

/** What a year amounts to, for when it is folded away. */
function yearSummary(year: Year): string {
  const courses = year.terms.reduce((n, t) => n + t.courses.length, 0)
  const credits = year.terms.reduce((n, t) => n + termCredits(t), 0)
  return `${courses} course${courses === 1 ? "" : "s"}, ${credits} credits ${
    year.phase === "complete" ? "earned" : "planned"
  }`
}

export function YearSection({
  year,
  renderAlert,
  settling,
  revealed,
  drop,
  addable,
  collapsed,
  onToggleCollapse,
  onAddTerm,
  onRemoveCourse,
  onAddCourse,
  onOpenTerm,
  onOpenSeat,
  onOpenCourse,
  openSeatId,
  onPickSection,
}: {
  year: Year
  renderAlert?: (term: Term) => ReactNode
  settling?: boolean
  revealed: number
  /** The term a dragged course is crossing into, where it would sit, and how
   *  much room it needs. */
  drop: { termId: string; index: number; height: number } | null
  addable: CatalogEntry[]
  /** Gives the year its summer, which is the only term it can be given. */
  onAddTerm?: () => void
  /** Opens a held seat on its own. */
  onOpenSeat?: (courseId: string, view: "detail" | "search") => void
  /** Opens a course on its own. */
  onOpenCourse?: (courseId: string) => void
  /** The seat whose panel is open. */
  openSeatId?: string | null
  /** Folded away to its heading and what it comes to. */
  collapsed?: boolean
  onToggleCollapse?: () => void
  onRemoveCourse: (courseId: string) => void
  onAddCourse: (termId: string, entry: CatalogEntry) => void
  onOpenTerm?: (termId: string) => void
  onPickSection?: (termId: string, courseId: string) => void
}) {
  const heading = (
    <button
      type="button"
      onClick={onToggleCollapse}
      aria-expanded={!collapsed}
      className="flex cursor-pointer items-center gap-1 text-h300 font-semibold text-gray-100"
    >
      {year.label}
      <Icon name={collapsed ? "unfold-more" : "unfold-less"} size={16} />
    </button>
  )

  if (collapsed) {
    return (
      <section className="flex items-start gap-4">
        <TimelineRail phase={year.phase} nodes={1} />
        {/* The band is 36px tall, as the unfolded header's Add Term button
            makes it, with the same 16px beneath — so the heading and the node
            beside it stay put when the year opens. */}
        <div className="flex min-w-0 flex-1 flex-col pb-4">
          <div className="flex min-h-9 flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <h3 className="min-w-0">{heading}</h3>
            <p className="text-label-md text-gray-100">{yearSummary(year)}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="flex items-start gap-4">
      <TimelineRail phase={year.phase} nodes={2} />
      <div className="flex min-w-0 flex-1 flex-col items-start pb-8">
        {/* The band holds its 36px whether or not the year offers a term to
            add, so a finished year lines up with the rest. */}
        <div className="-mb-px flex w-full flex-col pb-4">
          <div className="flex min-h-9 w-full flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <h3 className="min-w-0">{heading}</h3>
            {/* A year already behind you takes no more terms, and neither
                does one that has its summer. */}
            {canAddTerm(year) && (
              <Button onClick={onAddTerm}>
                <Icon name="add" size={16} />
                Add Term
              </Button>
            )}
          </div>
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
              onOpenSeat={onOpenSeat}
              onOpenCourse={onOpenCourse}
              openSeatId={openSeatId}
              onPickSection={onPickSection}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
