import { STUDENT_RECORD, type AuditCourse } from "@/data/audit"
import type { Constraint } from "@/data/explain"
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

export type CheckState = "met" | "pending" | "planned" | "outstanding"

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
  /** What the plan would put against it, where the plan reaches it. Read only
   *  by the Planned view; the Official one does not know the plan exists. */
  planned?: number
  /** What the check is actually asking for, said in one line. Off the row now
   *  — a check states its name and its count, and the reading is in Explain. */
  rule?: string
  /** Folded open when the page loads. Only the year under way is. */
  open?: boolean
  children: ComplianceEntry[]
}

export type ComplianceEntry = ComplianceCheck | AuditCourse

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
      name: "Year 1",
      state: "met",
      constraints: 3,
      credits: 30,
      rule: "24 credits in the first year, 18 of them in the regular terms",
      children: [],
    },
    {
      kind: "check",
      id: "year-2",
      name: "Year 2",
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
          children: [...YEAR_ONE, ...CARRIED_IN],
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
          planned: 6,
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
          planned: IN_PROGRESS + 6,
          rule: "18 credits across the academic year",
          children: [],
        },
      ],
    },
    {
      kind: "check",
      id: "year-3",
      name: "Year 3",
      state: "outstanding",
      outstanding: 3,
      constraints: 3,
      credits: 0,
      planned: 30,
      rule: "60% of the degree before year 4",
      children: [],
    },
    {
      kind: "check",
      id: "year-4",
      name: "Year 4",
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
      name: "Year 5",
      state: "outstanding",
      outstanding: 3,
      constraints: 3,
      credits: 0,
      rule: "Degree complete within five years of first enrolment",
      children: [],
    },
  ],
}

/* ---------------------------------------------------------------- aid
   Federal financial aid measures the same transcript against a different
   clock, which is the point of putting it under the first one: a student can
   be ineligible to play and perfectly fine for aid, or the other way round,
   and neither ruleset can see the other.

   Satisfactory Academic Progress is three tests — a qualitative one on GPA, a
   quantitative one on pace, and a ceiling on how long the whole thing may
   take — plus the enrolment status that decides how much of the award is paid.
   Illustrative rather than authoritative, like the ruleset above it. */

const ATTEMPTED = EARNED + IN_PROGRESS
const PACE = Math.round((EARNED / ATTEMPTED) * 100)
/** 150% of the published program length, which is where aid stops. */
const MAX_TIMEFRAME = DEGREE.credits * 1.5
/** What a full award asks of a term, against what next term has in it. */
const FULL_TIME = 12
const SPRING_PLANNED = 6

export const AID: ComplianceCheck = {
  kind: "check",
  id: "sap-2026",
  name: "Federal Financial Aid",
  state: "outstanding",
  outstanding: 1,
  constraints: 8,
  credits: EARNED,
  open: true,
  children: [
    {
      kind: "check",
      id: "sap-gpa",
      name: "Cumulative GPA",
      state: "met",
      constraints: 2,
      credits: EARNED,
      rule: "2.0 minimum cumulative GPA",
      children: [],
    },
    {
      kind: "check",
      id: "sap-pace",
      name: "Pace of Completion",
      state: "met",
      constraints: 2,
      credits: EARNED,
      rule: `${PACE}% of attempted credits completed, against a 67% minimum`,
      children: [],
    },
    {
      kind: "check",
      id: "sap-timeframe",
      name: "Maximum Timeframe",
      state: "pending",
      constraints: 2,
      credits: ATTEMPTED,
      rule: `${ATTEMPTED} of ${MAX_TIMEFRAME} credits attempted`,
      children: [],
    },
    {
      /* The one that is going wrong, and it is going wrong for the same reason
         the NCAA year check is: next term is half a term. */
      kind: "check",
      id: "sap-enrolment",
      name: "Enrolment Status: Spring 2027",
      state: "outstanding",
      outstanding: 1,
      constraints: 2,
      credits: SPRING_PLANNED,
      rule: `${FULL_TIME} credits for a full award — ${SPRING_PLANNED} planned`,
      children: [],
    },
  ],
}

