import { cn } from "cn"

import { Icon, type IconName } from "@/components/icon"
import { DRAFT_STYLE, DraftNote, isStruck } from "@/components/stellic/draft-mark"
import { AuditIcon, StatusPill } from "@/components/stellic/primitives"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  CREDIT_GROUP_LABEL,
  creditGroup,
  courseNeeds,
  courseStatus,
  missingLine,
  termCredits,
  type PlannedCourse,
  type Term,
} from "@/data/plan"

/* A term as a list: every class it holds, and what still has to be settled
 * before any of it can be registered. This is all a term can show until its
 * schedule is published. */

const ACCENT: Record<string, string> = {
  green: "bg-accent-green",
  amber: "bg-accent-amber",
  purple: "bg-accent-purple",
  brown: "bg-accent-brown",
  teal: "bg-accent-teal",
  rose: "bg-accent-rose",
}

function Empty({ children }: { children: string }) {
  return (
    <p className="border-t border-gray-40 p-4 text-center text-body-md text-gray-80">{children}</p>
  )
}

function CardHeader({
  icon,
  title,
  count,
}: {
  icon: IconName
  title: string
  count: number
}) {
  return (
    <div className="flex w-full items-center gap-2 px-[23px] py-[15px]">
      <Icon name={icon} size={24} className="shrink-0 text-gray-100" />
      <h4 className="min-w-0 flex-1 truncate text-caption-lg font-semibold text-gray-100">
        {title} ({count})
      </h4>
      <Button size="icon" aria-label={`Add to ${title}`}>
        <Icon name="plus" size={16} />
      </Button>
    </div>
  )
}

/** The bar down the left of every row, which is where a course's colour lives. */
function Accent({ course }: { course?: PlannedCourse }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "w-1 shrink-0 self-stretch",
        course?.accent ? ACCENT[course.accent] : "bg-gray-40"
      )}
    />
  )
}

function CourseRow({
  course,
  term,
  selectable,
}: {
  course: PlannedCourse
  term: Term
  selectable: boolean
}) {
  const status = courseStatus(course, term)
  const held = course.placeholder
  const missing = courseNeeds(course, term) ? missingLine(course, term) : null
  /* A draft on the canvas marks its terms here as well. */
  const mark = course.draft ? DRAFT_STYLE[course.draft.mark] : null
  const struck = isStruck(course)

  return (
    /* A marked course is one thing — the row and the line saying what the draft
       did to it — so the colour goes round the pair rather than along the top
       of each. An unmarked one keeps the rule between rows that the table is
       ruled by. */
    <div className={cn(mark ? cn("border", mark.card) : "border-t border-gray-40")}>
      <div
        className={cn(
          "flex w-full items-stretch",
          mark ? mark.card : held ? "bg-gray-0" : "bg-card"
        )}
      >
        <Accent course={course} />
        <div className="flex min-w-0 flex-1 items-center gap-4 pr-4 pl-6">
          <Icon name="drag-indicator" size={16} className="shrink-0 text-gray-80" />
          {/* Registration is what the ticks are for: choosing which of these
              classes to put through. A term not open for it has nothing to
              tick. */}
          {/* A tick is for choosing what to put through registration. A class
              already through has no choice left to offer, so it has none. */}
          {selectable && !course.registered && (
            <Checkbox
              defaultChecked
              aria-label={`Register ${course.name}`}
              className="shrink-0"
            />
          )}

          <div className="flex w-[223px] shrink-0 flex-col gap-1 px-2 py-3">
            <span className="text-label-md text-gray-80">
              {held ? "Placeholder" : course.code}
            </span>
            <span
              className={cn(
                "text-body-md font-semibold text-gray-100",
                struck && "line-through"
              )}
            >
              {course.name}
            </span>
          </div>

          <div className="w-[121px] shrink-0">
            <StatusPill status={status}>{status}</StatusPill>
          </div>

          <span aria-hidden="true" className="w-px self-stretch bg-gray-40" />

          {/* A held seat has nothing on this side of the rule yet: no class has
              been chosen, so there is no class number, campus or grading. */}
          {!held && (
            <div className="flex min-w-0 flex-1 items-center gap-4 text-body-md text-gray-100">
              <span className="w-[98px] shrink-0">{course.classNo}</span>
              <span className="w-[109px] shrink-0">{course.campus}</span>
              <span className="w-[109px] shrink-0">{course.modality}</span>
              <span className="w-[100px] shrink-0">{course.gradeOption}</span>
              <span className="w-[100px] shrink-0 truncate">{course.credits} Credits</span>
            </div>
          )}
        </div>
      </div>

      {/* What the draft did to this class reads under it, the same way an
          unsettled one says what it is waiting for. */}
      {course.draft && (
        <div className={cn("flex w-full items-stretch", mark?.card)}>
          <Accent course={course} />
          <span className="flex min-w-0 flex-1 items-center px-4 py-[9px]">
            <DraftNote course={course} />
          </span>
        </div>
      )}

      {/* The line belongs to the course above it, so it carries the same ground
          and the same colour down its edge. */}
      {missing && !course.draft && (
        <div className={cn("flex w-full items-stretch", held ? "bg-gray-0" : "bg-card")}>
          <Accent course={course} />
          <p className="flex min-w-0 flex-1 items-center gap-1 px-4 py-[9px] text-body-md text-gray-100">
            <Icon name="error-outline" size={12} className="shrink-0 text-alert-50" />
            {missing.says}{" "}
            <button
              type="button"
              className="cursor-pointer underline [text-underline-position:from-font]"
            >
              {missing.action}
            </button>
          </p>
        </div>
      )}
    </div>
  )
}

