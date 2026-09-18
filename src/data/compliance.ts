import { AUDIT_STUDENT, STUDENT_RECORD, type AuditCourse } from "@/data/audit"
import { recordMappings, type Constraint, type CourseMapping } from "@/data/explain"
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

/* The year splits the way the terms did: five in the fall, five in the spring,
   which is what the record says and what the term checks measure. */
const YEAR_ONE_FALL = ["BUS 101", "MATH 140", "ENGL 101", "HIST 110", "PSYC 101"].map(held)
const YEAR_ONE_SPRING = ["ACCT 201", "ECON 201", "MIS 120", "ART 105", "COMM 230"].map(held)

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
      children: [
        {
          kind: "check",
          id: "year-1-fall",
          name: "Term Check: Fall",
          state: "met",
          constraints: 2,
          credits: YEAR_ONE_FALL.length * CREDITS_PER_COURSE,
          rule: "6 credits minimum in the term",
          children: YEAR_ONE_FALL,
        },
        {
          kind: "check",
          id: "year-1-spring",
          name: "Term Check: Spring",
          state: "met",
          constraints: 2,
          credits: YEAR_ONE_SPRING.length * CREDITS_PER_COURSE,
          rule: "6 credits minimum in the term",
          children: YEAR_ONE_SPRING,
        },
        {
          kind: "check",
          id: "year-1-year",
          name: "Academic Year Check: Year 1",
          state: "met",
          constraints: 2,
          credits: (YEAR_ONE_FALL.length + YEAR_ONE_SPRING.length) * CREDITS_PER_COURSE,
          rule: "24 credits across the academic year",
          children: [],
        },
      ],
    },
    {
      kind: "check",
      id: "year-2",
      name: "Year 2",
      state: "pending",
      constraints: 3,
      credits: IN_PROGRESS,
      rule: "18 credits in the academic year, and 40% of the degree before year 3",
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
/** The cumulative GPA, as the record already reports it. */
const CGPA = AUDIT_STUDENT.engage.cgpa

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
      /* Qualitative. The only one of the four that is about how well the work
         was done rather than how much of it there is. */
      kind: "check",
      id: "sap-gpa",
      name: "Cumulative GPA",
      state: "met",
      constraints: 3,
      credits: EARNED,
      rule: "2.0 minimum cumulative GPA",
      children: [
        {
          kind: "check",
          id: "sap-gpa-min",
          name: "Cumulative GPA at or above 2.0",
          state: "met",
          constraints: 1,
          credits: EARNED,
          rule: `Currently ${CGPA}`,
          children: [],
        },
        {
          kind: "check",
          id: "sap-gpa-when",
          name: "Measured at the end of each academic year",
          state: "met",
          constraints: 1,
          credits: 0,
          rule: "Last evaluated at the close of Spring 2026",
          children: [],
        },
        {
          kind: "check",
          id: "sap-gpa-repeats",
          name: "A repeated course counts at its highest grade",
          state: "met",
          constraints: 1,
          credits: 0,
          rule: "No repeated coursework on the record",
          children: [],
        },
      ],
    },
    {
      /* Quantitative. Pace is the one people fail without noticing: it counts
         what was attempted, and a withdrawal is an attempt. */
      kind: "check",
      id: "sap-pace",
      name: "Pace of Completion",
      state: "met",
      constraints: 3,
      credits: EARNED,
      rule: `${PACE}% of attempted credits completed, against a 67% minimum`,
      children: [
        {
          kind: "check",
          id: "sap-pace-ratio",
          name: "Complete at least 67% of attempted credits",
          state: "met",
          constraints: 1,
          credits: EARNED,
          rule: `${EARNED} completed of ${ATTEMPTED} attempted`,
          children: [],
        },
        {
          kind: "check",
          id: "sap-pace-withdrawals",
          name: "Withdrawals and incompletes count as attempted, not completed",
          state: "met",
          constraints: 1,
          credits: 0,
          rule: "None on the record",
          children: [],
        },
        {
          kind: "check",
          id: "sap-pace-transfer",
          name: "Accepted transfer credit counts as both attempted and completed",
          state: "met",
          constraints: 1,
          credits: CARRIED_IN.length * CREDITS_PER_COURSE,
          rule: `${CARRIED_IN.length * CREDITS_PER_COURSE} credits of dual enrollment accepted`,
          children: [],
        },
      ],
    },
    {
      /* The ceiling. Aid stops at 150% of the published length whether or not
         the degree is finished, which is why it is worth watching early. */
      kind: "check",
      id: "sap-timeframe",
      name: "Maximum Timeframe",
      state: "pending",
      constraints: 2,
      credits: ATTEMPTED,
      rule: `${ATTEMPTED} of ${MAX_TIMEFRAME} credits attempted`,
      children: [
        {
          kind: "check",
          id: "sap-timeframe-cap",
          name: `Finish within 150% of the program: ${MAX_TIMEFRAME} attempted credits`,
          state: "pending",
          constraints: 1,
          credits: ATTEMPTED,
          rule: `${MAX_TIMEFRAME - ATTEMPTED} credits of headroom left`,
          children: [],
        },
        {
          kind: "check",
          id: "sap-timeframe-counts",
          name: "Every attempted credit counts, including transfer and repeats",
          state: "pending",
          constraints: 1,
          credits: 0,
          rule: "Aid ends once the degree cannot be finished inside the cap",
          children: [],
        },
      ],
    },
    {
      /* The one that is going wrong, and it is going wrong for the same reason
         the NCAA year check is: next term is half a term. */
      kind: "check",
      id: "sap-enrolment",
      name: "Enrolment Status: Spring 2027",
      state: "outstanding",
      outstanding: 1,
      constraints: 3,
      credits: SPRING_PLANNED,
      rule: `${FULL_TIME} credits for a full award — ${SPRING_PLANNED} planned`,
      children: [
        {
          kind: "check",
          id: "sap-enrolment-full",
          name: `Full-time enrollment is ${FULL_TIME} credits`,
          state: "outstanding",
          outstanding: 1,
          constraints: 1,
          credits: SPRING_PLANNED,
          rule: `${SPRING_PLANNED} planned — half-time`,
          children: [],
        },
        {
          kind: "check",
          id: "sap-enrolment-pell",
          name: "Pell is prorated by enrollment intensity",
          state: "outstanding",
          outstanding: 1,
          constraints: 1,
          credits: 0,
          rule: "Half-time pays half the scheduled award",
          children: [],
        },
        {
          kind: "check",
          id: "sap-enrolment-loans",
          name: "Direct Loans require at least half-time enrollment",
          state: "met",
          constraints: 1,
          credits: SPRING_PLANNED,
          rule: `${SPRING_PLANNED} credits clears the 6-credit floor`,
          children: [],
        },
      ],
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
   which were excluded, and which clock was running. This is that reasoning,
   for every check worth asking about.

   The constraints are written in Stellic's own constraint language rather than
   in prose, because that is what an institution would have built them out of.
   "At least [x] units in total", "At most [x] courses/units with defined
   grades", "Pass with minimum grade [x]", "Do not count courses from a given
   set", "Count [xx-xxx] only if taken at [term] or later" — these are the
   templates in the requirement builder, and an eligibility ruleset is coded
   the same way a degree is. Saying it in the product's own words is the claim:
   this is not a second system bolted on beside the audit.

   ---- EDITING ----
   This is the copy that appears in the Explain sidebar. It is plain data —
   `text` is the rule, `notes` are the lines under it, `progress` and `limit`
   draw the fraction on the right. `counting` and `refused` are the course
   mappings: which codes the check is counting, and which it is turning down
   and why. Change the words here and the panel follows.
   -------------------------------------------------------------------------- */

/** Everything the Explain sidebar needs for one check. A check is not a
 *  requirement, so nothing on the page can derive any of this — the ruleset
 *  has to say it. */
export type CheckExplain = {
  /** The heading, which is the check's own name. */
  title: string
  /** The one sentence the panel opens on, before any rule. Written out rather
   *  than assembled from a fraction: a check that passed and a check that is
   *  six credits short are not the same sentence with different numbers. */
  lede: string
  constraints: Constraint[]
  /** Codes this check is counting. */
  counting?: string[]
  /** Codes it is turning down, with the reason it gives. A course the check
   *  never looked at is neither — it is left out of both lists. */
  refused?: { codes: string[]; reason: string }[]
}

const CODES = {
  yearOne: YEAR_ONE.map((course) => course.code),
  yearTwoFall: YEAR_TWO_FALL.map((course) => course.code),
  carriedIn: CARRIED_IN.map((course) => course.code),
  /* A seat already taken for a term that has not started. Read off the record
     rather than listed here, so a second registration next week is caught by
     every check that has an opinion about it. */
  registered: [...STUDENT_RECORD.values()]
    .filter((course) => course.mark === "registered")
    .map((course) => course.code),
}

/** Everything on the record, which is what the timeframe cap counts. */
const ALL_ATTEMPTED = [...CODES.yearOne, ...CODES.carriedIn, ...CODES.yearTwoFall]

/* Year 1 — a year that passed, and the sidebar still has something to say: it
   passed with six credits to spare, and it passed without any of the credit
   the student walked in with. */
const YEAR_ONE_EXPLAIN: CheckExplain = {
  title: "Year 1",
  lede: `Earned ${YEAR_ONE.length * CREDITS_PER_COURSE} credits against the 24 the first year asks for. Met, with ${YEAR_ONE.length * CREDITS_PER_COURSE - 24} to spare.`,
  constraints: [
    {
      id: "y1-total",
      text: "At least 24 units in total",
      notes: [
        { text: "Measured across the first academic year of full-time enrollment: Fall 2025 through Summer 2026" },
      ],
      progress: { met: YEAR_ONE.length * CREDITS_PER_COURSE, total: 24 },
    },
    {
      id: "y1-regular-terms",
      text: "At least 18 courses/units excluding the given course set",
      notes: [
        { text: "Course set: summer and intersession terms. Three quarters of the year's credit has to come from the two regular terms." },
      ],
      progress: { met: YEAR_ONE.length * CREDITS_PER_COURSE, total: 18 },
    },
    {
      id: "y1-min-grade",
      text: "Pass with minimum grade D",
      notes: [{ text: "Only passing grades count toward the check by default" }],
    },
    { id: "y1-min-units", text: "Minimum of 1 unit for each course counted" },
    {
      id: "y1-transfer",
      text: "At most 0 courses/units with transfer status",
      notes: [
        { text: "Credit earned before the first term of full-time enrollment was not earned in the academic year, so the year check cannot count it — even though the progress-to-degree check below can:" },
        { codes: CODES.carriedIn },
      ],
      limit: { used: 0, cap: 0 },
    },
  ],
  counting: CODES.yearOne,
  refused: [
    {
      codes: CODES.carriedIn,
      reason: "Earned before first full-time enrollment — not earned in the academic year",
    },
  ],
}

/* Year 2 — the year under way, and the one carrying the problem. It holds four
   checks and has cleared one of them. */
const YEAR_TWO_EXPLAIN: CheckExplain = {
  title: "Year 2",
  lede: `${IN_PROGRESS} credits in progress against the 18 the year asks for, and one of the four checks inside it cleared. The spring is where both of the others are decided.`,
  constraints: [
    {
      id: "y2-subs",
      text: "Fulfill all of the following sub-requirements",
      notes: [
        { text: "Progress to Degree, the two term checks, and the academic year check" },
      ],
      progress: { met: 1, total: 4 },
    },
    {
      id: "y2-total",
      text: "At least 18 units in total",
      notes: [
        { text: `Fall 2026 through Summer 2027. ${IN_PROGRESS} credits are under way and ${SPRING_PLANNED} more are planned for the spring, which would clear it at ${IN_PROGRESS + SPRING_PLANNED} — on the plan, not yet on the record.` },
      ],
      progress: { met: IN_PROGRESS, total: 18 },
    },
    {
      id: "y2-term-floor",
      text: "At least 6 units in total",
      notes: [{ text: "Applied to each regular term separately, not to the year" }],
      progress: { met: IN_PROGRESS, total: 6 },
    },
    {
      id: "y2-withdrawals",
      text: "At most 0 courses/units with defined grades",
      notes: [
        { text: "Grades: W, I, NP. A dropped course is attempted but not earned, and the year check counts earned credit only." },
      ],
      limit: { used: 0, cap: 0 },
    },
    {
      id: "y2-certified",
      text: "Student must have 1 attributes/tags",
      notes: [{ text: "Tag: certified as a full-time student-athlete for the academic year" }],
      progress: { met: 1, total: 1 },
    },
  ],
  counting: CODES.yearTwoFall,
  refused: [
    {
      codes: CODES.yearOne,
      reason: "Earned in the previous academic year — counted there",
    },
    {
      codes: CODES.carriedIn,
      reason: "Earned before first full-time enrollment",
    },
    {
      codes: CODES.registered,
      reason: "Registered for the spring — inside the year, but not earned until the term closes",
    },
  ],
}

/* Progress to Degree — the check the whole screen exists for. Its mappings are
   the argument: the fourteen courses it counts include four the degree audit
   has on its unmatched list, and exclude five that are on screen right now. */
const PTD_EXPLAIN: CheckExplain = {
  title: "Progress to Degree Check",
  lede: `Earned ${EARNED} of the ${NEEDED_BY_YEAR_THREE} credits this check needs before the third year. ${SHORTFALL} to go.`,
  constraints: [
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
        { codes: CODES.carriedIn },
      ],
    },
    {
      id: "ptd-earned-only",
      text: "At most 0 courses/units with defined grades",
      notes: [
        { text: "Grades: IP. Credit is earned at the end of the term, and this check is measured at the start of the fall — so the five courses under way are not in the count yet:" },
        { codes: CODES.yearTwoFall },
      ],
      limit: { used: 0, cap: 0 },
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
  ],
  counting: [...CODES.yearOne, ...CODES.carriedIn],
  refused: [
    {
      codes: CODES.yearTwoFall,
      reason: "In progress — credit is earned at the end of the term, and the check is measured before it",
    },
    {
      codes: CODES.registered,
      reason: "Registered for a term the check is measured before",
    },
  ],
}

