import {
  COUNTING_NOW,
  STUDENT_RECORD,
  type AuditCourse,
  type AuditEntry,
  type AuditGroup,
  type AuditMark,
} from "@/data/audit"
import { CREDITS_PER_COURSE } from "@/data/plan"

/* What else this transcript could be worth.
 *
 * A program here is written the way a catalogue writes one — requirements, and
 * the courses each asks for — and nothing about the student is written into it
 * at all. `auditProgram` runs it against `STUDENT_RECORD` to produce the same
 * `AuditGroup` the degree audit is made of, which is what lets the result be
 * put straight onto the page beside the degree.
 *
 * That is also what makes the answer honest: a course is marked taken here
 * because the student took it, not because someone typed "taken" beside it,
 * and the credits-to-go on a result card is the same count the tree shows. */

export type ProgramKind = "Major" | "Minor" | "Certificate"

export type ProgramRequirement = {
  id: string
  name: string
  tags: string[]
  /** What the requirement asks for. A code the student does not hold is a
   *  course they still owe; a seat is one they will choose later. */
  courses: { code: string; name: string }[]
}

export type Program = {
  id: string
  name: string
  kind: ProgramKind
  school: string
  department: string
  campus: string
  level: "Undergraduate" | "Graduate"
  requirements: ProgramRequirement[]
}

const seat = (name: string) => ({ code: "", name })

/* Three, chosen rather than listed. This student is two years into a Business
 * Administration B.S. with a Finance concentration, so what is worth putting
 * in front of them is what their transcript already half-answers: a minor that
 * is nearly free, a major that their business core almost covers, and a major
 * that would put their unmatched dual-enrolment credit to work. */
export const PROGRAMS: Program[] = [
  {
    id: "data-analytics-minor",
    name: "Data Analytics",
    kind: "Minor",
    school: "School of Computing",
    department: "Data Analytics",
    campus: "Main campus",
    level: "Undergraduate",
    requirements: [
      {
        id: "da-core",
        name: "Analytics Core",
        tags: ["fulfill all"],
        courses: [
          { code: "MATH 140", name: "Business Calculus" },
          { code: "STAT 210", name: "Business Statistics" },
          { code: "MIS 120", name: "Business Technology Essentials" },
          { code: "DATA 220", name: "Foundations of Data Analytics" },
          { code: "DATA 310", name: "Data Visualization" },
        ],
      },
      {
        id: "da-applied",
        name: "Applied Analytics",
        tags: ["at least 6 credits"],
        courses: [
          { code: "STAT 320", name: "Econometrics for Business" },
          seat("Analytics elective"),
        ],
      },
    ],
  },
  {
    id: "accounting-bs",
    name: "Accounting, B.S.",
    kind: "Major",
    school: "College of Business",
    department: "Accounting",
    campus: "Main campus",
    level: "Undergraduate",
    requirements: [
      {
        id: "acct-gen-ed",
        name: "General Education",
        tags: ["fulfill all"],
        courses: [
          { code: "ENGL 101", name: "Composition I" },
          { code: "HIST 110", name: "World Civilizations" },
          { code: "PSYC 101", name: "Introduction to Psychology" },
          { code: "ART 105", name: "Visual Culture" },
          { code: "COMM 230", name: "Public Speaking" },
          { code: "ENGL 210", name: "Advanced Composition" },
          { code: "PHIL 240", name: "Business Ethics" },
        ],
      },
      {
        id: "acct-business-core",
        name: "Business Core",
        tags: ["fulfill all"],
        courses: [
          { code: "BUS 101", name: "Introduction to Business" },
          { code: "MATH 140", name: "Business Calculus" },
          { code: "ACCT 201", name: "Financial Accounting" },
          { code: "ECON 201", name: "Principles of Microeconomics" },
          { code: "MIS 120", name: "Business Technology Essentials" },
          { code: "ACCT 202", name: "Managerial Accounting" },
          { code: "ECON 202", name: "Principles of Macroeconomics" },
          { code: "STAT 210", name: "Business Statistics" },
          { code: "MKTG 201", name: "Principles of Marketing" },
          { code: "MGMT 210", name: "Principles of Management" },
          { code: "BLAW 301", name: "Business Law & Ethics" },
          { code: "OPS 320", name: "Operations & Supply Chain Management" },
        ],
      },
      {
        id: "acct-core",
        name: "Accounting Core",
        tags: ["fulfill all"],
        courses: [
          { code: "ACCT 310", name: "Intermediate Accounting I" },
          { code: "ACCT 320", name: "Intermediate Accounting II" },
          { code: "ACCT 330", name: "Cost Accounting" },
          { code: "ACCT 410", name: "Auditing" },
          { code: "ACCT 420", name: "Federal Taxation" },
          { code: "ACCT 450", name: "Accounting Information Systems" },
        ],
      },
      {
        id: "acct-electives",
        name: "Open Electives",
        tags: ["at least 9 credits"],
        courses: [seat("Open elective"), seat("Open elective"), seat("Open elective")],
      },
    ],
  },
  {
    id: "economics-ba",
    name: "Economics, B.A.",
    kind: "Major",
    school: "College of Arts & Sciences",
    department: "Economics",
    campus: "Main campus",
    level: "Undergraduate",
    requirements: [
      {
        id: "econ-foundations",
        name: "Arts & Sciences Foundations",
        tags: ["fulfill all"],
        courses: [
          { code: "ENGL 101", name: "Composition I" },
          { code: "HIST 110", name: "World Civilizations" },
          { code: "PSYC 101", name: "Introduction to Psychology" },
          { code: "ART 105", name: "Visual Culture" },
          { code: "COMM 230", name: "Public Speaking" },
          /* Two the business degree had no use for. A language and a second
             history are exactly what an arts degree asks for, which is the
             whole argument for reading the unmatched list. */
          { code: "SPAN 101", name: "Elementary Spanish I" },
          { code: "HIST 101", name: "United States History I" },
        ],
      },
      {
        id: "econ-core",
        name: "Economics Core",
        tags: ["fulfill all"],
        courses: [
          { code: "ECON 201", name: "Principles of Microeconomics" },
          { code: "ECON 202", name: "Principles of Macroeconomics" },
          { code: "ECON 310", name: "Money & Banking" },
          { code: "ECON 320", name: "Intermediate Microeconomics" },
          { code: "ECON 330", name: "Intermediate Macroeconomics" },
          { code: "ECON 400", name: "Economic Research Seminar" },
        ],
      },
      {
        id: "econ-quant",
        name: "Quantitative Methods",
        tags: ["fulfill all"],
        courses: [
          { code: "MATH 110", name: "College Algebra" },
          { code: "MATH 140", name: "Business Calculus" },
          { code: "STAT 210", name: "Business Statistics" },
          { code: "STAT 320", name: "Econometrics for Business" },
        ],
      },
      {
        id: "econ-electives",
        name: "Economics Electives",
        tags: ["at least 12 credits"],
        courses: [
          seat("Economics elective"),
          seat("Economics elective"),
          seat("Economics elective"),
          seat("Economics elective"),
        ],
      },
      {
        id: "econ-open",
        name: "Open Electives",
        tags: ["at least 18 credits"],
        courses: Array.from({ length: 6 }, () => seat("Open elective")),
      },
    ],
  },
]

