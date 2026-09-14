export type YearPhase = "complete" | "active" | "future"

export type PlannedCourse = {
  /** Stable across moves — drag and drop identifies courses by this. */
  id: string
  code: string
  name: string
  credits: number
  section?: string
  /** Note count shown as an inline tally. */
  notes?: number
}

export type Term = {
  id: string
  name: string
  /** "Sep - Dec". Credits are summed from the courses, not stored. */
  window: string
  campus?: string
  reviewed: boolean
  /** A term the student is already registered for. Its courses can't be moved
   *  out and nothing can be dropped in. */
  locked?: boolean
  /** Names the credit group once the term holds anything. */
  state: "registered" | "planned"
  courses: PlannedCourse[]
  /** Banner slotted between the header and the course list. */
  alert?: { kind: "registration"; closes: string }
}

export type Year = {
  label: string
  phase: YearPhase
  terms: Term[]
}

/** The degree the plan is working towards. Requirements are one per course,
 *  which is what makes "5 reqs · 15 credits" read consistently. */
export const DEGREE = {
  program: "Business Administration, B.S.",
  concentration: "Finance",
  requirements: 40,
  credits: 120,
  /** Non-course checkpoints: declare major, internship, capstone proposal… */
  milestones: 13,
}

/** Years already finished. Not part of the editable plan, so it is a roll-up
 *  rather than a list of terms. */
export const COMPLETED = {
  label: "2026-2027",
  courses: 8,
  credits: 24,
  milestones: 3,
}

/** Years the student has not planned into yet: two empty terms, nothing locked. */
function emptyYear(start: number): Year {
  return {
    label: `${start}-${start + 1}`,
    phase: "future",
    terms: [
      {
        id: `fall-${start}`,
        name: `Fall ${start}`,
        window: "Sep - Dec",
        campus: "Main campus",
        reviewed: false,
        state: "planned",
        courses: [],
      },
      {
        id: `spring-${start + 1}`,
        name: `Spring ${start + 1}`,
        window: "Jan - May",
        campus: "Main campus",
        reviewed: false,
        state: "planned",
        courses: [],
      },
    ],
  }
}

export const INITIAL_YEARS: Year[] = [
  {
    label: "2027-2028",
    phase: "active",
    terms: [
      {
        id: "fall-2027",
        name: "Fall 2027",
        window: "Sep - Dec",
        campus: "Main campus",
        reviewed: true,
        locked: true,
        state: "registered",
        courses: [
          { id: "c1", code: "FIN 301", name: "Corporate Finance", credits: 3, section: "Lec-01" },
          {
            id: "c2",
            code: "ACCT 202",
            name: "Managerial Accounting",
            credits: 3,
            section: "Lec-01",
          },
          {
            id: "c3",
            code: "ECON 202",
            name: "Principles of Macroeconomics",
            credits: 3,
            section: "Lec-01",
          },
          {
            id: "c4",
            code: "STAT 210",
            name: "Business Statistics",
            credits: 3,
            section: "Lec-01",
            notes: 1,
          },
        ],
      },
      {
        id: "spring-2028",
        name: "Spring 2028",
        window: "Jan - May",
        campus: "Main campus",
        reviewed: false,
        /* Registration for Spring opens during the Fall term and closes at the
           start of Spring — the frame's "Jan 18, 2026" predates the term. */
        alert: { kind: "registration", closes: "Mon Jan 17, 2028 • 11:59pm EST" },
        state: "planned",
        courses: [
          {
            id: "c5",
            code: "FIN 340",
            name: "Investments & Portfolio Management",
            credits: 3,
            section: "Lec-01",
          },
          {
            id: "c6",
            code: "FIN 415",
            name: "Financial Modeling & Valuation",
            credits: 3,
          },
        ],
      },
    ],
  },
  emptyYear(2028),
  emptyYear(2029),
  emptyYear(2030),
]

/* ---------------------------------------------------------------- moves */

