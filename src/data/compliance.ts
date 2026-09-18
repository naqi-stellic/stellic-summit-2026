import { AUDIT_STUDENT, DEVELOPMENTAL, STUDENT_RECORD, type AuditCourse } from "@/data/audit"
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

/** Developmental coursework. The degree will not count it — progress toward a
 *  degree means degree-applicable credit, which is why `EARNED` above leaves it
 *  out and the NCAA checks refuse it. Federal aid is not asking that question:
 *  pace and the timeframe cap count everything a student sat, and the GPA
 *  counts everything they were graded on. Two standards, the same transcript,
 *  a different answer — which is the argument for the screen. */
const DEVELOPMENTAL_CREDITS = DEVELOPMENTAL.courses.reduce(
  (sum, course) => sum + course.credits,
  0
)

/** Everything finished, degree-applicable or not. The pace test's numerator. */
const COMPLETED = EARNED + DEVELOPMENTAL_CREDITS

/** What carries grade points: taken here, graded on a letter. Transfer credit
 *  arrives with units and no grade, so the GPA is a smaller number of credits
 *  than either of the two above. */
const GRADED = (YEAR_ONE.length + DEVELOPMENTAL.courses.length) * CREDITS_PER_COURSE

const ATTEMPTED = COMPLETED + IN_PROGRESS
const PACE = Math.round((COMPLETED / ATTEMPTED) * 100)
/** 150% of the published program length, which is where aid stops. */
const MAX_TIMEFRAME = DEGREE.credits * 1.5
/** The credits the pace test wants completed, which is 67% of everything
 *  attempted — so it moves every time the student registers for anything. */
