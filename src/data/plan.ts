export type YearPhase = "complete" | "active" | "future"

export type PlannedCourse = {
  /** Stable across moves — drag and drop identifies courses by this. */
  id: string
  code: string
  name: string
  section?: string
  /** Note count shown as an inline tally. */
  notes?: number
}

export type Term = {
  id: string
  name: string
  meta: string
  reviewed: boolean
  /** A term the student is already registered for. Its courses can't be moved
   *  out and nothing can be dropped in. */
  locked?: boolean
  group?: {
    state: "registered" | "planned"
    label: string
    credits: number
    deltas?: { added: number; removed: number }
  }
  courses: PlannedCourse[]
  /** Banner slotted between the header and the course list. */
  alert?: "registration"
}

export type Year = {
  label: string
  phase: YearPhase
  terms: Term[]
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
        meta: "Sep - Dec • 12 credits • Main campus",
        reviewed: false,
        courses: [],
      },
      {
        id: `spring-${start + 1}`,
        name: `Spring ${start + 1}`,
        meta: "Jan - May • 15 credits • Main campus",
        reviewed: false,
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
        meta: "Sep - Dec • 30 credits",
        reviewed: true,
        locked: true,
        group: { state: "registered", label: "In Progress", credits: 27 },
        courses: [
          { id: "c1", code: "FIN 301", name: "Corporate Finance", section: "Lec-01" },
          { id: "c2", code: "ACCT 202", name: "Managerial Accounting", section: "Lec-01" },
          {
            id: "c3",
            code: "ECON 202",
            name: "Principles of Macroeconomics",
            section: "Lec-01",
          },
          {
            id: "c4",
            code: "STAT 210",
            name: "Business Statistics",
            section: "Lec-01",
            notes: 1,
          },
        ],
      },
      {
        id: "spring-2028",
        name: "Spring 2028",
        meta: "Jan - May • 18 credits • Main campus",
        reviewed: false,
        alert: "registration",
        group: { state: "planned", label: "Planned", credits: 27 },
        courses: [
          {
            id: "c5",
            code: "FIN 340",
            name: "Investments & Portfolio Management",
            section: "Lec-01",
          },
          { id: "c6", code: "FIN 415", name: "Financial Modeling & Valuation" },
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