export function findCourse(years: Year[], courseId: string) {
  for (const year of years) {
    for (const term of year.terms) {
      const index = term.courses.findIndex((c) => c.id === courseId)
      if (index !== -1) return { term, index, course: term.courses[index] }
    }
  }
  return null
}

export function findTerm(years: Year[], termId: string) {
  for (const year of years) {
    const term = year.terms.find((t) => t.id === termId)
    if (term) return term
  }
  return null
}

/** Moves a course to `toTermId`, at `toIndex` when given, otherwise appending.
 *  Returns the input untouched if either end is locked. */
export function moveCourse(
  years: Year[],
  courseId: string,
  toTermId: string,
  toIndex?: number
): Year[] {
  const from = findCourse(years, courseId)
  const to = findTerm(years, toTermId)
  if (!from || !to || from.term.locked || to.locked) return years

  const sameTerm = from.term.id === to.id
  if (sameTerm && (toIndex === undefined || toIndex === from.index)) return years

  return years.map((year) => ({
    ...year,
    terms: year.terms.map((term) => {
      if (term.id !== from.term.id && term.id !== to.id) return term

      let courses = term.courses
      if (term.id === from.term.id) courses = courses.filter((c) => c.id !== courseId)
      if (term.id === to.id) {
        const at = toIndex ?? courses.length
        courses = [...courses.slice(0, at), from.course, ...courses.slice(at)]
      }
      return { ...term, courses }
    }),
  }))
}

/** Drops a course from the plan. Registered terms are fixed, so their courses
 *  can't be removed either. */
export function removeCourse(years: Year[], courseId: string): Year[] {
  const found = findCourse(years, courseId)
  if (!found || found.term.locked) return years

  return years.map((year) => ({
    ...year,
    terms: year.terms.map((term) =>
      term.id === found.term.id
        ? { ...term, courses: term.courses.filter((c) => c.id !== courseId) }
        : term
    ),
  }))
}

/* ------------------------------------------------------------- derived */

export function termCredits(term: Term): number {
  return term.courses.reduce((sum, c) => sum + c.credits, 0)
}

/** "Sep - Dec • 12 credits • Main campus", with the credit clause dropped
 *  while the term is still empty. */
export function termMeta(term: Term): string {
  const credits = termCredits(term)
  return [term.window, credits > 0 ? `${credits} credits` : null, term.campus]
    .filter(Boolean)
    .join(" • ")
}

export const CREDIT_GROUP_LABEL = {
  registered: "In Progress",
  planned: "Planned",
} as const

/** Where the student stands against the degree. Everything sitting in the
 *  editable plan counts as planned — registered terms included, since those
 *  credits are not earned yet. */
export function planStanding(years: Year[]) {
  let plannedReqs = 0
  let plannedCredits = 0
  for (const year of years) {
    for (const term of year.terms) {
      for (const course of term.courses) {
        plannedReqs += 1
        plannedCredits += course.credits
      }
    }
  }

  return {
    completed: { reqs: COMPLETED.courses, credits: COMPLETED.credits },
    planned: { reqs: plannedReqs, credits: plannedCredits },
    remaining: {
      reqs: Math.max(0, DEGREE.requirements - COMPLETED.courses - plannedReqs),
      credits: Math.max(0, DEGREE.credits - COMPLETED.credits - plannedCredits),
    },
    total: { reqs: DEGREE.requirements, credits: DEGREE.credits },
    milestones: {
      completed: COMPLETED.milestones,
      remaining: Math.max(0, DEGREE.milestones - COMPLETED.milestones),
      total: DEGREE.milestones,
    },
  }
}

export type PlanStanding = ReturnType<typeof planStanding>

/** The last term the plan reaches. */
export function expectedGraduation(years: Year[]): string {
  const lastYear = years.at(-1)
  return lastYear?.terms.at(-1)?.name ?? "—"
}

/** Academic year number of the next year to add — the completed year counts. */
export function nextYearNumber(years: Year[]): number {
  return 1 + years.length + 1
}
