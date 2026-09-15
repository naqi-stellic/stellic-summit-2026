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
  /* Detail that arrives with a chosen class. A course nobody has picked a
   * section for has none of it, which is why these are all optional: the card
   * shows what the course actually has, never an empty label. */
  instructor?: string
  topic?: string
  building?: string
  room?: string
  /** "Writing Intensive", "Service Learning" — how the section is flagged. */
  attributes?: string
  /** "Full Term", "First Half" — which part of the term it runs in. */
  subTerm?: string
  /** Who last touched this course on the plan, and when. Every course has one,
   *  including one the generator placed, which reads "Added by pathway". */
  lastActivity?: string
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
  state: "registered" | "planned" | "completed"
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

/** The year already behind the student. It is not part of the editable plan —
 *  nothing in it can be moved, dropped or generated into — so it sits outside
 *  INITIAL_YEARS and the planner shows it collapsed. Its terms are real enough
 *  to open and read, though: they have classes, class numbers and hours. */
export const COMPLETED_YEAR: Year = {
  label: "2026-2027",
  phase: "complete",
  terms: [
    {
      id: "fall-2026",
      name: "Fall 2026",
      window: "Sep - Dec",
      campus: "Main campus",
      reviewed: true,
      locked: true,
      scheduled: true,
      state: "completed",
      courses: [
        {
          id: "p1",
          code: "BUS 101",
          name: "Introduction to Business",
          credits: 3,
          section: "Lec-01",
          classNo: "1004",
          campus: "Main",
          modality: "In Person",
          gradeOption: "Graded",
          accent: "purple",
          meetings: [
            { day: 1, from: 9, to: 10.25 },
            { day: 3, from: 9, to: 10.25 },
          ],
          instructor: "Dr. R. Okafor",
          building: "Hale Hall",
          room: "212",
          subTerm: "Full Term",
          lastActivity: "Added by pathway, 12 Aug 2026",
        },
        {
          id: "p2",
          code: "MATH 140",
          name: "Business Calculus",
          credits: 3,
          section: "Lec-02",
          classNo: "1017",
          campus: "Main",
          modality: "In Person",
          gradeOption: "Graded",
          accent: "amber",
          meetings: [
            { day: 2, from: 11, to: 12.25 },
            { day: 4, from: 11, to: 12.25 },
          ],
          instructor: "Dr. L. Whitfield",
          building: "Science Center",
          room: "104",
          subTerm: "Full Term",
          lastActivity: "Added by pathway, 12 Aug 2026",
        },
        {
          id: "p3",
          code: "ENGL 101",
          name: "Composition I",
          credits: 3,
          section: "Lec-01",
          classNo: "1042",
          campus: "Main",
          modality: "In Person",
          gradeOption: "Graded",
          accent: "green",
          meetings: [
            { day: 1, from: 13, to: 14.25 },
            { day: 3, from: 13, to: 14.25 },
          ],
          instructor: "Prof. M. Alvarez",
          building: "Hale Hall",
          room: "118",
          attributes: "Writing Intensive",
          subTerm: "Full Term",
          lastActivity: "Added by pathway, 12 Aug 2026",
        },
        {
          id: "p4",
          code: "HIST 110",
          name: "World Civilizations",
          credits: 3,
          section: "Lec-04",
          classNo: "1063",
          campus: "Main",
          modality: "Online",
          gradeOption: "Graded",
          accent: "brown",
          meetings: [{ day: 5, from: 10, to: 12.5 }],
          instructor: "Dr. S. Nakamura",
          subTerm: "Full Term",
          lastActivity: "Added by pathway, 12 Aug 2026",
        },
        {
          id: "p9",
          code: "PSYC 101",
          name: "Introduction to Psychology",
          credits: 3,
          section: "Lec-03",
          classNo: "1085",
          campus: "Main",
          modality: "In Person",
          gradeOption: "Graded",
          accent: "purple",
          meetings: [
            { day: 2, from: 13, to: 14.25 },
            { day: 4, from: 13, to: 14.25 },
          ],
          instructor: "Dr. T. Boateng",
          topic: "Cognition",
          building: "Science Center",
          room: "230",
          subTerm: "Full Term",
          lastActivity: "Added by pathway, 12 Aug 2026",
        },
      ],
    },
    {
      id: "spring-2027",
      name: "Spring 2027",
      window: "Jan - May",
      campus: "Main campus",
      reviewed: true,
      locked: true,
      scheduled: true,
      state: "completed",
      courses: [
        {
          id: "p5",
          code: "ACCT 201",
          name: "Financial Accounting",
          credits: 3,
          section: "Lec-01",
          classNo: "1511",
          campus: "Main",
          modality: "In Person",
          gradeOption: "Graded",
          accent: "purple",
          meetings: [
            { day: 1, from: 10.5, to: 11.75 },
            { day: 3, from: 10.5, to: 11.75 },
          ],
          instructor: "Prof. D. Sullivan",
          building: "Braddock Hall",
          room: "301",
          subTerm: "Full Term",
          lastActivity: "Added by pathway, 4 Dec 2026",
        },
        {
          id: "p6",
          code: "ECON 201",
          name: "Principles of Microeconomics",
          credits: 3,
          section: "Lec-01",
          classNo: "1524",
          campus: "Main",
          modality: "In Person",
          gradeOption: "Graded",
          accent: "amber",
          meetings: [
            { day: 2, from: 9, to: 10.25 },
            { day: 4, from: 9, to: 10.25 },
          ],
          instructor: "Dr. A. Petrov",
          building: "Braddock Hall",
          room: "115",
          subTerm: "Full Term",
          lastActivity: "Added by pathway, 4 Dec 2026",
        },
        {
          id: "p7",
          code: "MIS 120",
          name: "Business Technology Essentials",
          credits: 3,
          section: "Lab-02",
          classNo: "1548",
          campus: "Main",
          modality: "Hybrid",
          gradeOption: "Graded",
          accent: "green",
          meetings: [
            { day: 2, from: 14, to: 15.25 },
            { day: 4, from: 14, to: 15.25 },
          ],
          instructor: "Prof. K. Iyer",
          building: "Braddock Hall",
          room: "Lab 2",
          subTerm: "Second Half",
          lastActivity: "Added by pathway, 4 Dec 2026",
        },
        {
          id: "p8",
          code: "ART 105",
          name: "Visual Culture",
          credits: 3,
          section: "Lec-01",
          classNo: "1570",
          campus: "Main",
          modality: "In Person",
          gradeOption: "Pass/Fail",
          accent: "brown",
          meetings: [{ day: 3, from: 15.5, to: 18 }],
          instructor: "Prof. J. Moreau",
          topic: "Modern & Contemporary",
          building: "Kline Arts",
          room: "008",
          subTerm: "Full Term",
          lastActivity: "Added by pathway, 4 Dec 2026",
        },
        {
          id: "p10",
          code: "COMM 230",
          name: "Public Speaking",
          credits: 3,
          section: "Lec-02",
          classNo: "1593",
          campus: "Main",
          modality: "In Person",
          gradeOption: "Graded",
          accent: "amber",
          meetings: [
            { day: 1, from: 13, to: 14.25 },
            { day: 3, from: 13, to: 14.25 },
          ],
          instructor: "Prof. E. Castellanos",
          building: "Hale Hall",
          room: "140",
          attributes: "Oral Communication",
          subTerm: "Full Term",
          lastActivity: "Added by pathway, 4 Dec 2026",
        },
      ],
    },
  ],
}

