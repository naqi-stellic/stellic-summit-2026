import { useDroppable } from "@dnd-kit/core"
import { cn } from "cn"
import { useState } from "react"

import { Icon } from "@/components/icon"
import { AddCourseMenu } from "@/components/stellic/add-course-menu"
import type { CatalogEntry } from "@/data/catalog"
import { DRAFT_STYLE, DraftNote, isStruck } from "@/components/stellic/draft-mark"
import { AuditIcon } from "@/components/stellic/primitives"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CREDIT_GROUP_LABEL,
  creditGroup,
  courseStatus,
  termCredits,
  termHours,
  termWeek,
  type Meeting,
  type PlannedCourse,
  type Term,
} from "@/data/plan"

/* A term whose schedule is out: the classes down one side, the week they
 * actually meet in on the other. A course keeps its colour across both. */

const ACCENT: Record<string, string> = {
  green: "bg-accent-green",
  amber: "bg-accent-amber",
  purple: "bg-accent-purple",
  brown: "bg-accent-brown",
  teal: "bg-accent-teal",
  rose: "bg-accent-rose",
}

/** An hour of calendar, in pixels. Deep enough that a class of an hour and a
 *  quarter has room for its code, its name and its section. */
const HOUR = 64
/* Kept clear on either side of a class so Monday's block and Tuesday's
   never meet at the column line. The width subtracts both sides: an absolute
   box with a left and a width drops its right margin, which is how they came
   to touch in the first place. */
const GUTTER = 4