/* ---------------------------------------------------------------- planned
   The same ruleset read against the plan rather than against the record.

   Everything the plan reaches turns from outstanding to planned and carries
   what the plan would put against it. That is the argument for having the
   view at all: the plan closes the NCAA year check — 21 credits against the
   18 it wants — and does not close the aid one, because six credits in the
   spring is half a term whatever it does for eligibility. Two rulesets, one
   plan, two different answers. */

function asPlanned(check: ComplianceCheck): ComplianceCheck {
  const reached = check.planned !== undefined

  return {
    ...check,
    state: reached ? "planned" : check.state,
    credits: check.planned ?? check.credits,
    outstanding: reached ? undefined : check.outstanding,
    children: check.children.map((child) =>
      child.kind === "check" ? asPlanned(child) : child
    ),
  }
}

export const PLANNED_RULESET = asPlanned(RULESET)
export const PLANNED_AID = asPlanned(AID)

/* ---------------------------------------------------------------- explain
   Why a check stands where it does.

   A check fails for a reason that is never on the row: which credits counted,
   which were excluded, and which clock was running. These are the rules behind
   the one check the screen is about, written the way the ruleset writes them.

   ---- EDITING ----
   This is the copy that appears in the Explain sidebar. It is plain data —
   `text` is the rule, `notes` are the lines under it, `progress` and `limit`
   draw the fraction on the right. Change the words here and the panel follows.
   -------------------------------------------------------------------------- */

export const PTD_CONSTRAINTS: Constraint[] = [
  {
    id: "ptd-percent",
    text: `${PERCENT_BY_YEAR_THREE * 100}% of the degree completed before the third year of enrollment`,
    notes: [
      { text: `${NEEDED_BY_YEAR_THREE} of ${DEGREE.credits} credits, measured at the start of the fall term` },
    ],
    progress: { met: EARNED, total: NEEDED_BY_YEAR_THREE },
  },
  {
    id: "ptd-degree-applicable",
    text: "Only degree-applicable credit counts toward this percentage",
    notes: [
      { text: "Credit that satisfies no requirement still counts if it is accepted toward the degree total:" },
      { text: "Dual enrollment, transfer and test credit accepted by the registrar" },
    ],
  },
  {
    id: "ptd-min-grade",
    text: "Pass with minimum grade D",
    notes: [{ text: "A failed course is attempted, not earned, and counts against pace rather than progress" }],
  },
  {
    id: "ptd-remedial",
    text: "Do not count courses from a given set",
    notes: [
      { text: "Remedial and developmental coursework, to a maximum of 6 credits in the first year only" },
    ],
    limit: { used: 0, cap: 6 },
  },
  {
    id: "ptd-declared",
    text: "Student must have 1 attributes/tags",
    notes: [{ text: `Tag: ${DEGREE.concentration} concentration declared before the third year` }],
    progress: { met: 1, total: 1 },
  },
]

/** The line the Explain panel opens with, in the panel's own shape. */
export const PTD_STANDING = {
  earned: EARNED,
  needed: NEEDED_BY_YEAR_THREE,
  toGo: `${SHORTFALL} to go before the third year`,
}

/** Which checks have something to explain. Only the one that is going wrong —
 *  an Explain on a check nobody is asking about is a button in the way. */
export const EXPLAINABLE = new Set(["year-2-ptd"])

export const COMPLIANCE_TABS = [
  { id: "progress", label: "Progress" },
  { id: "plans", label: "Plans" },
  { id: "courses", label: "Courses" },
  { id: "notes", label: "Notes" },
  { id: "requests", label: "Requests", count: 1 },
  { id: "compliance", label: "Compliance" },
]

export const LAST_COMPUTED = "Last computed 8 days ago"
