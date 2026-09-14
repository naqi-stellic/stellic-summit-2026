export type YearPhase = "complete" | "active" | "future"

/** What a generated draft proposes for a course. A moved or removed course
 *  stays on the canvas, struck through, until the draft is settled. */
export type DraftMark = "added" | "moved" | "removed"

/** One meeting of a class: which weekday (1 = Monday) and the hours it runs,
 *  as decimal hours so the calendar can lay it out arithmetically. */
export type Meeting = { day: number; from: number; to: number }

export type PlannedCourse = {
  /** Stable across moves — drag and drop identifies courses by this. */
  id: string
  code: string
  name: string
  credits: number
  section?: string
  /** Note count shown as an inline tally. */
  notes?: number
  /** A requirement with no course chosen for it yet. */
  placeholder?: boolean
  /** Registration detail, known once a class has been chosen. */
  classNo?: string
  campus?: string
  modality?: string
  gradeOption?: string
  /** When the term's schedule is out, where the class actually sits. */
  meetings?: Meeting[]
  /** The colour this course is drawn in, on its card and on the calendar. */
  accent?: "green" | "amber" | "purple" | "brown"
  /** Set only while a generated draft is on screen. `relocated` marks a card
   *  that left somewhere to be here, so it counts as an addition and a removal
   *  at once. */
  draft?: { mark: DraftMark; note: string; order: number; relocated?: boolean }
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
  /** The class schedule is published, so this term can be seen on a calendar
   *  rather than only as a list. */
  scheduled?: boolean
}

export type Year = {
  label: string
  phase: YearPhase
  terms: Term[]
}

/** Every course in the catalogue carries the same load, which is what makes
 *  40 requirements and 120 credits the same statement twice. */
export const CREDITS_PER_COURSE = 3

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

/** Institution settings the generator always honours. These are facts about
 *  the school rather than answers the student gives, which is why the summary
 *  lists them separately under "Also accounting for". */