function hourLabel(hour: number): string {
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${String(h).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`
}

/* ------------------------------------------------------------- the classes */

function CourseCard({
  course,
  term,
  selectable,
  onOpen,
}: {
  course: PlannedCourse
  term: Term
  selectable: boolean
  onOpen?: () => void
}) {
  const needsReview = courseStatus(course, term) === "needs review"
  const mark = course.draft ? DRAFT_STYLE[course.draft.mark] : null

  return (
    <div
      className={cn(
        "flex w-full items-stretch overflow-hidden rounded-md border pr-3",
        mark ? mark.card : "border-gray-40 bg-card"
      )}
    >
      <span
        aria-hidden="true"
        className={cn("w-1 shrink-0", course.accent ? ACCENT[course.accent] : "bg-gray-40")}
      />
      <label onClick={onOpen} className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 p-3">
        {/* A proposed class carries its mark; one you can still choose to
            register carries a tick. A term that is neither — already under way —
            has nothing to offer here. */}
        {mark ? (
          <Icon name="add" size={16} className={cn("mt-0.5 shrink-0", mark.note)} />
        ) : course.registered ? null : selectable ? (
          <Checkbox
            defaultChecked
            className="mt-0.5"
            aria-label={`Register ${course.name}`}
          />
        ) : null}
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex items-center gap-1.5 text-body-md text-gray-80">
            {needsReview && (
              <Icon name="warning" size={14} className="shrink-0 text-warning-100" />
            )}
            {course.code}
          </span>
          <span
            className={cn(
              "text-body-md font-semibold text-gray-100",
              isStruck(course) && "line-through"
            )}
          >
            {course.name}
          </span>
          {course.section && (
            <span className="flex items-center gap-1 text-body-md text-gray-100">
              <Icon name="calendar-today" size={14} />
              {course.section}
            </span>
          )}
          <span className="flex flex-wrap items-start gap-1 pt-2">
            <Badge variant="secondary">{course.credits} credits</Badge>
            {course.campus && <Badge variant="secondary">{course.campus}</Badge>}
            {course.modality && <Badge variant="secondary">{course.modality}</Badge>}
          </span>
          {/* Under the badges, where the card has room to say why it is here. */}
          <DraftNote course={course} className="pt-1" />
        </span>
      </label>
      {/* Nothing of this class can be drawn until a section is chosen, so the
          way to choose one sits on the card. */}
      {needsReview && !mark && (
        <span className="flex items-center py-3">
          <Button size="icon" aria-label={`Search sections for ${course.name}`}>
            <Icon name="s-search" size={16} />
          </Button>
        </span>
      )}
    </div>
  )
}

function HeldCard({ course }: { course: PlannedCourse }) {
  const mark = course.draft ? DRAFT_STYLE[course.draft.mark] : null

  return (
    <div
      className={cn(
        "flex w-full items-center gap-2 rounded-md border border-dashed p-[7px]",
        mark ? mark.card : "border-gray-40 bg-gray-0"
      )}
    >
      <Icon name="drag-indicator" size={16} className="shrink-0 text-gray-80" />
      <span className="flex min-w-0 flex-1 flex-col justify-center gap-2">
        <span className="flex items-center gap-2 text-body-md font-semibold text-gray-100">
          <Icon name="hourglass-bottom" size={14} className="shrink-0" />
          <span className={cn("min-w-0 truncate", isStruck(course) && "line-through")}>
            {course.name}
          </span>
        </span>
        <DraftNote course={course} />
        <span>
          <Badge variant="secondary">{course.credits} credits</Badge>
        </span>
      </span>
      <Button size="icon" aria-label={`Search classes for ${course.name}`}>
        <Icon name="s-search" size={16} />
      </Button>
    </div>
  )
}

function Sidebar({
  term,
  addable,
  onAddCourse,
  onOpenCourse,
}: {
  term: Term
  addable?: CatalogEntry[]
  onAddCourse?: (entry: CatalogEntry) => void
  onOpenCourse?: (courseId: string) => void
}) {
  const credits = termCredits(term)
  const selectable = term.alert != null

  return (
    <div className="flex w-full shrink-0 flex-col gap-6 p-6 @3xl/term:w-[280px] @6xl/term:w-[350px]">
      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full items-center gap-2">
          <Icon name="class" size={24} className="shrink-0 text-gray-100" />
          <h4 className="min-w-0 flex-1 truncate text-body-md font-semibold text-gray-100">
            My Courses ({term.courses.length})
          </h4>
          {/* The same menu the planner's cards open, behind the same plus. */}
          {addable && onAddCourse ? (
            <AddCourseMenu
              options={addable}
              onPick={onAddCourse}
              trigger={
                <Button size="icon" aria-label="Add a course">
                  <Icon name="plus" size={16} />
                </Button>
              }
            />
          ) : (
            <Button size="icon" aria-label="Add a course">
              <Icon name="plus" size={16} />
            </Button>
          )}
        </div>

        <div className="flex w-full items-center gap-2">
          <AuditIcon state={creditGroup(term)} size={24} />
          <span className="min-w-0 flex-1 text-overline font-medium tracking-[0.5px] text-gray-100 uppercase">
            {CREDIT_GROUP_LABEL[creditGroup(term)]} ({credits} Credits)
          </span>
          <Button variant="ghost" size="icon" aria-label="Hide these on the calendar">
            <Icon name="remove-red-eye" size={16} />
          </Button>
        </div>

        {term.courses.map((course) =>
          course.placeholder ? (
            <HeldCard key={course.id} course={course} />
          ) : (
            <CourseCard
              key={course.id}
              course={course}
              term={term}
              selectable={selectable}
              onOpen={onOpenCourse && (() => onOpenCourse(course.id))}
            />
          )
        )}
      </div>

      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full items-center gap-2">
          <Icon name="sports-basketball" size={24} className="shrink-0 text-gray-100" />
          <h4 className="min-w-0 flex-1 truncate text-body-md font-semibold text-gray-100">
            My Activities (0)
          </h4>
          <Button size="icon" aria-label="Add an activity">
            <Icon name="plus" size={16} />
          </Button>
        </div>
        <button
          type="button"
          className="w-full cursor-pointer rounded-md border border-dashed border-gray-40 bg-card p-3 text-left text-body-md text-gray-80"
        >
          + Add first activity
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- the week */

/** How much of the week the calendar draws. Classes meet Monday to Friday, so
 *  five days is the useful view and the weekend is there when it is wanted. */
const SPANS = [
  { label: "Week (5 Day)", days: 5 },
  { label: "Week (7 Day)", days: 7 },
]

/** Splits a day's classes into columns so two at the same hour sit beside each
 *  other. Drawn on top of one another the lower one is simply not there, and a
 *  class in the list that is missing from the week is worse than a narrow one. */
function intoLanes<T extends { meeting: Meeting }>(items: T[]): { item: T; lane: number }[] {
  const ends: number[] = []
  return [...items]
    .sort((a, b) => a.meeting.from - b.meeting.from)
    .map((item) => {
      let lane = ends.findIndex((end) => end <= item.meeting.from)
      if (lane === -1) {
        lane = ends.length
        ends.push(item.meeting.to)
      } else {
        ends[lane] = item.meeting.to
      }
      return { item, lane }
    })
}

function Week({ term, compare = true }: { term: Term; compare?: boolean }) {
  const [span, setSpan] = useState(SPANS[0])
  const days = termWeek(term).slice(0, span.days)
  const { from, to } = termHours(term)
  const hours = Array.from({ length: to - from }, (_, i) => from + i)

  const month = days[0].toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6 p-6">
      <div className="flex w-full flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="flex shrink-0 items-center gap-2">
            <Button>Today</Button>
            <Button size="icon" aria-label="Previous week">
              <Icon name="chevron-left" size={16} />
            </Button>
            <Button size="icon" aria-label="Next week">
              <Icon name="chevron-right" size={16} />
            </Button>
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-body-md font-semibold text-gray-100">{month}</span>
            <span className="truncate text-body-md text-gray-100">
              (GMT-04:00) Eastern Time - New York City
            </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-9 w-[175px] shrink-0 cursor-pointer items-center gap-2 rounded-md border border-input bg-card px-[11px] text-body-md text-gray-100 shadow-xs"
            >
              <span className="min-w-0 flex-1 truncate text-left">{span.label}</span>
              <Icon name="expand-more" size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[175px]">
            {SPANS.map((option) => (
              <DropdownMenuItem
                key={option.days}
                onSelect={() => setSpan(option)}
                className="gap-2 py-1.5 pr-2 pl-8 text-body-md"
              >
                {option.days === span.days && (
                  <Icon name="check" size={16} className="absolute left-2 shrink-0" />
                )}
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="w-full overflow-x-auto rounded-md border border-gray-40">
        <div className="flex min-w-[480px] items-start p-2">
          {/* The hour gutter, which the day columns line up against. */}
          <div className="w-[65px] shrink-0">
            <div className="h-[52px] border-b border-gray-5" />
            {hours.map((hour) => (
              <div
                key={hour}
                style={{ height: HOUR }}
                className="flex items-start justify-center border-b border-gray-5 px-2 py-1 text-body-md text-gray-80"
              >
                {hourLabel(hour)}
              </div>
            ))}
          </div>

          {days.map((day, i) => {
            const meetings = term.courses.flatMap((course) =>
              (course.meetings ?? [])
                .filter((m) => m.day === i + 1)
                .map((m) => ({ course, meeting: m }))
            )
            /* Where a class used to sit before the draft moved it. Drawn
               behind and faded, so the week can be read against the one it is
               replacing — and dropped entirely when nobody asked to compare. */
            const before = compare
              ? term.courses.flatMap((course) =>
                  (course.previousMeetings ?? [])
                    .filter((m) => m.day === i + 1)
                    .map((m) => ({ course, meeting: m }))
                )
              : []
            const laid = intoLanes(meetings)
            const lanes = Math.max(1, ...laid.map((l) => l.lane + 1))
            const laidBefore = intoLanes(before)
            const beforeLanes = Math.max(1, ...laidBefore.map((l) => l.lane + 1))

            return (
              <div key={day.toISOString()} className="min-w-0 flex-1">
                <div className="flex h-[52px] flex-col items-center border-b border-gray-5 p-2 text-body-md">
                  <span className="font-semibold text-gray-100">{day.getUTCDate()}</span>
                  <span className="text-gray-80">
                    {day
                      .toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })
                      .toUpperCase()}
                  </span>
                </div>

                <div className="relative" style={{ height: hours.length * HOUR }}>
                  {hours.map((hour) => (
                    <div key={hour} style={{ height: HOUR }} className="border-b border-gray-5" />
                  ))}

                  {laidBefore.map(({ item: { course, meeting }, lane }) => (
                    <div
                      key={`was-${course.id}-${meeting.from}`}
                      aria-hidden="true"
                      style={{
                        top: (meeting.from - from) * HOUR,
                        height: (meeting.to - meeting.from) * HOUR,
                        left: `calc(${(lane / beforeLanes) * 100}% + ${GUTTER}px)`,
                        width: `calc(${100 / beforeLanes}% - ${GUTTER * 2}px)`,
                      }}
                      className={cn(
                        "absolute flex items-stretch overflow-hidden rounded-md",
                        "border border-dashed border-gray-40 bg-gray-0 opacity-70 blur-[1px]"
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "w-1 shrink-0 opacity-50",
                          course.accent ? ACCENT[course.accent] : "bg-gray-40"
                        )}
                      />
                      <span className="flex min-w-0 flex-1 flex-col gap-1 p-2">
                        <span className="truncate text-body-md text-gray-80">{course.code}</span>
                        <span className="truncate text-body-md text-gray-80">was here</span>
                      </span>
                    </div>
                  ))}

                  {laid.map(({ item: { course, meeting }, lane }) => (
                    <div
                      key={`${course.id}-${meeting.from}`}
                      style={{
                        top: (meeting.from - from) * HOUR,
                        height: (meeting.to - meeting.from) * HOUR,
                        left: `calc(${(lane / lanes) * 100}% + ${GUTTER}px)`,
                        width: `calc(${100 / lanes}% - ${GUTTER * 2}px)`,
                      }}
                      /* Solid, even while it is a proposal: on this week the
                         faded, dashed blocks mean "this is where the class used
                         to be", and a proposed class drawn the same way reads
                         as a ghost of a schedule that never existed. What the
                         draft is offering is what you would get. */
                      className="absolute flex items-stretch overflow-hidden rounded-md border-y border-r border-gray-40 bg-card"
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "w-1 shrink-0",
                          course.accent ? ACCENT[course.accent] : "bg-gray-40"
                        )}
                      />
                      <span className="flex min-w-0 flex-1 flex-col gap-1 p-2">
                        <span className="flex items-center gap-1 truncate text-body-md text-gray-80">
                          {courseStatus(course, term) === "needs review" && (
                            <Icon name="warning" size={14} className="shrink-0 text-warning-100" />
                          )}
                          {course.code}
                        </span>
                        <span className="truncate text-body-md font-semibold text-gray-100">
                          {course.name}
                        </span>
                        {course.section && (
                          <span className="flex items-center gap-1 truncate text-body-md text-gray-100">
                            <Icon name="calendar-today" size={14} className="shrink-0" />
                            {course.section}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function TermCalendar({
  term,
  compare = true,
  addable,
  onAddCourse,
  onOpenCourse,
}: {
  term: Term
  compare?: boolean
  /** What the plus offers, and what a requirement dropped here becomes. */
  addable?: CatalogEntry[]
  onAddCourse?: (entry: CatalogEntry) => void
  /** Opens one of the term's courses on its own. */
  onOpenCourse?: (courseId: string) => void
}) {
  /* The same droppable the planner's card registers, under the same id. */
  const { setNodeRef, isOver, active } = useDroppable({ id: term.id, disabled: term.locked })

  return (
    /* shrink-0 because the pane it sits in is a fixed-height column: without
       it the card is squeezed to fit and the week is quietly cut off at the
       bottom instead of the pane scrolling to reach it. */
    <div
      ref={setNodeRef}
      className={cn(
        "@container/term w-full shrink-0 overflow-hidden rounded-md border border-gray-40 bg-card transition-colors",
        isOver && active != null && "border-primary bg-primary-0/40"
      )}
    >
      {/* Side by side when there is room for both; stacked when there is not. */}
      <div className="flex w-full flex-col @3xl/term:flex-row">
        <Sidebar
          term={term}
          addable={addable}
          onAddCourse={onAddCourse}
          onOpenCourse={onOpenCourse}
        />
        <span
          aria-hidden="true"
          className="shrink-0 bg-gray-40 max-@3xl/term:h-px @3xl/term:w-px"
        />
        <Week term={term} compare={compare} />
      </div>
    </div>
  )
}
