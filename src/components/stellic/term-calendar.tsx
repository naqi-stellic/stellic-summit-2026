import { cn } from "cn"

import { Icon } from "@/components/icon"
import { AuditIcon } from "@/components/stellic/primitives"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  CREDIT_GROUP_LABEL,
  courseStatus,
  termCredits,
  termHours,
  termWeek,
  type PlannedCourse,
  type Term,
} from "@/data/plan"

/* A term whose schedule is out: the classes down one side, the week they
 * actually meet in on the other. A course keeps its colour across both. */

const ACCENT: Record<string, string> = {
  green: "bg-accent-green",
  amber: "bg-accent-amber",
  purple: "bg-accent-purple",
}

/** An hour of calendar, in pixels. Deep enough that a class of an hour and a
 *  quarter has room for its code, its name and its section. */
const HOUR = 64

function hourLabel(hour: number): string {
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${String(h).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`
}

/* ------------------------------------------------------------- the classes */

function CourseCard({ course }: { course: PlannedCourse }) {
  const needsReview = courseStatus(course) === "needs review"

  return (
    <div className="flex w-full items-stretch overflow-hidden rounded-md border border-gray-40 bg-card pr-3">
      <span
        aria-hidden="true"
        className={cn("w-1 shrink-0", course.accent ? ACCENT[course.accent] : "bg-gray-40")}
      />
      <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 p-3">
        {/* Level with the code line rather than the middle of the card. */}
        <Checkbox
          defaultChecked
          className="mt-0.5"
          aria-label={`Show ${course.name} on the calendar`}
        />
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex items-center gap-1.5 text-body-md text-gray-80">
            {needsReview && (
              <Icon name="warning" size={14} className="shrink-0 text-warning-100" />
            )}
            {course.code}
          </span>
          <span className="text-body-md font-semibold text-gray-100">{course.name}</span>
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
        </span>
      </label>
    </div>
  )
}

function HeldCard({ course }: { course: PlannedCourse }) {
  return (
    <div className="flex w-full items-center gap-2 rounded-md border border-dashed border-gray-40 bg-gray-0 p-[7px]">
      <Icon name="drag-indicator" size={16} className="shrink-0 text-gray-80" />
      <span className="flex min-w-0 flex-1 flex-col justify-center gap-2">
        <span className="text-body-md font-semibold text-gray-100">{course.name}</span>
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

function Sidebar({ term }: { term: Term }) {
  const credits = termCredits(term)

  return (
    <div className="flex w-full shrink-0 flex-col gap-6 p-6 @3xl/term:w-[350px]">
      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full items-center gap-2">
          <Icon name="class" size={24} className="shrink-0 text-gray-100" />
          <h4 className="min-w-0 flex-1 truncate text-body-md font-semibold text-gray-100">
            My Courses ({term.courses.length})
          </h4>
          <Button size="icon" aria-label="Add a course">
            <Icon name="plus" size={16} />
          </Button>
        </div>

        <div className="flex w-full items-center gap-2">
          <AuditIcon state={term.state} size={24} />
          <span className="min-w-0 flex-1 text-overline font-medium tracking-[0.5px] text-gray-100 uppercase">
            {CREDIT_GROUP_LABEL[term.state]} ({credits} Credits)
          </span>
          <Button variant="ghost" size="icon" aria-label="Hide these on the calendar">
            <Icon name="remove-red-eye" size={16} />
          </Button>
        </div>

        {term.courses.map((course) =>
          course.placeholder ? (
            <HeldCard key={course.id} course={course} />
          ) : (
            <CourseCard key={course.id} course={course} />
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

function Week({ term }: { term: Term }) {
  const days = termWeek(term)
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
        <span className="flex h-9 w-[175px] shrink-0 items-center gap-2 rounded-md border border-input bg-card px-[11px] text-body-md text-gray-100 shadow-xs">
          <span className="min-w-0 flex-1 truncate">Week (7 Day)</span>
          <Icon name="expand-more" size={16} />
        </span>
      </div>

      <div className="w-full overflow-x-auto rounded-md border border-gray-40">
        <div className="flex min-w-[720px] items-start p-2">
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

                  {meetings.map(({ course, meeting }) => (
                    <div
                      key={`${course.id}-${meeting.from}`}
                      style={{
                        top: (meeting.from - from) * HOUR,
                        height: (meeting.to - meeting.from) * HOUR,
                      }}
                      className="absolute inset-x-1 flex items-stretch overflow-hidden rounded-md border-y border-r border-gray-40 bg-card"
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
                          {courseStatus(course) === "needs review" && (
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

export function TermCalendar({ term }: { term: Term }) {
  return (
    <div className="@container/term w-full overflow-hidden rounded-md border border-gray-40 bg-card">
      {/* Side by side when there is room for both; stacked when there is not. */}
      <div className="flex w-full flex-col @3xl/term:flex-row">
        <Sidebar term={term} />
        <span
          aria-hidden="true"
          className="shrink-0 bg-gray-40 max-@3xl/term:h-px @3xl/term:w-px"
        />
        <Week term={term} />
      </div>
    </div>
  )
}
