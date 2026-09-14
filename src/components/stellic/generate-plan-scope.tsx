import { cn } from "cn"

import { Icon, type IconName } from "@/components/icon"
import { DEGREE, type PlanStanding } from "@/data/plan"

/* Step 1: where the student stands, and what the plan is for. The questions
 * themselves start at step 2. */

type Segment = { share: number; className: string }

/** Leading segments take their share of the width; the last one absorbs the
 *  remainder, so the bar always fills exactly. */
function ProgressBar({ segments }: { segments: Segment[] }) {
  return (
    <div className="flex h-2 w-full items-start">
      {segments.map((segment, i) => {
        const last = i === segments.length - 1
        return (
          <div
            key={i}
            className={cn(
              "h-full",
              i === 0 && "rounded-l-full",
              last ? "min-w-0 flex-1 rounded-r-full" : "border-r border-white",
              segment.className
            )}
            style={last ? undefined : { width: `${segment.share * 100}%` }}
          />
        )
      })}
    </div>
  )
}

function Tally({ items }: { items: { icon: IconName; tone: string; value: number }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-[17px]">
      {items.map((item) => (
        <span
          key={item.icon + item.value}
          className="flex items-center gap-1 text-body-md text-gray-80"
        >
          <Icon name={item.icon} size={16} className={item.tone} />
          {item.value}
        </span>
      ))}
    </div>
  )
}

export function GeneratePlanScope({
  standing,
  graduation,
}: {
  standing: PlanStanding
  graduation: string
}) {
  const courses = standing.total.reqs
  const milestones = standing.milestones

  const planning = [
    { label: "Programs", value: DEGREE.program },
    { label: "Concentration", value: DEGREE.concentration },
    { label: "Expected Graduation", value: graduation },
  ]

  return (
    <>
      <div className="flex w-full flex-col gap-2">
        <h3 className="text-h400 font-semibold text-black">
          Let's plan the rest of your journey
        </h3>
        <p className="text-body-md text-gray-80">
          Answer three questions and we'll draft a term-by-term plan. You can change anything
          before you save it.
        </p>
      </div>

      <div className="flex w-full flex-col gap-6">
        <div className="flex w-full flex-col gap-2">
          <p className="text-body-md font-semibold text-gray-100">Courses</p>
          <ProgressBar
            segments={[
              { share: standing.completed.reqs / courses, className: "bg-success-50" },
              { share: standing.planned.reqs / courses, className: "bg-warning-75" },
              { share: 0, className: "bg-gray-5" },
            ]}
          />
          <Tally
            items={[
              { icon: "check", tone: "text-success-50", value: standing.completed.reqs },
              { icon: "check", tone: "text-warning-25", value: standing.planned.reqs },
              { icon: "crop-square", tone: "text-alert-50", value: standing.remaining.reqs },
            ]}
          />
        </div>

        <div className="flex w-full flex-col gap-2">
          <div className="flex items-center gap-2">
            <Icon name="outlined-flag" size={16} className="text-gray-100" />
            <p className="text-body-md font-semibold text-gray-100">Milestones</p>
          </div>
          <ProgressBar
            segments={[
              { share: milestones.completed / milestones.total, className: "bg-success-50" },
              { share: 0, className: "bg-gray-5" },
            ]}
          />
          <Tally
            items={[
              { icon: "check", tone: "text-success-50", value: milestones.completed },
              { icon: "crop-square", tone: "text-alert-50", value: milestones.remaining },
            ]}
          />
        </div>
      </div>

      <div className="flex w-full flex-col gap-2">
        <div className="flex items-center pb-2">
          <h4 className="text-body-md font-semibold text-gray-100">What we&rsquo;re planning</h4>
        </div>
        {planning.map((row) => (
          <div
            key={row.label}
            className="flex w-full flex-col gap-x-2 @xs:flex-row @xs:items-start"
          >
            <span className="text-body-md text-gray-80 @xs:w-[150px] @xs:shrink-0">
              {row.label}
            </span>
            <span className="min-w-0 flex-1 text-body-md text-gray-100">{row.value}</span>
            <button
              type="button"
              className="shrink-0 cursor-pointer text-body-md text-gray-80 underline [text-underline-position:from-font]"
            >
              edit
            </button>
          </div>
        ))}
      </div>
    </>
  )
}