/** The roll-up the planner shows in place of that year, counted from it so the
 *  two can never disagree. */
export const COMPLETED = {
  label: COMPLETED_YEAR.label,
  courses: COMPLETED_YEAR.terms.reduce((n, t) => n + t.courses.length, 0),
  credits: COMPLETED_YEAR.terms.reduce(
    (n, t) => n + t.courses.reduce((c, course) => c + course.credits, 0),
    0
  ),
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
            instructor: "Dr. P. Lindqvist",
            building: "Braddock Hall",
            room: "220",
            subTerm: "Full Term",
            lastActivity: "Added by pathway, 3 Apr 2027",
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
            instructor: "Prof. D. Sullivan",
            building: "Braddock Hall",
            room: "301",
            subTerm: "Full Term",
            lastActivity: "Added by pathway, 3 Apr 2027",
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
            instructor: "Dr. A. Petrov",
            building: "Braddock Hall",
            room: "115",
            subTerm: "Full Term",
            lastActivity: "Added by pathway, 3 Apr 2027",
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
            instructor: "Dr. L. Whitfield",
            topic: "Applied Regression",
            building: "Science Center",
            room: "Lab 1",
            subTerm: "Full Term",
            lastActivity: "Added by sabott, 11 Apr 2027",
          },
          {
            id: "c7",
            code: "MKTG 201",
            name: "Principles of Marketing",
            credits: 3,
            section: "Lec-02",
            classNo: "2190",
            campus: "Main",
            modality: "In Person",
            gradeOption: "Graded",
            accent: "amber",
            meetings: [
              { day: 1, from: 10.5, to: 11.75 },
              { day: 3, from: 10.5, to: 11.75 },
            ],
            instructor: "Prof. N. Adeyemi",
            building: "Braddock Hall",
            room: "118",
            attributes: "Service Learning",
            subTerm: "Full Term",
            lastActivity: "Added by pathway, 3 Apr 2027",
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
            lastActivity: "Added by you, 2 Sep 2027",
          },
          {
            id: "c6",
            code: "FIN 415",
            name: "Financial Modeling & Valuation",
            credits: 3,
            accent: "amber",
            lastActivity: "Added by you, 2 Sep 2027",
          },
        ],
      },
    ],
  },
  /* The degree is a four-year one and the student started in Fall 2026, so the
   * plan reaches Spring 2030 and stops. A pace that cannot fit inside it has to
   * add a year of its own, which is the point: the extra year is the cost of
   * the lighter load, and it should be visible rather than pre-drawn. */
  emptyYear(2028),
  emptyYear(2029),
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
  completed: "Completed",
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