/* ---- aid ---- */

const GPA_EXPLAIN: CheckExplain = {
  title: "Cumulative GPA",
  lede: `A cumulative ${CGPA} against the 2.0 the qualitative standard asks for. The only one of the four tests that is about how well the work was done rather than how much of it there is.`,
  constraints: [
    {
      id: "gpa-min",
      text: "At least 2.0 cumulative GPA",
      notes: [{ text: "Measured on all credit attempted at this institution" }],
      progress: { met: Number(CGPA), total: 2 },
    },
    {
      id: "gpa-no-grade-points",
      text: "At most 0 courses/units with transfer grades",
      notes: [
        { text: "Accepted transfer and dual-enrollment credit is granted units but no grade points, so it moves pace and timeframe without ever moving the GPA:" },
        { codes: CODES.carriedIn },
      ],
      limit: { used: 0, cap: 0 },
    },
    {
      id: "gpa-when",
      text: "Evaluated at the end of each academic year",
      notes: [{ text: "Last evaluated at the close of Spring 2026. Courses under way carry no grade until the term closes." }],
    },
    {
      id: "gpa-repeats",
      text: "A repeated course counts at its highest grade",
      notes: [{ text: "No repeated coursework on the record" }],
    },
  ],
  counting: CODES.yearOne,
  refused: [
    { codes: CODES.carriedIn, reason: "Transfer credit carries units but no grade points" },
    {
      codes: [...CODES.yearTwoFall, ...CODES.registered],
      reason: "No grade until the term closes",
    },
  ],
}

