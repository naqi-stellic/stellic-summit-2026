import { cn } from "cn"

import { Icon, type IconName } from "@/components/icon"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DEGREE, type PlanStanding } from "@/data/plan"

/* The Generate Plan wizard that opens beside the planner. Padding subtracts
 * the border width where a container is stroked (see button.tsx for why). */

const TOTAL_STEPS = 5

const BUCKETS = [
  { key: "completed", icon: "check", tone: "text-success-50", label: "Completed" },
  { key: "planned", icon: "check", tone: "text-warning-25", label: "Planned" },
  { key: "remaining", icon: "crop-square", tone: "text-alert-50", label: "Remaining" },
] as const satisfies ReadonlyArray<{
  key: keyof Omit<PlanStanding, "total">
  icon: IconName
  tone: string
  label: string
}>

export function GeneratePlanPanel({
  standing,
  graduation,
  step = 1,
  onClose,
}: {
  standing: PlanStanding
  graduation: string
  step?: number
  onClose: () => void
}) {
  const share = (credits: number) => `${(credits / standing.total.credits) * 100}%`

  const planning = [
    { label: "Programs", value: DEGREE.program },
    { label: "Concentration", value: DEGREE.concentration },
    { label: "Expected Graduation", value: graduation },
  ]

  /* @container so the wizard reflows to the panel width the user drags to,
     not to the viewport. */
  return (
    <aside className="@container flex h-full w-full flex-col overflow-x-clip overflow-y-auto bg-card">
      <header className="flex shrink-0 flex-col gap-2 border-b border-gray-40 px-6 pt-3 pb-[15px]">
        <div className="flex w-full items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <h2 className="text-caption-lg font-semibold text-foreground">Generate Plan</h2>
            <span className="text-overline font-medium tracking-[0.5px] text-gray-80 uppercase">
              Step {step} of {TOTAL_STEPS}
            </span>
          </div>
          <Button variant="ghost" size="icon" aria-label="Close Generate Plan" onClick={onClose}>
            <Icon name="s-close" size={16} />
          </Button>
        </div>

        <div className="flex w-full items-start gap-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 min-w-0 flex-1 rounded-md",
                i < step ? "bg-primary-50" : "bg-gray-40"
              )}
            />
          ))}
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-8 p-6">
        <div className="flex flex-col gap-2">
          <h3 className="text-h400 font-semibold text-black">
            Let's plan the rest of your degree
          </h3>
          <p className="text-body-md text-gray-80">
            Four quick questions, then we'll draft a term-by-term plan. You can edit anything
            before it's saved.
          </p>
        </div>

        <Card className="w-full gap-2 rounded-md border-gray-40 p-[15px] shadow-none">
          <p className="text-body-md font-semibold text-gray-100">Where you are today</p>

          {/* Segments are shares of the degree's credits rather than the
              design's fixed pixel widths, so the bar tracks the plan. */}
          <div className="flex h-2 w-full items-start">
            <div
              className="h-full rounded-l-full border-r border-white bg-success-50"
              style={{ width: share(standing.completed.credits) }}
            />
            <div
              className="h-full border-r border-white bg-warning-75"
              style={{ width: share(standing.planned.credits) }}
            />
            <div className="h-full min-w-0 flex-1 rounded-r-full bg-gray-5" />
          </div>

          {BUCKETS.map((bucket) => {
            const { reqs, credits } = standing[bucket.key]
            return (
              <div
                key={bucket.key}
                className="flex w-full flex-wrap items-center justify-between gap-x-2"
              >
                <span className="flex items-center gap-1 text-body-md text-gray-80">
                  <Icon name={bucket.icon} size={16} className={bucket.tone} />
                  {bucket.label}
                </span>
                <span className="text-body-md whitespace-nowrap text-gray-80">
                  {reqs} reqs · {credits} credits
                </span>
              </div>
            )
          })}
        </Card>

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

        <Button variant="primary" className="w-full">
          Continue
        </Button>
      </div>
    </aside>
  )
}
