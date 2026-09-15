import { cn } from "cn"
import { useEffect, useRef, useState } from "react"

import { Icon } from "@/components/icon"
import { PLANNING_RULES, type PlanStanding, type Term } from "@/data/plan"

/* The progress state for one term. The same five checks the whole-plan run
 * shows, counted against this term rather than the degree — and shorter,
 * because there is less to believe it is doing. */

const STEP_MS = 1100
const STEP_COUNT = 5
const REST_MS = 6000 - STEP_COUNT * STEP_MS

type Status = "done" | "active" | "pending"

function StatusIcon({ status }: { status: Status }) {
  if (status === "done") {
    return <Icon name="check-circle" size={24} className="shrink-0 text-success-50" />
  }
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

export function GenerateTermBuilding({
  term,
  standing,
  onLastStep,
  onDone,
}: {
  term: Term
  standing: PlanStanding
  onLastStep: () => void
  onDone: () => void
}) {
  const [done, setDone] = useState(0)

  const finish = useRef(onDone)
  const frame = useRef(onLastStep)
  useEffect(() => {
    finish.current = onDone
    frame.current = onLastStep
  }, [onDone, onLastStep])

  useEffect(() => {
    if (done === STEP_COUNT - 1) frame.current()
  }, [done])

  useEffect(() => {
    const last = done >= STEP_COUNT
    const timer = setTimeout(
      () => (last ? finish.current() : setDone((current) => current + 1)),
      last ? REST_MS : STEP_MS
    )
    return () => clearTimeout(timer)
  }, [done])

  const kept = term.courses.length

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
      detail: `Up to ${PLANNING_RULES.maxCreditsPerTerm} credits a term, offerings confirmed through ${PLANNING_RULES.offeringsThrough}`,
    },
    {
      title: `Fitting courses into ${term.name}`,
      detail: kept > 0 ? `Building around the ${kept} already there` : "Starting from an empty term",
    },
    { title: "Applying your notes and advisor recommendations" },
  ]

  return (
    <>
      <div className="animate-fade flex w-full flex-col gap-2">
        <h3 className="text-h400 font-semibold text-black">Building your term</h3>
        <p className="text-body-md text-gray-80">
          Finding a place for your remaining requirements.
        </p>
      </div>

      <ol className="flex w-full flex-col gap-4">
        {steps.map((step, i) => {
          const status: Status = i < done ? "done" : i === done ? "active" : "pending"
          return (
            <li key={step.title} className="flex w-full items-start gap-2">
              <StatusIcon status={status} />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5">
                <span
                  className={cn(
                    "text-body-md",
                    status === "pending" ? "text-gray-80" : "font-semibold text-gray-100"
                  )}
                >
                  {step.title}
                </span>
                {/* The line under a step is what it found, so it arrives with
                    the tick rather than before it. */}
                {step.detail && status === "done" && (
                  <span className="animate-fade text-body-md text-gray-80">{step.detail}</span>
                )}
              </span>
            </li>
          )
        })}
      </ol>
    </>
  )
}