const PACE_EXPLAIN: CheckExplain = {
  title: "Pace of Completion",
  lede: `${EARNED} credits completed of ${ATTEMPTED} attempted — ${PACE}% against a 67% floor. The test people fail without noticing, because the denominator counts things the transcript does not.`,
  constraints: [
    {
      id: "pace-ratio",
      text: "Complete at least 67% of all attempted credits",
      notes: [{ text: `${EARNED} completed of ${ATTEMPTED} attempted, measured cumulatively rather than term by term` }],
      progress: { met: PACE, total: 67 },
    },
    {
      id: "pace-attempted",
      text: "At most 0 courses/units with defined grades",
      notes: [
        { text: "Grades: W, I, F, NP. A withdrawal, an incomplete and a failure are all attempted and none of them are completed, so each one pulls the ratio down twice." },
      ],
      limit: { used: 0, cap: 0 },
    },
    {
      id: "pace-in-progress",
      text: "Courses in progress are attempted, not completed",
      notes: [
        { text: `The ${YEAR_TWO_FALL.length} courses under way are in the denominator now and join the numerator when the term closes:` },
        { codes: CODES.yearTwoFall },
      ],
    },
    {
      id: "pace-transfer",
      text: "Accepted transfer credit counts as both attempted and completed",
      notes: [
        { text: `${CARRIED_IN.length * CREDITS_PER_COURSE} credits of dual enrollment accepted, which is the one place transfer credit helps rather than hurts:` },
        { codes: CODES.carriedIn },
      ],
    },
  ],
  counting: [...CODES.yearOne, ...CODES.carriedIn],
  refused: [
    {
      codes: CODES.yearTwoFall,
      reason: "Attempted, not yet completed — in the denominator only",
    },
  ],
}

