import { cn } from "cn"

import { Icon, type IconName } from "@/components/icon"
import { AuditIcon, StatusPill } from "@/components/stellic/primitives"
import { Button } from "@/components/ui/button"
import {
  CREDIT_GROUP_LABEL,
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

function CourseRow({ course }: { course: PlannedCourse }) {
  const status = courseStatus(course)
  const held = course.placeholder
  const missing = courseNeeds(course) ? missingLine(course) : null

  return (
    <>
      <div
        className={cn(
          "flex w-full items-stretch border-t border-gray-40",
          held ? "bg-gray-0" : "bg-card"
        )}
      >
        <Accent course={held ? undefined : course} />
        <div className="flex min-w-0 flex-1 items-center gap-4 pr-4 pl-6">
          <Icon name="drag-indicator" size={16} className="shrink-0 text-gray-80" />

          <div className="flex w-[223px] shrink-0 flex-col gap-1 px-2 py-3">
            <span className="text-label-md text-gray-80">
              {held ? "Placeholder" : course.code}
            </span>
            <span className="text-body-md font-semibold text-gray-100">{course.name}</span>
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

      {missing && (
        <div className="flex w-full items-stretch border-t border-gray-40 bg-gray-0">
          <Accent />
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
    </>
  )
}

export function TermList({ term }: { term: Term }) {
  const credits = termCredits(term)

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="w-full overflow-hidden rounded-md border border-gray-40 bg-card">
        <CardHeader icon="class" title="My Courses" count={term.courses.length} />

        {/* The table scrolls on its own when the columns no longer fit, rather
            than squeezing them or pushing the page sideways. */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[1000px]">
            <div className="flex w-full items-center pr-4 pl-6 text-body-md font-semibold text-gray-100">
              <span aria-hidden="true" className="w-1 shrink-0" />
              <span className="w-4 shrink-0" />
              <span className="ml-4 w-[223px] shrink-0 px-2 py-3">Course</span>
              <span className="ml-4 w-[121px] shrink-0">Status</span>
              <span aria-hidden="true" className="ml-4 w-px" />
              <span className="ml-4 w-[98px] shrink-0">Class No.</span>
              <span className="ml-4 w-[109px] shrink-0">Campus</span>
              <span className="ml-4 w-[109px] shrink-0">Modality</span>
              <span className="ml-4 w-[100px] shrink-0">Grade Option</span>
              <span className="ml-4 w-[100px] shrink-0">Credits</span>
            </div>

            <div className="flex w-full items-center gap-2 border-t border-gray-40 bg-gray-0 py-2 pr-6 pl-6">
              <AuditIcon state={term.state} />
              <span className="text-body-md font-semibold text-gray-80">
                {CREDIT_GROUP_LABEL[term.state]} ({credits} Credits)
              </span>
            </div>

            {term.courses.map((course) => (
              <CourseRow key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      <section className="w-full overflow-hidden rounded-md border border-gray-40 bg-card">
        <CardHeader icon="sports-basketball" title="My Activities" count={0} />
        <p className="border-t border-gray-40 p-4 text-center text-body-md text-gray-80">
          No activities added to plan yet
        </p>
      </section>
    </div>
  )
}