/* -------------------------------------------------------------- the audit */

let seq = 0

/** One requirement's course, read against the transcript: what the student
 *  holds if they hold it, and what they owe if they do not. */
function auditCourse(
  want: { code: string; name: string },
  alongside: boolean
): AuditCourse {
  const held = want.code ? STUDENT_RECORD.get(want.code) : undefined

  if (!held) {
    return {
      kind: "course",
      id: `p${++seq}`,
      code: want.code,
      name: want.name,
      credits: CREDITS_PER_COURSE,
      mark: "remaining",
    }
  }

  return {
    kind: "course",
    id: `p${++seq}`,
    code: held.code,
    name: want.name,
    credits: held.credits,
    mark: held.mark,
    result: held.result,
    grade: held.grade,
    /* Only a course already counting toward the degree can count twice. One
       off the unmatched list was counting toward nothing, so taking it up
       here is not double counting — it is the first time it has counted. */
    doubleCounts: alongside && COUNTING_NOW.has(held.code),
  }
}

/** The program as an audit: the same tree the degree is drawn from, so it can
 *  be put on the page beside it without anything new being taught.
 *
 *  `alongside` says whether the degree is still on the record. Adding a
 *  program leaves it there, and courses that answer both are marked; changing
 *  major takes it away, and nothing is counting twice because there is only
 *  one program left to count toward. */
export function auditProgram(program: Program, alongside: boolean): AuditGroup {
  const children: AuditEntry[] = program.requirements.map((requirement) => {
    const courses = requirement.courses.map((want) => auditCourse(want, alongside))

    return {
      kind: "group",
      id: `${program.id}-${requirement.id}`,
      level: "requirement",
      name: requirement.name,
      mark: groupMark(courses),
      tags: requirement.tags,
      children: courses,
    }
  })

  const standing = programStanding(program)

  return {
    kind: "group",
    id: program.id,
    level: "degree",
    name: `${program.name} [${program.kind.toLowerCase()}]`,
    subtitle: `${program.school} · ${program.department} · Catalog Term: Fall 2026`,
    tags: [`fulfill all | at least ${programTotal(program) * CREDITS_PER_COURSE} credits`],
    counts: { requirements: standing.remaining, milestones: 0 },
    bar: {
      taken: standing.taken,
      inProgress: standing.inProgress,
      claimed: standing.planned,
      total: programTotal(program),
    },
    children,
  }
}

