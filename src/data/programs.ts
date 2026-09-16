import { CREDITS_PER_COURSE } from "@/data/plan"

/* What else this transcript could be worth. The what-if runs the audit's rules
 * over other programs, so a program here is the same thing an audit is: a
 * number of requirements, and how many of them the student has already met.
 *
 * Requirements are one per course, as they are everywhere else in this repo,
 * which is what lets a standing be counted rather than written down and what
 * makes "N credits to go" the remainder times three. */

export type ProgramKind = "Major" | "Minor" | "Certificate"

export type Program = {
  id: string
  name: string
  kind: ProgramKind
  school: string
  department: string
  campus: string
  level: "Undergraduate" | "Graduate"
  /** Where the student would stand against this program's requirements if they
   *  took it on — the same four shares the audit draws. */
  standing: { taken: number; inProgress: number; planned: number; remaining: number }
}

/* Deliberately close to home. This student is on a Business Administration
 * B.S. with a Finance concentration, so what is worth discovering is what
 * their transcript already half-answers — which is why the Data Analytics
 * minor comes out on top, and why the plan prototypes already have a
 * "What-if: Minor in Data Analytics" on file. */
export const PROGRAMS: Program[] = [
  {
    id: "data-analytics-minor",
    name: "Data Analytics",
    kind: "Minor",
    school: "School of Computing",
    department: "Data Analytics",
    campus: "Main campus",
    level: "Undergraduate",
    standing: { taken: 2, inProgress: 1, planned: 0, remaining: 4 },
  },
  {
    id: "business-analytics-certificate",
    name: "Business Analytics",
    kind: "Certificate",
    school: "College of Business",
    department: "Management",
    campus: "Main campus",
    level: "Undergraduate",
    standing: { taken: 1, inProgress: 1, planned: 0, remaining: 2 },
  },
  {
    id: "economics-minor",
    name: "Economics",
    kind: "Minor",
    school: "College of Arts & Sciences",
    department: "Economics",
    campus: "Main campus",
    level: "Undergraduate",
    standing: { taken: 2, inProgress: 1, planned: 0, remaining: 3 },
  },
  {
    id: "accounting-minor",
    name: "Accounting",
    kind: "Minor",
    school: "College of Business",
    department: "Accounting",
    campus: "Main campus",
    level: "Undergraduate",
    standing: { taken: 2, inProgress: 1, planned: 0, remaining: 3 },
  },
  {
    id: "marketing-minor",
    name: "Marketing",
    kind: "Minor",
    school: "College of Business",
    department: "Marketing",
    campus: "Main campus",
    level: "Undergraduate",
    standing: { taken: 1, inProgress: 1, planned: 0, remaining: 4 },
  },
  {
    id: "accounting-bs",
    name: "Accounting, B.S.",
    kind: "Major",
    school: "College of Business",
    department: "Accounting",
    campus: "Main campus",
    level: "Undergraduate",
    standing: { taken: 11, inProgress: 4, planned: 1, remaining: 24 },
  },
  {
    id: "economics-ba",
    name: "Economics, B.A.",
    kind: "Major",
    school: "College of Arts & Sciences",
    department: "Economics",
    campus: "Main campus",
    level: "Undergraduate",
    standing: { taken: 10, inProgress: 4, planned: 1, remaining: 25 },
  },
  {
    id: "data-science-bs",
    name: "Data Science, B.S.",
    kind: "Major",
    school: "School of Computing",
    department: "Data Analytics",
    campus: "Downtown campus",
    level: "Undergraduate",
    standing: { taken: 8, inProgress: 3, planned: 0, remaining: 29 },
  },
]

/** What is left to earn, which is what the results are sorted by: the thing a
 *  student actually weighs when they are deciding whether a programme is worth
 *  taking on. */
export function creditsToGo(program: Program): number {
  return program.standing.remaining * CREDITS_PER_COURSE
}

/** How many requirements the program asks for in all. */
export function programTotal(program: Program): number {
  const { taken, inProgress, planned, remaining } = program.standing
  return taken + inProgress + planned + remaining
}

/* ------------------------------------------------------------------ filters */

/** One question a filter asks. Every field is a list of values to pick from,
 *  and every field reads a single property off a program. */
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

/** What a field can be filtered to, read off the programs themselves rather
 *  than written down beside them — a filter that offers something nothing is
 *  is a filter that returns nothing. */
export function fieldOptions(field: FilterField["id"]): string[] {
  return [...new Set(PROGRAMS.map((program) => program[field]))].sort()
}

export type FilterState = Partial<Record<FilterField["id"], string[]>>

/** Every field with a value has to be satisfied; a field with none asks
 *  nothing. */
export function matchPrograms(filters: FilterState): Program[] {
  return PROGRAMS.filter((program) =>
    Object.entries(filters).every(([field, values]) => {
      if (!values || values.length === 0) return true
      return values.includes(program[field as FilterField["id"]])
    })
  ).sort((a, b) => creditsToGo(a) - creditsToGo(b))
}

/** The filters that have been set, as the chips under the buttons and the rows
 *  on the summary both read them. */
export function activeFilters(filters: FilterState): { field: FilterField; values: string[] }[] {
  return FILTER_GROUPS.flatMap((group) =>
    group.fields
      .filter((field) => (filters[field.id]?.length ?? 0) > 0)
      .map((field) => ({ field, values: filters[field.id] ?? [] }))
  )
}

/** Which group a field belongs to, so a chip can say where it came from and
 *  the summary can name it the way the filter did. */
export function groupOf(field: FilterField): FilterGroup {
  return FILTER_GROUPS.find((group) => group.fields.includes(field))!
}
