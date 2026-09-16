import type { CatalogEntry } from "@/data/catalog"
import { CREDITS_PER_COURSE } from "@/data/plan"

/* What a course looks like when it is opened on its own: the catalogue entry
 * for it, the classes on offer, and everything the audit knows about where it
 * could count. None of this is in the plan's own data — a course the student
 * has not taken has no row anywhere — so it is built from the entry, the same
 * way every term gets its sections: deterministic from the code, so the same
 * course reads the same every time it is opened. */

export type PrereqState =
  | "earned"
  | "progress"
  | "planned"
  /** Asked for and not earned: the audit's red outline. */
  | "remaining"
  /** Asked for and now out of reach. */
  | "blocked"
  /** Nothing has happened here either way — an option nobody has started. */
  | "neutral"

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
  /** One of the children is enough, rather than all of them. */
  any?: boolean
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
  /** No options at all where a course asks for nothing. */
  prerequisites: { directive?: string; options: PrereqOption[] }
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

/* What the student has, which is what the audit reads a prerequisite against.
 * Taken from the plan itself rather than invented here, so a tree never claims
 * a course was passed that the plan says is still to come. */
const EARNED: Record<string, string> = {
  "BUS 101": "Taken Fall 2026, A",
  "MATH 140": "Taken Fall 2026, B+",
  "ENGL 101": "Taken Fall 2026, A−",
  "HIST 110": "Taken Fall 2026, B",
  "PSYC 101": "Taken Fall 2026, A−",
  "ACCT 201": "Taken Spring 2027, B+",
  "ECON 201": "Taken Spring 2027, A−",
  "MIS 120": "Taken Spring 2027, B",
  "ART 105": "Taken Spring 2027, A",
  "COMM 230": "Taken Spring 2027, B+",
}

const IN_PROGRESS = ["FIN 301", "ACCT 202", "ECON 202", "STAT 210", "MKTG 201"]

/** A course as the audit finds it: passed, under way, or still to come. */
function courseNode(code: string, note?: string): PrereqNode {
  if (EARNED[code]) return { code, note, state: "earned", meta: EARNED[code] }
  if (IN_PROGRESS.includes(code)) return { code, note, state: "progress", meta: "In progress" }
  return { code, note, state: "remaining" }
}

/* Conditions that are not courses. The student's own standing decides how each
 * one reads: a 3.24 average, thirty credits earned, sophomore, and the finance
 * concentration declared. */
const CONDITIONS: Record<string, PrereqNode> = {
  gpa: {
    label: "Cumulative GPA 2.50",
    state: "earned",
    meta: "3.24",
  },
  credits: {
    label: "30 total credits",
    state: "earned",
    meta: "30 completed",
  },
  standing: {
    label: "Sophomore standing",
    state: "earned",
    meta: "Sophomore",
  },
  junior: {
    label: "Junior standing",
    state: "progress",
    meta: "On track, Junior by Fall 2028",
    tone: "good",
  },
  declared: {
    label: "Declare the Finance concentration",
    state: "earned",
    meta: "Declared Sep 2026",
  },
  second: {
    label: "Declare a second major",
    state: "neutral",
    meta: "Not declared",
  },
}

/** What an option comes to, read off what is inside it. */
function summarise(name: string, children: PrereqNode[], open: boolean): PrereqOption {
  /* A group where one child is enough counts as one thing, and is met by the
     best of what is inside it — otherwise a choice would read as a shortfall
     merely for having options the student did not take. */
  const rank = (state?: PrereqState) =>
    state === "earned" ? 2 : state === "progress" ? 1 : 0
  const flat = (nodes: PrereqNode[]): PrereqNode[] =>
    nodes.flatMap((node) => {
      if (!node.children) return [node]
      const inside = flat(node.children)
      if (!node.any) return inside
      const best = inside.reduce((a, b) => (rank(b.state) > rank(a.state) ? b : a))
      return [best]
    })
  const leaves = flat(children)
  const earned = leaves.filter((n) => n.state === "earned").length
  const going = leaves.filter((n) => n.state === "progress").length
  const missing = leaves.length - earned - going

  if (missing === 0 && going === 0) {
    return { name, state: "earned", meta: "Earned", tone: "good", open, children }
  }
  if (earned === 0 && going === 0) {
    return { name, state: "neutral", meta: "Nothing started", open, children }
  }
  if (missing === 0) {
    return { name, state: "progress", meta: "On track", tone: "good", open, children }
  }
  return {
    name,
    state: "remaining",
    meta: `${missing} not earned`,
    tone: "bad",
    open,
    children,
  }
}

/* The courses a subject builds on within itself. A finance elective asks for
 * finance rather than for whatever the general pool happened to offer, which
 * is also what makes a course in the plan hold up the ones after it. */
const SUBJECT_GATE: Record<string, string[]> = {
  FIN: ["FIN 301", "FIN 340"],
  ACCT: ["ACCT 201", "ACCT 202"],
  ECON: ["ECON 201", "ECON 202"],
  DATA: ["STAT 210", "MIS 250"],
  STAT: ["MATH 140", "STAT 210"],
  MIS: ["MIS 120", "MIS 250"],
  OPS: ["STAT 210", "OPS 320"],
  BUS: ["BUS 101", "ECON 201"],
  MKTG: ["MKTG 201", "BUS 101"],
  MGMT: ["BUS 101", "MGMT 210"],
  BLAW: ["BUS 101"],
}

