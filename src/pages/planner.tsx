import { FILLED_YEARS } from "@/data/filled-plan"
import { PlanYourPath } from "@/pages/plan-your-path"

/* The second prototype: the same planner, opened on a plan that has already
 * been made and with nothing on offer to make it again. Everything else — term
 * views, the calendar, registration, plan review — is the first prototype's,
 * component for component. This is where the two are allowed to differ, so
 * anything this one wants and the other does not goes here rather than into a
 * second copy of the planner. */

export function Planner() {
  return <PlanYourPath generators={false} initialYears={FILLED_YEARS} />
}