export const PLANNING_RULES = {
  requirementPriority: "Core before general",
  prerequisites: "Applied",
  doubleCounting: "Applied",
  /** How far the published catalogue reaches. A plan can run past it — later
   *  terms are projected from the usual pattern rather than confirmed. */
  offeringsThrough: "Spring 2029",
  /** Hard ceiling per term — six courses — and what the custom pacing stepper
   *  clamps to. A full-time term is five. */
  maxCreditsPerTerm: 18,
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
export function emptyYear(start: number): Year {
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
        /* Under way, so every class has been chosen and sits somewhere real. */
        scheduled: true,
        state: "registered",
        courses: [
          {
            id: "c1",
            code: "FIN 301",
            name: "Corporate Finance",
            credits: 3,
            section: "Lec-01",
            classNo: "2041",
            campus: "Main",
            modality: "In Person",
            gradeOption: "Graded",
            accent: "purple",
            meetings: [
              { day: 1, from: 9, to: 10.25 },
              { day: 3, from: 9, to: 10.25 },
            ],
          },
          {
            id: "c2",
            code: "ACCT 202",
            name: "Managerial Accounting",
            credits: 3,
            section: "Lec-01",
            classNo: "2088",
            campus: "Main",
            modality: "In Person",
            gradeOption: "Graded",
            accent: "amber",
            meetings: [
              { day: 2, from: 11, to: 12.25 },
              { day: 4, from: 11, to: 12.25 },
            ],
          },
          {
            id: "c3",
            code: "ECON 202",
            name: "Principles of Macroeconomics",
            credits: 3,
            section: "Lec-01",
            classNo: "2113",
            campus: "Main",
            modality: "In Person",
            gradeOption: "Graded",
            accent: "green",
            meetings: [
              { day: 1, from: 13, to: 14.25 },
              { day: 3, from: 13, to: 14.25 },
            ],
          },
          {
            id: "c4",
            code: "STAT 210",
            name: "Business Statistics",
            credits: 3,
            section: "Lec-01",
            classNo: "2156",
            campus: "Main",
            modality: "Hybrid",
            gradeOption: "Graded",
            accent: "brown",
            notes: 1,
            meetings: [
              { day: 2, from: 14.5, to: 15.75 },
              { day: 4, from: 14.5, to: 15.75 },
            ],
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
        /* Registration is open for this term, so its classes have times. */
        scheduled: true,
        state: "planned",
        courses: [
          {
            /* Registration is open for this term, but no section has been
               chosen for either course: both still need one before there is
               anything to register or to draw on a calendar. */
            id: "c5",
            code: "FIN 340",
            name: "Investments & Portfolio Management",
            credits: 3,
            accent: "purple",
          },
          {
            id: "c6",
            code: "FIN 415",
            name: "Financial Modeling & Valuation",
            credits: 3,
            accent: "amber",
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
  /* What a draft has struck out is still on screen but no longer part of the
   * term's load. */
  return term.courses.reduce(
    (sum, c) => (c.draft?.mark === "moved" || c.draft?.mark === "removed" ? sum : sum + c.credits),
    0
  )
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
  let lockedCourses = 0
  for (const year of years) {
    for (const term of year.terms) {
      for (const course of term.courses) {
        plannedReqs += 1
        plannedCredits += course.credits
        if (term.locked) lockedCourses += 1
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
    /** Courses the generator has to plan around rather than move. */
    lockedCourses,
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

/** Every term the pacing step can include or exclude: the plan's own terms plus
 *  the summers, which the planner canvas does not show but the student can
 *  still choose to study through. Terms already under way are not on offer. */
export function selectableTerms(years: Year[]): string[] {
  const terms: string[] = []
  for (const year of years) {
    const start = Number(year.label.split("-")[0])
    for (const term of year.terms) {
      if (!term.locked) terms.push(term.name)
    }
    terms.push(`Summer ${start + 1}`)
  }
  return terms
}

/** Campuses the plan actually uses, for the summary's "Campus" row. */
export function planCampuses(years: Year[]): string {
  const seen = new Set<string>()
  for (const year of years) {
    for (const term of year.terms) {
      if (term.campus) seen.add(term.campus.replace(/ campus$/i, ""))
    }
  }
  return seen.size > 0 ? [...seen].join(", ") : "—"
}

/* ------------------------------------------------------------ term view */

/** What is still missing before a course can be registered: a seat held
 *  against a requirement needs a course choosing, and a course with no class
 *  picked needs a section. */
export function courseNeeds(course: PlannedCourse): "course" | "section" | null {
  if (course.placeholder) return "course"
  return course.classNo ? null : "section"
}

export function courseStatus(course: PlannedCourse): "ready" | "needs review" {
  return courseNeeds(course) ? "needs review" : "ready"
}

/** What the term is waiting on before it can be registered. */
export function termActions(term: Term): PlannedCourse[] {
  return term.courses.filter((c) => courseNeeds(c) !== null)
}

/** The line a course shows when something is missing, and what to press. */
export function missingLine(course: PlannedCourse): { says: string; action: string } {
  return courseNeeds(course) === "course"
    ? { says: "No course selected for placeholder.", action: "Search courses" }
    : { says: "No section selected.", action: "Search sections" }
}

/** The week a term's calendar opens on: a real Monday inside the term, so the
 *  days line up with the weekdays the classes actually meet. */
export function termWeek(term: Term): Date[] {
  const year = Number(term.id.split("-")[1])
  /* A week far enough in for the term to be under way, and taken from the
   * second week of the month so it cannot straddle two of them. */
  const start = term.id.startsWith("fall")
    ? new Date(Date.UTC(year, 9, 8))
    : term.id.startsWith("summer")
      ? new Date(Date.UTC(year, 6, 8))
      : new Date(Date.UTC(year, 2, 8))

  /* Wind back to the Monday of that week. */
  const monday = new Date(start)
  monday.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7))

  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday)
    day.setUTCDate(monday.getUTCDate() + i)
    return day
  })
}

/** The hours a term's calendar has to cover, with an hour's air either side. */
export function termHours(term: Term): { from: number; to: number } {
  const meetings = term.courses.flatMap((c) => c.meetings ?? [])
  if (meetings.length === 0) return { from: 8, to: 18 }
  return {
    from: Math.floor(Math.min(...meetings.map((m) => m.from)) - 1),
    to: Math.ceil(Math.max(...meetings.map((m) => m.to)) + 2),
  }
}