const PACE_FLOOR = Math.ceil(ATTEMPTED * 0.67)
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
  /* What aid has banked, which is more than the degree has: developmental
     credit counts here and not there. */
  credits: COMPLETED,
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
      credits: GRADED,
      rule: "2.0 minimum cumulative GPA",
      children: [
        {
          kind: "check",
          id: "sap-gpa-min",
          name: "Cumulative GPA at or above 2.0",
          state: "met",
          constraints: 1,
          credits: GRADED,
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
      credits: COMPLETED,
      rule: `${PACE}% of attempted credits completed, against a 67% minimum`,
      children: [
        {
          kind: "check",
          id: "sap-pace-ratio",
          name: "Complete at least 67% of attempted credits",
          state: "met",
          constraints: 1,
          credits: COMPLETED,
          rule: `${COMPLETED} completed of ${ATTEMPTED} attempted`,
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
  developmental: DEVELOPMENTAL.courses.map((course) => course.code),
}

/** Everything on the record, which is what the timeframe cap counts — and it
 *  means everything, developmental coursework included. */
const ALL_ATTEMPTED = [
  ...CODES.yearOne,
  ...CODES.carriedIn,
  ...CODES.yearTwoFall,
  ...CODES.developmental,
]

/* Every constraint below is one of the requirement editor's own templates —
   "At least [x] units in total", "At most [x] courses/units with defined
   grades", "Pass with minimum grade [x]", "Count [xx-xxx] only if taken at [x]
   semester [xxxx] year or later …", "Must maintain program GPA of at least
   [x]", "Student must have [x] attributes/tags". Nothing here is a sentence
   invented for the prototype and dressed up as a rule.

   The notes are the constraint's own configuration: the course set, the grades,
   the terms, the counts. That is what a note under a constraint holds. The
   reasoning about why a ruleset is built this way belongs in the lede, where it
   reads as this prototype's framing rather than as the institution's policy. */

const YEAR_ONE_EXPLAIN: CheckExplain = {
  title: "Year 1",
  lede: `Earned ${YEAR_ONE.length * CREDITS_PER_COURSE} credits against the 24 the first year asks for. Met, with ${YEAR_ONE.length * CREDITS_PER_COURSE - 24} to spare — and met without any of the credit carried in, which the check is configured to exclude.`,
  constraints: [
    {
      id: "y1-total",
      text: "At least 24 units in total",
      notes: [{ text: "Terms: Fall 2025, Spring 2026, Summer 2026" }],
      progress: { met: YEAR_ONE.length * CREDITS_PER_COURSE, total: 24 },
    },
    {
      id: "y1-regular-terms",
      text: "At least 18 courses/units excluding the given course set",
      notes: [{ text: "Course set: courses taken in Summer 2026" }],
      progress: { met: YEAR_ONE.length * CREDITS_PER_COURSE, total: 18 },
    },
    {
      id: "y1-min-grade",
      text: "Pass with minimum grade D",
    },
    { id: "y1-min-units", text: "Minimum of 1 unit for each course counted" },
    {
      id: "y1-transfer",
      text: "At most 0 courses/units with transfer status",
      notes: [{ codes: CODES.carriedIn }],
      limit: { used: 0, cap: 0 },
    },
  ],
  counting: CODES.yearOne,
  refused: [
    { codes: CODES.carriedIn, reason: "Transfer status, capped at 0 units" },
    {
      codes: CODES.developmental,
      reason: "Attribute Developmental Mathematics — not degree-applicable",
    },
  ],
}

const YEAR_TWO_EXPLAIN: CheckExplain = {
  title: "Year 2",
  lede: `${IN_PROGRESS} credits under way against the 18 the year asks for, and one of the four checks inside it cleared. The spring decides the other three: ${SPRING_PLANNED} planned credits would close the year check at ${IN_PROGRESS + SPRING_PLANNED} and leave the aid one short.`,
  constraints: [
    {
      id: "y2-subs",
      text: "Fulfill all of the following sub-requirements",
      progress: { met: 1, total: 4 },
    },
    {
      id: "y2-total",
      text: "At least 18 units in total",
      notes: [{ text: "Terms: Fall 2026, Spring 2027, Summer 2027" }],
      progress: { met: IN_PROGRESS, total: 18 },
    },
    {
      id: "y2-term-floor",
      text: "At least 6 units in total",
      notes: [{ text: "Applied to each regular term rather than to the year" }],
      progress: { met: IN_PROGRESS, total: 6 },
    },
    {
      id: "y2-withdrawals",
      text: "At most 0 courses/units with defined grades",
      notes: [{ text: "Grades: W, I, NP" }],
      limit: { used: 0, cap: 0 },
    },
    {
      id: "y2-certified",
      text: "Student must have 1 attributes/tags",
      notes: [{ text: "Attribute: Certified student-athlete 2026-27" }],
      progress: { met: 1, total: 1 },
    },
  ],
  counting: CODES.yearTwoFall,
  refused: [
    { codes: CODES.yearOne, reason: "Outside the terms this check counts" },
    { codes: CODES.carriedIn, reason: "Outside the terms this check counts" },
    { codes: CODES.developmental, reason: "Outside the terms this check counts" },
    { codes: CODES.registered, reason: "Grade IP — no units earned yet" },
  ],
}

/* Progress to Degree — the check the whole screen exists for. Its mappings are
   the argument: the fourteen courses it counts include four the degree audit
   has on its unmatched list, and exclude five that are on screen right now. */
const PTD_EXPLAIN: CheckExplain = {
  title: "Progress to Degree Check",
  lede: `Earned ${EARNED} of the ${NEEDED_BY_YEAR_THREE} credits this check needs before the third year — ${PERCENT_BY_YEAR_THREE * 100}% of a ${DEGREE.credits}-credit degree. ${SHORTFALL} to go, and the five courses under way do not close it, because they are not earned until the term is.`,
  constraints: [
    {
      id: "ptd-total",
      text: `At least ${NEEDED_BY_YEAR_THREE} units in total`,
      notes: [{ text: `Measured at the start of Fall 2027` }],
      progress: { met: EARNED, total: NEEDED_BY_YEAR_THREE },
    },
    {
      id: "ptd-any-course",
      text: "Any course can satisfy this requirement unless restricted otherwise",
      notes: [
        { text: "Credit that satisfies no degree requirement still counts here:" },
        { codes: CODES.carriedIn },
      ],
    },
    {
      id: "ptd-earned-only",
      text: "At most 0 courses/units with defined grades",
      notes: [{ text: "Grades: IP" }, { codes: CODES.yearTwoFall }],
      limit: { used: 0, cap: 0 },
    },
    {
      id: "ptd-min-grade",
      text: "Pass with minimum grade D",
    },
    {
      id: "ptd-remedial",
      text: "Do not count courses from a given set",
      notes: [{ text: "Course set: courses with attribute Remedial/Developmental" }],
      limit: { used: 0, cap: 6 },
    },
    {
      id: "ptd-declared",
      text: "Student must have 1 attributes/tags",
      notes: [{ text: `Attribute: ${DEGREE.concentration} concentration declared` }],
      progress: { met: 1, total: 1 },
    },
  ],
  counting: [...CODES.yearOne, ...CODES.carriedIn],
  refused: [
    { codes: CODES.yearTwoFall, reason: "Grade IP, capped at 0 units" },
    { codes: CODES.registered, reason: "Grade IP, capped at 0 units" },
    {
      codes: CODES.developmental,
      reason: "Attribute Developmental Mathematics — not degree-applicable",
    },
  ],
}

/* ---- aid ---- */

const GPA_EXPLAIN: CheckExplain = {
  title: "Cumulative GPA",
  lede: `A ${CGPA} against the 2.0 floor. The only one of the four aid tests about how well the work was done rather than how much of it there is — and the only one the credit carried in cannot help, because transfer credit arrives with units and no grade points.`,
  constraints: [
    {
      id: "gpa-min",
      text: "Must maintain program GPA of at least 2.0",
      notes: [{ text: `Cumulative GPA is supplied by the institution rather than computed here: ${CGPA}` }],
      progress: { met: Number(CGPA), total: 2 },
    },
    {
      id: "gpa-scope",
      text: "Compute GPA for this requirement with courses taken in/after 2025 Fall",
      notes: [{ text: "The first term of enrollment, so nothing earned before it is in the calculation" }],
    },
    {
      id: "gpa-no-grade-points",
      text: "At most 0 courses/units with transfer grades",
      notes: [{ codes: CODES.carriedIn }],
      limit: { used: 0, cap: 0 },
    },
    {
      id: "gpa-repeats",
      text: "Unused matched courses are also accounted in the GPA",
      notes: [
        { text: "Every attempt at a required course is in the GPA; for the rest, only the counted attempt is. No repeated coursework on this record." },
      ],
    },
  ],
  counting: [...CODES.yearOne, ...CODES.developmental],
  refused: [
    { codes: CODES.carriedIn, reason: "Transfer grade, capped at 0 units" },
    {
      codes: [...CODES.yearTwoFall, ...CODES.registered],
      reason: "Taken in/after 2025 Fall but not yet graded",
    },
  ],
}

const PACE_EXPLAIN: CheckExplain = {
  title: "Pace of Completion",
  lede: `${COMPLETED} credits completed of ${ATTEMPTED} attempted — ${PACE}% against a 67% floor. The test people fail without noticing, because the denominator holds things the transcript does not show as failures: withdrawals, incompletes, and every course still under way.`,
  constraints: [
    {
      id: "pace-ratio",
      text: `At least ${PACE_FLOOR} units in total`,
      notes: [
        { text: `67% of the ${ATTEMPTED} credits attempted so far. The floor moves every time the student registers.` },
        { text: `${DEVELOPMENTAL_CREDITS} of the ${COMPLETED} completed are developmental: the degree will not count them and this test will.` },
      ],
      progress: { met: COMPLETED, total: PACE_FLOOR },
    },
    {
      id: "pace-attempted",
      text: "At most 0 courses/units with defined grades",
      notes: [{ text: "Grades: W, I, F, NP" }],
      limit: { used: 0, cap: 0 },
    },
    {
      id: "pace-in-progress",
      text: "At most 0 courses/units with defined grades",
      notes: [{ text: "Grades: IP" }, { codes: CODES.yearTwoFall }],
      limit: { used: 0, cap: 0 },
    },
    {
      id: "pace-transfer",
      text: `At most ${CARRIED_IN.length * CREDITS_PER_COURSE} courses/units with transfer status`,
      notes: [
        { text: "Accepted transfer credit is the one thing that counts in both halves of the ratio:" },
        { codes: CODES.carriedIn },
      ],
      limit: { used: CARRIED_IN.length * CREDITS_PER_COURSE, cap: CARRIED_IN.length * CREDITS_PER_COURSE },
    },
  ],
  counting: [...CODES.yearOne, ...CODES.carriedIn, ...CODES.developmental],
  refused: [
    { codes: CODES.yearTwoFall, reason: "Grade IP — attempted, not completed" },
  ],
}

const TIMEFRAME_EXPLAIN: CheckExplain = {
  title: "Maximum Timeframe",
  lede: `${ATTEMPTED} of ${MAX_TIMEFRAME} attempted credits used, with ${MAX_TIMEFRAME - ATTEMPTED} of headroom. The cap is 150% of the published ${DEGREE.credits}-credit length, and aid stops there whether or not the degree is finished.`,
  constraints: [
    {
      id: "tf-cap",
      text: `At most ${MAX_TIMEFRAME} courses/units excluding the given course set`,
      notes: [{ text: "Course set: empty, so every attempted credit spends the cap" }],
      limit: { used: ATTEMPTED, cap: MAX_TIMEFRAME },
    },
    {
      id: "tf-everything",
      text: "Any course can satisfy this requirement unless restricted otherwise",
      notes: [
        { text: "Transfer credit, repeats and withdrawals included — nothing is excluded from this one" },
      ],
    },
    {
      id: "tf-scope",
      text: "Compute GPA for this requirement with courses taken in/after 2025 Fall",
      notes: [{ text: "Assessed each time the standard is evaluated, not only when the cap is reached" }],
    },
  ],
  counting: ALL_ATTEMPTED,
}

const ENROLMENT_EXPLAIN: CheckExplain = {
  title: "Enrolment Status: Spring 2027",
  lede: `${SPRING_PLANNED} credits planned against the ${FULL_TIME} a full award asks for. Half-time: the award pays, and it pays half. This is the one aid test the plan makes worse rather than better — the same spring that closes the NCAA year check leaves this one at half.`,
  constraints: [
    {
      id: "enrol-full",
      text: `At least ${FULL_TIME} units in total`,
      notes: [{ text: "Full-time enrollment for the term" }],
      progress: { met: SPRING_PLANNED, total: FULL_TIME },
    },
    {
      id: "enrol-term",
      text: "Count **-000 to **-999 only if taken at Spring 2027 semester or later and if taken at Spring 2027 semester or earlier",
      notes: [{ text: "Any course, one term wide" }],
    },
    {
      id: "enrol-loans",
      text: "At least 6 units in total",
      notes: [{ text: "Half-time floor. This one clears." }],
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