/** The number in a course's code, which is how far into the subject it is and
 *  therefore how much it asks for. */
function level(code: string): number {
  return Number(code.replace(/\D+/g, "")) || 100
}

/* How much a course asks for depends on how deep it is: a first-year course
 * asks for nothing, a second-year one for a course or two, and only the later
 * ones offer more than one way in. */
function prerequisites(entry: CatalogEntry, seed: number): CourseDetail["prerequisites"] {
  const depth = level(entry.code)
  /* Never ask a course for itself: the deeper lists hold courses that are
     themselves in the catalogue. */
  const pick = (from: string[]) => {
    const rest = from.filter((code) => code !== entry.code)
    return rest[seed % rest.length]
  }
  const gate = pick(["BUS 101", "MATH 140", "ACCT 201", "ECON 201"])
  const second = pick(["ACCT 202", "ECON 202", "STAT 210", "MKTG 201"])
  /* Only what comes below it in its own subject: a course cannot be asked for
     by something the student takes before it. */
  const own = (SUBJECT_GATE[entry.code.split(" ")[0]] ?? []).filter(
    (code) => level(code) < depth
  )
  const later = own.length ? own[seed % own.length] : pick(["FIN 301", "MIS 250", "OPS 320", "BUS 390"])

  if (depth < 200) return { options: [] }

  if (depth < 300) {
    /* One way in, so the option itself is not worth naming. */
    return {
      options: [
        summarise("Option 1", [courseNode(gate), CONDITIONS.credits], true),
      ],
    }
  }

  if (depth < 400) {
    return {
      directive: "Complete any one of 2 options",
      options: [
        summarise("Option 1", [courseNode(gate), courseNode(second), CONDITIONS.gpa], true),
        summarise("Option 2", [courseNode(later), CONDITIONS.declared], false),
      ],
    }
  }

  /* A final-year course: three ways in, one of them out of reach. */
  return {
    directive: "Complete any one of 3 options",
    options: [
      summarise(
        "Option 1",
        [
          {
            label: "Take any one of",
            any: true,
            open: true,
            children: [courseNode(second), courseNode(later)],
          },
          courseNode(gate, "minimum grade B"),
          CONDITIONS.gpa,
          CONDITIONS.junior,
        ],
        true
      ),
      {
        name: "Option 2",
        state: "blocked",
        meta: "Can't be met",
        tone: "bad",
        open: false,
        /* Out of reach rather than merely unmet: the grade is already in and
           the course cannot be repeated. */
        summary: "MIS 120 was passed at B, under the A− this option asks for",
        children: [
          {
            code: "MIS 120",
            note: "minimum grade A−",
            state: "blocked",
            meta: "Taken Spring 2027, B",
            tone: "bad",
          },
          CONDITIONS.standing,
        ],
      },
      summarise("Option 3", [CONDITIONS.second, courseNode(later), CONDITIONS.credits], false),
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
    prerequisites: prerequisites(entry, seed),
    equivalents: [`${entry.code.split(" ")[0]}-${300 + (seed % 90)}`, `GEN-${100 + (seed % 80)}`],
    countsFor: [
      { name: entry.reason, under: "BSc in Business Administration" },
      { name: "120 Total Credits", under: "Degree Checks" },
      { name: "Residency Credit", under: "Degree Checks" },
    ],
    repeatable: seed % 2 === 0 ? "Course may be repeated" : "Course may be taken once",
  }
}

/* ------------------------------------------------- what the plan makes of it */

/** Every course a prerequisite tree names, which is how the plan finds out
 *  what a course is holding up. */
export function prerequisiteCodes(code: string): string[] {
  const tree = prerequisites({ code, name: "", reason: "" }, seedOf(code))
  const out: string[] = []
  const walk = (nodes: PrereqNode[]) =>
    nodes.forEach((node) => {
      if (node.code) out.push(node.code)
      if (node.children) walk(node.children)
    })
  tree.options.forEach((option) => walk(option.children))
  return [...new Set(out)]
}

export type Activity = {
  kind: "add" | "remove"
  term: string
  when: string
  who: string
}

/* What has happened to this course in the plan. A course that has sat where it
 * was first put has one event; one that was moved has the three that says so,
 * newest first. */
export function activityFor(code: string, term: string, moved?: string): Activity[] {
  const seed = seedOf(code)
  const student = "Scott Abott"
  /* An advisor moves a course out of a term now and then; the student puts it
     back. Which of them it was is the seed's business. */
  const remover = seed % 3 === 0 ? "Mark Stehlik" : student

  if (!moved || seed % 3 === 0) {
    return [{ kind: "add", term, when: "2 months ago", who: student }]
  }
  return [
    { kind: "add", term, when: "3 weeks ago", who: student },
    { kind: "remove", term: moved, when: "1 month ago", who: remover },
    { kind: "add", term: moved, when: "2 months ago", who: student },
  ]
}