const TIMEFRAME_EXPLAIN: CheckExplain = {
  title: "Maximum Timeframe",
  lede: `${ATTEMPTED} of ${MAX_TIMEFRAME} attempted credits used, with ${MAX_TIMEFRAME - ATTEMPTED} of headroom. Aid stops at the cap whether or not the degree is finished, which is why it is worth watching this early.`,
  constraints: [
    {
      id: "tf-cap",
      text: `At most ${MAX_TIMEFRAME} units in total`,
      notes: [{ text: `150% of the published program length of ${DEGREE.credits} credits` }],
      limit: { used: ATTEMPTED, cap: MAX_TIMEFRAME },
    },
    {
      id: "tf-everything",
      text: "Every attempted credit counts, including transfer, repeats and withdrawals",
      notes: [
        { text: "Nothing is excluded from this one. A course dropped in week three and a course accepted from another institution both spend the same headroom." },
      ],
    },
    {
      id: "tf-unreachable",
      text: "Aid ends once the degree cannot be finished inside the cap",
      notes: [
        { text: "Assessed each time the standard is evaluated, not only when the cap is reached" },
      ],
    },
  ],
  counting: ALL_ATTEMPTED,
}

const ENROLMENT_EXPLAIN: CheckExplain = {
  title: "Enrolment Status: Spring 2027",
  lede: `${SPRING_PLANNED} credits planned against the ${FULL_TIME} a full award asks for. Half-time: the award pays, and it pays half.`,
  constraints: [
    {
      id: "enrol-full",
      text: `At least ${FULL_TIME} units in total`,
      notes: [{ text: "Full-time enrollment for the term. Below it the award is prorated rather than withdrawn." }],
      progress: { met: SPRING_PLANNED, total: FULL_TIME },
    },
    {
      id: "enrol-term",
      text: "Count units only if taken at Spring 2027 semester or later and if taken at Spring 2027 semester or earlier",
      notes: [
        { text: "Enrollment status is a fact about one term. Nothing earned before it and nothing planned after it changes this answer." },
      ],
    },
    {
      id: "enrol-pell",
      text: "Pell is prorated by enrollment intensity",
      notes: [{ text: "Half-time pays half the scheduled award for the term" }],
    },
    {
      id: "enrol-loans",
      text: "At least 6 units in total",
      notes: [{ text: "Direct Loans require at least half-time enrollment. This one clears." }],
      progress: { met: SPRING_PLANNED, total: 6 },
    },
  ],
}

