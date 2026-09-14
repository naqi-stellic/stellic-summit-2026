import { cn } from "cn"

import { Icon, type IconName } from "@/components/icon"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { DEGREE, type PlanStanding } from "@/data/plan"

/* Step 1: where the student stands, and whether to keep what is already planned. */

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
  keepPlanned,
  onKeepPlannedChange,
}: {
  standing: PlanStanding
  graduation: string
  keepPlanned: string
  onKeepPlannedChange: (next: string) => void
}) {
  const courses = standing.total.reqs
  const milestones = standing.milestones

  const planning = [
    { label: "Programs", value: DEGREE.program },
    { label: "Concentration", value: DEGREE.concentration },
    { label: "Expected Graduation", value: graduation },
  ]

  const choices = [
    {
      value: "yes",
      label: "Yes",
      detail: `Keep my ${standing.planned.reqs} courses and placeholders and fill in the blanks to complete my journey`,
    },
    {
      value: "no",
      label: "No",
      detail: "Choose the courses and placeholders to keep and which can be moved or swapped",
    },
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

      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full items-center pb-2">
          <h4 className="flex-1 text-body-md font-semibold text-gray-100">
            Keep everything already planned?
          </h4>
        </div>
        <RadioGroup
          value={keepPlanned}
          onValueChange={onKeepPlannedChange}
          className="w-full gap-2"
        >
          {choices.map((choice) => (
            <label
              key={choice.value}
              className={cn(
                "flex w-full cursor-pointer items-center justify-between rounded-md border p-[11px] transition-colors",
                keepPlanned === choice.value ? "border-primary-50" : "border-gray-40"
              )}
            >
              <span className="flex min-w-0 flex-1 items-start gap-3">
                <span className="flex items-center py-0.5">
                  <RadioGroupItem value={choice.value} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 pt-px text-body-md">
                  <span className="text-foreground">{choice.label}</span>
                  <span className="text-gray-80">{choice.detail}</span>
                </span>
              </span>
            </label>
          ))}
        </RadioGroup>
      </div>
    </>
  )
}
