import { cn } from "cn"
import { useEffect, useState } from "react"

import { Icon } from "@/components/icon"
import { PLANNING_RULES, type PlanStanding } from "@/data/plan"

/* The progress state the panel shows after Generate Plan. Each step is held for
 * STEP_MS, so five of them run for ten seconds in total. */

const STEP_MS = 2000
const STEP_COUNT = 5

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

export function GeneratePlanBuilding({ standing }: { standing: PlanStanding }) {
  /* How many steps have finished; the one after them is the active one. */
  const [done, setDone] = useState(0)

  useEffect(() => {
    if (done >= STEP_COUNT) return
    const timer = setTimeout(() => setDone((current) => current + 1), STEP_MS)
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
      <div className="flex w-full flex-col gap-2">
        <h3 className="text-h400 font-semibold text-black">Building your plan</h3>
        <p className="text-body-md text-gray-80">
          Finding a place for your remaining requirements.
        </p>
      </div>

      <ol className="flex w-full flex-col gap-6">
        {steps.map((step, i) => {
          const status: Status = i < done ? "done" : i === done ? "active" : "pending"
          return (
            <li key={step.title} className="flex w-full items-center gap-3">
              <StatusIcon status={status} />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="text-body-md text-gray-100">{step.title}</span>
                {step.detail && <span className="text-body-md text-gray-80">{step.detail}</span>}
              </div>
            </li>
          )
        })}
      </ol>
    </>
  )
}