/** Every check with working to show, keyed by the row it belongs to. */
export const EXPLAIN: Record<string, CheckExplain> = {
  "year-1": YEAR_ONE_EXPLAIN,
  "year-2": YEAR_TWO_EXPLAIN,
  "year-2-ptd": PTD_EXPLAIN,
  "sap-gpa": GPA_EXPLAIN,
  "sap-pace": PACE_EXPLAIN,
  "sap-timeframe": TIMEFRAME_EXPLAIN,
  "sap-enrolment": ENROLMENT_EXPLAIN,
}

/** Which checks offer the button. Derived, so a check with an explanation
 *  written for it can never be the one row that does not offer it. */
export const EXPLAINABLE = new Set(Object.keys(EXPLAIN))

/** The rules behind a check, for the box that opens under its badge. A check
 *  with an explanation shows the whole set; every other check states its own
 *  one-line rule, so every badge opens onto something. */
export function constraintsForCheck(check: ComplianceCheck): Constraint[] {
  const explain = EXPLAIN[check.id]
  if (explain) return explain.constraints
  return check.rule ? [{ id: `${check.id}-rule`, text: check.rule }] : []
}

/** How many constraints the row should claim. Where the rules are written out
 *  it is how many there are: a row saying "2 constraints" that opens onto six
 *  is wrong about the only number it carries. Where they are not, the
 *  ruleset's own count stands. */
export function constraintCount(check: ComplianceCheck): number {
  return EXPLAIN[check.id]?.constraints.length ?? check.constraints
}

/** The record laid against one check: what it counts, what it turns down and
 *  why. Empty where the check is not about coursework on the record — next
 *  term's enrolment status has nothing to map. */
export function mappingsForCheck(id: string): CourseMapping[] {
  const explain = EXPLAIN[id]
  if (!explain?.counting) return []
  return recordMappings(explain.counting, explain.refused)
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