export function TermList({ term }: { term: Term }) {
  const credits = termCredits(term)
  const selectable = term.alert != null

  return (
    /* Same reason as the calendar: keep the natural height and let the pane
       scroll, rather than being compressed into it. */
    <div className="flex w-full shrink-0 flex-col gap-6">
      <section className="w-full overflow-hidden rounded-md border border-gray-40 bg-card">
        <CardHeader icon="class" title="My Courses" count={term.courses.length} />

        {/* A term nobody has planned into has no columns worth heading. */}
        {term.courses.length === 0 ? (
          <Empty>No courses added to plan yet</Empty>
        ) : (
        /* The table scrolls on its own when the columns no longer fit, rather
           than squeezing them or pushing the page sideways. */
        <div className="w-full overflow-x-auto">
          <div className="min-w-[1000px]">
            <div className="flex w-full items-stretch pr-4 pl-6 text-body-md font-semibold text-gray-100">
              <span aria-hidden="true" className="w-1 shrink-0" />
              <span className="w-4 shrink-0 self-center" />
              {selectable && <span aria-hidden="true" className="ml-4 w-4 shrink-0" />}
              <span className="ml-4 w-[223px] shrink-0 self-center px-2 py-3">Course</span>
              <span className="ml-4 w-[121px] shrink-0 self-center">Status</span>
              <span aria-hidden="true" className="ml-4 w-px self-stretch bg-gray-40" />
              <span className="ml-4 w-[98px] shrink-0 self-center">Class No.</span>
              <span className="ml-4 w-[109px] shrink-0 self-center">Campus</span>
              <span className="ml-4 w-[109px] shrink-0 self-center">Modality</span>
              <span className="ml-4 w-[100px] shrink-0 self-center">Grade Option</span>
              <span className="ml-4 w-[100px] shrink-0 self-center">Credits</span>
            </div>

            <div className="flex w-full items-center gap-2 border-t border-gray-40 bg-gray-0 py-2 pr-6 pl-6">
              <AuditIcon state={creditGroup(term)} />
              <span className="text-body-md font-semibold text-gray-80">
                {CREDIT_GROUP_LABEL[creditGroup(term)]} ({credits} Credits)
              </span>
            </div>

            {term.courses.map((course) => (
              <CourseRow key={course.id} course={course} term={term} selectable={selectable} />
            ))}
          </div>
        </div>
        )}
      </section>

      <section className="w-full overflow-hidden rounded-md border border-gray-40 bg-card">
        <CardHeader icon="sports-basketball" title="My Activities" count={0} />
        <Empty>No activities added to plan yet</Empty>
      </section>
    </div>
  )
}
