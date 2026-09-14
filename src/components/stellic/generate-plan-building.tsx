import { cn } from "cn"
import { useEffect, useRef, useState } from "react"

import { Icon } from "@/components/icon"
import { PLANNING_RULES, type PlanStanding } from "@/data/plan"

/* The progress state the panel shows after Generate Plan. Five steps and the
 * pause on the finished list add up to ten seconds exactly. */

const STEP_MS = 1900
const STEP_COUNT = 5
/* Long enough to read the last check before the draft takes the screen. */
const REST_MS = 10_000 - STEP_COUNT * STEP_MS

type Status = "done" | "active" | "pending"

function StatusIcon({ status }: { status: Status }) {
  if (status === "done") {
    return <Icon name="check-circle" size={24} className="shrink-0 text-success-50" />
  }
  /* The spinner and the waiting rows share one ring: the active one turns a
   * single primary arc around the lighter track, the waiting one just dims. */
  return (
    <span
      aria-hidden="true"
      className={cn(
        "size-6 shrink-0 rounded-full border-2 border-primary-5",
        status === "active" ? "animate-spin border-t-primary-50" : "opacity-50"
      )}
    />
  )
}

export function GeneratePlanBuilding({
  standing,
  onDone,
}: {
  standing: PlanStanding
  /** Fired once the run is over, so the draft can take the canvas. */
  onDone: () => void
}) {
  /* How many steps have finished; the one after them is the active one. */
  const [done, setDone] = useState(0)

  /* Held in a ref so a new callback identity can't restart the run. */
  const finish = useRef(onDone)
  useEffect(() => {
    finish.current = onDone
  }, [onDone])

  useEffect(() => {
    const last = done >= STEP_COUNT
    const timer = setTimeout(
      () => (last ? finish.current() : setDone((current) => current + 1)),
      last ? REST_MS : STEP_MS
    )
    return () => clearTimeout(timer)
  }, [done])

  /* The subtitles read off the same plan the summary just reported, so the
   * numbers here can't drift from the ones the student confirmed. */
  const steps: { title: string; detail?: string }[] = [
    {
      title: "Checking program requirements",
      detail: `${standing.completed.reqs} done, ${standing.planned.reqs} planned, ${standing.remaining.reqs} to place`,
    },
    {
      title: "Checking prerequisites",
      detail: `Applied across all ${standing.total.reqs} requirements`,
    },
    {
      title: "Checking credit limits and offerings",
      detail: `Up to ${PLANNING_RULES.maxCreditsPerTerm} credits a term through ${PLANNING_RULES.offeringsThrough}`,
    },
    {
      title: "Fitting courses into your terms",
      detail: `Adding around your ${standing.lockedCourses} locked courses`,
    },
    { title: "Applying your notes and advisor recommendations" },
  ]

  return (
    <>
      <div className="animate-fade flex w-full flex-col gap-2">
        <h3 className="text-h400 font-semibold text-black">Building your plan</h3>
        <p className="text-body-md text-gray-80">
          Finding a place for your remaining requirements.
        </p>
      </div>

      <ol className="animate-fade flex w-full flex-col gap-6">
        {steps.map((step, i) => {
          const status: Status = i < done ? "done" : i === done ? "active" : "pending"
          return (
            <li key={step.title} className="flex w-full items-center gap-3">
              <StatusIcon status={status} />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="text-body-md text-gray-100">{step.title}</span>
                {/* What a step found is only known once it has finished, so the
                    line arrives with the check rather than sitting there
                    claiming a result the run hasn't reached yet. */}
                {step.detail && status === "done" && (
                  <span className="animate-rise text-body-md text-gray-80">{step.detail}</span>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </>
  )
}
