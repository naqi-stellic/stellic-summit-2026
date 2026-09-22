import { STUDENT, type Term, type Year } from "@/data/plan"

/* Asking someone to look at the plan. A request names a reference plan, the
 * terms it covers and the kind of review being asked for; from then on those
 * terms read as pending until the advisor comes back. */

export type ReviewType = {
  id: string
  label: string
  /** What this kind of request is for, shown under the picker. */
  blurb: string
}

export const REVIEW_TYPES: ReviewType[] = [
  {
    id: "registration",
    label: "Registration Plan Review [2026 All Students]",
    blurb: "Use this request to get approval on terms during orientation Week",
  },
  {
    id: "initial",
    label: "Registration Initial Plan Review [2026 All Students]",
    blurb: "Use this request the first time a plan goes out, before any term is registered",
  },
  {
    id: "graduation",
    label: "Graduation Clearance Review [2026 All Students]",
    blurb: "Use this request in your final year, to have the whole degree checked off",
  },
]

/** A type scoped to a different student set, so it is not in the list Scott is
 *  offered — he is a sophomore, and the set is first years. Staff Home meets it
 *  from the other side, where a reviewer sees every set at once. */
export const FRESHMAN_REVIEW: ReviewType = {
  id: "freshman",
  label: "Freshman Plan Review [2026 Freshmen]",
  blurb: "Use this request in your first year, to have the whole first-year plan looked at",
}

/** Who reads the request. One advisor, named on every review. */
export const ADVISOR = { name: "Mark Stehlik" }

/** The plan this student is asking about. The header names it the same way. */
export const REFERENCE_PLANS = ["Primary Plan", "What-if: Minor in Data Analytics"]

export type Review = {
  id: string
  plan: string
  type: ReviewType
  /** Term ids, and their names kept alongside so a request still reads as
   *  itself once the plan underneath has moved on. */
  terms: string[]
  termNames: string[]
  notes: string
  requestedAt: Date
  status: "pending" | "complete"
  /** The plan as it stood when the request went out. */
  at: Record<string, string>
}

/* Where the demo stands: Fall 2026 is under way and Spring 2027 registration
 * closes in the new year, so "now" is the end of the Fall term. */
export const NOW = new Date(2026, 11, 1, 13, 21)

/* One request has already been round: it is why Fall 2026 carries a reviewed
 * mark. It sits in the panel's history, under whatever is asked for today. */
export const INITIAL_REVIEWS: Review[] = [
  {
    id: "review-2026-fall",
    plan: "Primary Plan",
    type: REVIEW_TYPES[1],
    terms: ["fall-2026"],
    termNames: ["Fall 2026"],
    notes: "",
    requestedAt: new Date(2026, 7, 20, 13, 21),
    status: "complete",
    at: {},
  },
]

/** Terms a review can be asked about: still ahead of you, and holding
 *  something to look at. A term under way or already taken is not up for
 *  review — whatever an advisor said about it, it has happened — and neither
 *  is an empty one: there is nothing in it to have an opinion about. */
export function reviewableYears(years: Year[]): { label: string; terms: Term[] }[] {
  return years
    .map((year) => ({
      label: year.label,
      terms: year.terms.filter(
        (term) => !term.locked && term.state !== "completed" && term.courses.length > 0
      ),
    }))
    .filter((year) => year.terms.length > 0)
}

/** "1 Dec 2026, 1:21pm" — the short form, used on the request's own row. */
export function shortWhen(date: Date): string {
  const day = date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  return `${day}, ${clock(date)}`
}

/** "1 December 2026, 1:21pm" — the long form, inside the request. */
export function longWhen(date: Date): string {
  const day = date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
  return `${day}, ${clock(date)}`
}

function clock(date: Date): string {
  const hours = date.getHours() % 12 === 0 ? 12 : date.getHours() % 12
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${hours}:${minutes}${date.getHours() < 12 ? "am" : "pm"}`
}

/** The sentence the planner's banner leads with. */
export function requestedLine(review: Review): string {
  return `${STUDENT.name} requested a review of ${review.plan} on ${longWhen(review.requestedAt)}.`
}

/** Where every course sat when the request went out, so the plan can be
 *  compared against itself while the advisor is reading it. */
export function planSignature(years: Year[]): Record<string, string> {
  const at: Record<string, string> = {}
  for (const year of years) {
    for (const term of year.terms) {
      for (const course of term.courses) at[course.id] = term.id
    }
  }
  return at
}

/** How much has moved since: a course added, dropped, or in another term than
 *  the one it was in when the request was made. */
export function changesSince(before: Record<string, string>, years: Year[]): number {
  const now = planSignature(years)
  let changed = 0
  for (const id of new Set([...Object.keys(before), ...Object.keys(now)])) {
    if (before[id] !== now[id]) changed += 1
  }
  return changed
}