/* --------------------------------------------------------- plan details */

/* What "Plan details" can put on a course card. Everything here is off the
 * card until it is switched on, and a field a course has no value for stays
 * off whatever the setting says — a card never carries an empty label. */

export type MetadataField =
  | "credits"
  | "modality"
  | "campus"
  | "instructor"
  | "topic"
  | "building"
  | "room"
  | "attributes"
  | "subTerm"
  | "lastActivity"

export const METADATA_FIELDS: { id: MetadataField; label: string }[] = [
  { id: "credits", label: "Credits" },
  { id: "modality", label: "Modality" },
  { id: "campus", label: "Campus" },
  { id: "instructor", label: "Instructor" },
  { id: "topic", label: "Topic" },
  { id: "building", label: "Building" },
  { id: "room", label: "Room" },
  { id: "attributes", label: "Section Attributes" },
  { id: "subTerm", label: "Sub-term" },
  { id: "lastActivity", label: "Last activity" },
]

/** Nothing to begin with. A card opens as the course and its section alone,
 *  and every detail on it is one somebody chose to show. */
export const METADATA_DEFAULT: MetadataField[] = []

/** What a course can say about itself, in the order the menu lists it. Last
 *  activity is left out: it is not a tag, and the card gives it its own line. */
export function courseTags(course: PlannedCourse, shown: MetadataField[]): string[] {
  const value: Partial<Record<MetadataField, string | undefined>> = {
    credits: `${course.credits} credits`,
    modality: course.modality,
    campus: course.campus,
    instructor: course.instructor,
    topic: course.topic,
    building: course.building,
    room: course.room,
    attributes: course.attributes,
    subTerm: course.subTerm,
  }

  return METADATA_FIELDS.flatMap(({ id }) => {
    if (id === "lastActivity" || !shown.includes(id)) return []
    const text = value[id]
    return text ? [text] : []
  })
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