/** How a requirement stands, from how its courses do: done when every course
 *  is, under way when any has started, outstanding otherwise. */
function groupMark(courses: AuditCourse[]): AuditMark {
  if (courses.every((course) => course.mark === "taken")) return "taken"
  if (courses.some((course) => course.mark !== "remaining")) return "in-progress"
  return "remaining"
}

/* ------------------------------------------------------------- the figures */

/** Where the student would stand against this program — counted off the same
 *  requirements the tree is built from, so the card and the tree cannot
 *  disagree. */
export function programStanding(program: Program) {
  const marks = program.requirements.flatMap((requirement) =>
    requirement.courses.map(
      (want) => (want.code ? STUDENT_RECORD.get(want.code)?.mark : undefined) ?? "remaining"
    )
  )
  const count = (...of: AuditMark[]) => marks.filter((mark) => of.includes(mark)).length

  return {
    taken: count("taken"),
    inProgress: count("in-progress"),
    planned: count("registered", "planned"),
    remaining: count("remaining"),
  }
}

export function programTotal(program: Program): number {
  return program.requirements.reduce((sum, r) => sum + r.courses.length, 0)
}

/** What is left to earn, which is what the results are sorted by: the thing a
 *  student actually weighs when deciding whether a program is worth taking on. */
export function creditsToGo(program: Program): number {
  return programStanding(program).remaining * CREDITS_PER_COURSE
}

/** How much of the program the transcript already answers. */
export function alreadyCounting(program: Program): number {
  const { taken, inProgress, planned } = programStanding(program)
  return taken + inProgress + planned
}

/* ------------------------------------------------------------------ filters */

export type FilterField = {
  id: keyof Pick<Program, "school" | "department" | "campus" | "kind" | "level">
  label: string
  placeholder: string
}

export type FilterGroup = {
  id: string
  label: string
  fields: FilterField[]
}

export const FILTER_GROUPS: FilterGroup[] = [
  {
    id: "offered-by",
    label: "Offered By",
    fields: [
      { id: "school", label: "School", placeholder: "Select School" },
      { id: "department", label: "Department", placeholder: "Select Department" },
      { id: "campus", label: "Campus", placeholder: "Select Campus" },
    ],
  },
  {
    id: "type",
    label: "Type",
    fields: [{ id: "kind", label: "Type", placeholder: "Select Type" }],
  },
  {
    id: "level",
    label: "Level",
    fields: [{ id: "level", label: "Level", placeholder: "Select Level" }],
  },
]

/** What a field can be filtered to, read off the programs on offer rather than
 *  written down beside them — a filter that offers something nothing is would
 *  return nothing. */
export function fieldOptions(field: FilterField["id"], within: Program[] = PROGRAMS): string[] {
  return [...new Set(within.map((program) => program[field]))].sort()
}

export type FilterState = Partial<Record<FilterField["id"], string[]>>

/** Every field with a value has to be satisfied; a field with none asks
 *  nothing. Sorted by what is left to earn. */
export function matchPrograms(filters: FilterState, within: Program[] = PROGRAMS): Program[] {
  return within
    .filter((program) =>
      Object.entries(filters).every(([field, values]) => {
        if (!values || values.length === 0) return true
        return values.includes(program[field as FilterField["id"]])
      })
    )
    .sort((a, b) => creditsToGo(a) - creditsToGo(b))
}

export function activeFilters(filters: FilterState): { field: FilterField; values: string[] }[] {
  return FILTER_GROUPS.flatMap((group) =>
    group.fields
      .filter((field) => (filters[field.id]?.length ?? 0) > 0)
      .map((field) => ({ field, values: filters[field.id] ?? [] }))
  )
}

export function groupOf(field: FilterField): FilterGroup {
  return FILTER_GROUPS.find((group) => group.fields.includes(field))!
}

/** The codes this program would actually count — the ones the student holds.
 *  A course it asks for and they have not got counts toward nothing yet. */
export function countedBy(program: Program): Set<string> {
  return new Set(
    program.requirements
      .flatMap((requirement) => requirement.courses.map((want) => want.code))
      .filter((code) => code && STUDENT_RECORD.has(code))
  )
}

/** Mark the degree's own copies of the courses a second program has taken up.
 *  Double counting is a fact about a course, not about one tree, so it has to
 *  show on both — except under an additional check, which consumes nothing and
 *  would put the mark on half the audit. */
export function markDoubleCounting(audit: AuditGroup, codes: Set<string>): AuditGroup {
  const mark = (entry: AuditEntry): AuditEntry => {
    if (entry.kind === "course") {
      return codes.has(entry.code) ? { ...entry, doubleCounts: true } : entry
    }
    if (entry.restated) return entry
    return { ...entry, children: entry.children.map(mark) }
  }

  return { ...audit, children: audit.children.map(mark) }
}
