import { cameFrom } from "@/components/stellic/plan-header"
import { recordIncoming, recordPlan } from "@/data/record-plan"
import { PlanYourPath } from "@/pages/plan-your-path"

/* The second prototype: the same planner on the same plan, with nothing on
 * offer to generate it. Everything else — term views, the calendar,
 * registration, plan review — is the first prototype's, component for
 * component. This is where the two are allowed to differ, so anything this one
 * wants and the other does not goes here rather than into a second copy of the
 * planner. */

export function Planner() {
  /* Opened from a student's record, the plan is that student's: the same term
     under way, holding the same courses the audit says are in progress. Opened
     on its own it is Team Plan's, which is a different argument about a
     different thing. */
  const fromRecord = cameFrom()

  return (
    <PlanYourPath
      generators={false}
      initialYears={fromRecord ? recordPlan() : undefined}
      incoming={fromRecord ? recordIncoming() : undefined}
    />
  )
}
