import type { CatalogEntry } from "@/data/catalog"
import { CREDITS_PER_COURSE } from "@/data/plan"

/* What a course looks like when it is opened on its own: the catalogue entry
 * for it, the classes on offer, and everything the audit knows about where it
 * could count. None of this is in the plan's own data — a course the student
 * has not taken has no row anywhere — so it is built from the entry, the same
 * way every term gets its sections: deterministic from the code, so the same
 * course reads the same every time it is opened. */

export type PrereqState = "earned" | "progress" | "planned" | "remaining" | "blocked"

export type PrereqNode = {
  /** A course by its code, or a condition in words. One or the other. */
  code?: string
  label?: string
  /** "minimum grade B" and the like, beside the code. */
  note?: string
  state?: PrereqState
  /** What it came to, on the right: a grade, a standing, a count. */
  meta?: string
  tone?: "good" | "bad"
  /** A group of its own, which is what makes this a tree. */
  children?: PrereqNode[]
  open?: boolean
}

export type PrereqOption = {
  name: string
  state: PrereqState
  meta: string
  tone?: "good" | "bad"
  open?: boolean
  /** Said in place of the children while it is folded away. */
  summary?: string
  children: PrereqNode[]
}

export type Section = {
  code: string
  when: string[]
  who: string
  seats: string
}

export type CourseDetail = {
  credits: number
  campus: string
  sections: Section[]
  /** Sections not shown, because they have no seats left. */
  hidden: number
  attributes: string[]
  topics: string[]
  description: string
  requiredSections: { kind: string; available: number }[]
  instructors: { name: string; semesters: number }[]
  prerequisites: { directive: string; options: PrereqOption[] }
  equivalents: string[]
  countsFor: { name: string; under: string }[]
  repeatable: string
}

const INSTRUCTORS = [
  "Dr. P. Lindqvist",
  "Dr. A. Ferreira",
  "Dr. R. Okafor",
  "M. Stehlik",
  "Dr. J. Alvarez",
  "Dr. N. Haddad",
]

const TIMES = [
  ["MWF 9:00am - 10:15am"],
  ["TR 11:00am - 12:15pm"],
  ["MW 1:00pm - 2:15pm", "F 10:00am - 10:50am"],
  ["TR 2:30pm - 3:45pm"],
]

const ATTRIBUTES = ["Business core", "Writing intensive", "Quantitative", "Global perspective"]
const TOPICS = ["Markets", "Analysis", "Case method", "Applied practice"]

/** Same code, same details, every time — the panel is a fact about a course
 *  rather than something that changes each time it is opened. */
function seedOf(code: string): number {
  return [...code].reduce((n, c) => n + c.charCodeAt(0), 0)
}

function prerequisites(seed: number): CourseDetail["prerequisites"] {
  const first = ["FIN 301", "ACCT 202", "ECON 202"][seed % 3]
  const second = ["STAT 210", "MATH 140", "BUS 101"][seed % 3]

  return {
    directive: "Complete any one of 3 options",
    options: [
      {
        name: "Option 1",
        state: "progress",
        meta: "On track",
        tone: "good",
        open: true,
        children: [
          {
            label: "Take any one of",
            open: true,
            children: [
              { code: first, state: "earned", meta: "Taken Fall 2026, A−" },
              { code: second, state: "remaining" },
              {
                label: "All of",
                open: true,
                children: [
                  { code: "MATH 140", state: "earned", meta: "Taken Fall 2026, B+" },
                  { code: "STAT 210", state: "progress", meta: "In progress" },
                ],
              },
            ],
          },
          { code: "BUS 101", note: "minimum grade B", state: "earned", meta: "Taken Fall 2026, A" },
          { label: "Cumulative GPA 2.50", state: "progress", meta: "On track, 3.24", tone: "good" },
          { label: "30 total credits", state: "earned", meta: "30 completed" },
        ],
      },
      {
        name: "Option 2",
        state: "blocked",
        meta: "Can't be met",
        tone: "bad",
        open: false,
        summary: `${second} below the B minimum, and the concentration is not declared`,
        children: [
          { label: "Declare the Marketing concentration", state: "remaining", meta: "Not declared" },
          { code: second, note: "minimum grade B", state: "remaining", meta: "Not earned, C+" },
        ],
      },
      {
        name: "Option 3",
        state: "remaining",
        meta: "Nothing started",
        open: false,
        summary: "Not declared, no course planned",
        children: [
          { label: "Declare a second major", state: "remaining", meta: "Not declared" },
          { code: "BUS 390", state: "remaining" },
        ],
      },
    ],
  }
}

export function courseDetail(entry: CatalogEntry): CourseDetail {
  const seed = seedOf(entry.code)
  const count = 2 + (seed % 3)

  return {
    credits: CREDITS_PER_COURSE,
    campus: "Main",
    sections: Array.from({ length: count }, (_, i) => ({
      code: `Lec-0${i + 1}`,
      when: TIMES[(seed + i) % TIMES.length],
      who: INSTRUCTORS[(seed + i) % INSTRUCTORS.length],
      seats: `${18 + ((seed + i * 7) % 20)}/40`,
    })),
    hidden: 1 + (seed % 3),
    /* The requirement it answers is an attribute like any other; the rest come
       off the shelf, and never the same one twice. */
    attributes: [...new Set([entry.reason, ATTRIBUTES[seed % ATTRIBUTES.length]])],
    topics: [...new Set([TOPICS[seed % TOPICS.length], TOPICS[(seed + 2) % TOPICS.length]])],
    description:
      `${entry.name} is taught around the decisions the work actually turns on: what the ` +
      "numbers are for, who reads them, and what follows from getting them wrong. Coursework " +
      "runs through cases drawn from the last five years, with a term project taken from a " +
      "live brief.",
    requiredSections: [
      { kind: "Lecture", available: count },
      { kind: "Recitation", available: 2 + (seed % 4) },
    ],
    instructors: [
      { name: INSTRUCTORS[seed % INSTRUCTORS.length], semesters: 3 + (seed % 6) },
      { name: INSTRUCTORS[(seed + 3) % INSTRUCTORS.length], semesters: 1 + (seed % 4) },
    ],
    prerequisites: prerequisites(seed),
    equivalents: [`${entry.code.split(" ")[0]}-${300 + (seed % 90)}`, `GEN-${100 + (seed % 80)}`],
    countsFor: [
      { name: entry.reason, under: "BSc in Business Administration" },
      { name: "120 Total Credits", under: "Degree Checks" },
      { name: "Residency Credit", under: "Degree Checks" },
    ],
    repeatable: seed % 2 === 0 ? "Course may be repeated" : "Course may be taken once",
  }
}
