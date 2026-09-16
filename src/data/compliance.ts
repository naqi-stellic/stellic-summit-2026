import { STUDENT_RECORD, type AuditCourse } from "@/data/audit"
import { CREDITS_PER_COURSE, DEGREE } from "@/data/plan"

/* Proactive Compliance: the same student, read against an eligibility ruleset
 * rather than against their degree.
 *
 * It is the audit turned sideways. A degree audit asks "what does the degree
 * still want"; this asks "was enough done, in time, every year" — so the tree
 * is cut by year and term rather than by requirement, and a line passes or
 * fails rather than being filled. The words change with it: a check has
 * **constraints** where a requirement has courses, and carries the credits it
 * has banked rather than the ones it still wants.
 *
 * The rules below are NCAA progress-toward-degree in shape — so many credits
 * a year, so much of the degree by the start of each year, a minimum each term
 * — and are illustrative rather than authoritative. What matters for the
 * prototype is that they are time-boxed, countable, and can be failed while
 * the degree audit looks perfectly healthy. That is the whole argument for the
 * screen: nothing on Progress would tell you this student is six credits short
 * of staying eligible. */

export type CheckState = "met" | "pending" | "outstanding"

export type ComplianceCheck = {
  kind: "check"
  id: string
  name: string
  state: CheckState
  /** What the mark carries when the check is outstanding. */
  outstanding?: number
  /** Rules inside the check. A check is a bundle of them, which is why the
   *  badge counts constraints where a requirement counts courses. */
  constraints: number
  /** Credits banked against it so far. */
  credits: number
  /** What the check is actually asking for, said in one line. */
  rule?: string
  /** Folded open when the page loads. Only the year under way is. */
  open?: boolean
  children: ComplianceEntry[]
}

/** Not a rule of its own: a note about where some of these credits landed, as
 *  the audit's own double-counting question asked the other way round. */
export type CountingGroup = {
  kind: "counting"
  id: string
  label: string
  children: AuditCourse[]
}

export type ComplianceEntry = ComplianceCheck | CountingGroup | AuditCourse

/** A course as the student's record already has it, so the compliance tree and
 *  the degree audit can never disagree about a grade or a term. */
function held(code: string): AuditCourse {
  const course = STUDENT_RECORD.get(code)
  if (!course) throw new Error(`compliance: ${code} is not on the record`)
  return course
}

/* The ten courses of the finished year, and the five under way. */
const YEAR_ONE = [
  "BUS 101",
  "MATH 140",
  "ENGL 101",
  "HIST 110",
  "PSYC 101",
  "ACCT 201",
  "ECON 201",
  "MIS 120",
  "ART 105",
  "COMM 230",
].map(held)

const YEAR_TWO_FALL = ["FIN 301", "ACCT 202", "ECON 202", "STAT 210", "MKTG 201"].map(held)

/** Dual-enrolment credit. It fulfils no requirement — it is the degree audit's
 *  unmatched list — but it is still credit toward the degree, so an
 *  eligibility check that counts credits counts it. That difference is the
 *  reason the two screens disagree, and it is the point. */
const CARRIED_IN = ["MATH 110", "ENGL 100", "HIST 101", "SPAN 101"].map(held)

const EARNED = (YEAR_ONE.length + CARRIED_IN.length) * CREDITS_PER_COURSE
const IN_PROGRESS = YEAR_TWO_FALL.length * CREDITS_PER_COURSE

/** What the ruleset wants of a student entering their third year: two fifths
 *  of the degree. The gap between that and `EARNED` is the whole story the
 *  screen exists to tell. */
export const PERCENT_BY_YEAR_THREE = 0.4
export const NEEDED_BY_YEAR_THREE = DEGREE.credits * PERCENT_BY_YEAR_THREE
export const SHORTFALL = Math.max(0, NEEDED_BY_YEAR_THREE - EARNED)

export const RULESET: ComplianceCheck = {
  kind: "check",
  id: "ncaa-2026",
  name: "NCAA 2026",
  state: "pending",
  constraints: 15,
  credits: EARNED,
  open: true,
  children: [
    {
      kind: "check",
      id: "year-1",
      name: "Year 1 check",
      state: "met",
      constraints: 3,
      credits: 30,
      rule: "24 credits in the first year, 18 of them in the regular terms",
      children: [],
    },
    {
      kind: "check",
      id: "year-2",
      name: "Year 2 check",
      state: "pending",
      constraints: 3,
      credits: IN_PROGRESS,
      rule: "18 credits in the academic year, and 40% of the degree before year 3",
      open: true,
      children: [
        {
          kind: "check",
          id: "year-2-ptd",
          name: "Progress to Degree Check",
          state: "pending",
          constraints: 2,
          credits: EARNED,
          rule: `${NEEDED_BY_YEAR_THREE} of ${DEGREE.credits} credits before year 3 — ${SHORTFALL} short`,
          open: true,
          children: [
            ...YEAR_ONE,
            {
              kind: "counting",
              id: "year-2-ptd-carried",
              label: `${CARRIED_IN.length} counting towards Open Electives`,
              children: CARRIED_IN,
            },
          ],
        },
        {
          kind: "check",
          id: "year-2-fall",
          name: "Term Check: Fall",
          state: "met",
          constraints: 2,
          credits: IN_PROGRESS,
          rule: "6 credits minimum in the term",
          children: YEAR_TWO_FALL,
        },
        {
          kind: "check",
          id: "year-2-spring",
          name: "Term Check: Spring",
          state: "outstanding",
          outstanding: 1,
          constraints: 2,
          credits: 0,
          rule: "6 credits minimum in the term",
          children: [],
        },
        {
          kind: "check",
          id: "year-2-year",
          name: "Academic Year Check: Year 2",
          state: "outstanding",
          outstanding: 1,
          constraints: 2,
          credits: IN_PROGRESS,
          rule: "18 credits across the academic year",
          children: [],
        },
      ],
    },
    {
      kind: "check",
      id: "year-3",
      name: "Year 3 check",
      state: "outstanding",
      outstanding: 3,
      constraints: 3,
      credits: 0,
      rule: "60% of the degree before year 4",
      children: [],
    },
    {
      kind: "check",
      id: "year-4",
      name: "Year 4 check",
      state: "outstanding",
      outstanding: 3,
      constraints: 3,
      credits: 0,
      rule: "80% of the degree before year 5",
      children: [],
    },
    {
      kind: "check",
      id: "year-5",
      name: "Year 5 check",
      state: "outstanding",
      outstanding: 3,
      constraints: 3,
      credits: 0,
      rule: "Degree complete within five years of first enrolment",
      children: [],
    },
  ],
}

export const COMPLIANCE_TABS = [
  { id: "progress", label: "Progress" },
  { id: "plans", label: "Plans" },
  { id: "courses", label: "Courses" },
  { id: "notes", label: "Notes" },
  { id: "requests", label: "Requests", count: 1 },
  { id: "compliance", label: "Compliance" },
]

export const LAST_COMPUTED = "Last computed 8 days ago"
