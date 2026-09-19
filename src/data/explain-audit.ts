import {
  AUDIT,
  STUDENT_RECORD,
  markFrom,
  type AuditCourse,
  type AuditEntry,
  type AuditGroup,
} from "@/data/audit"
import type { Constraint } from "@/data/explain"

/* The audit as Explain Progress shows it.
 *
 * Every other prototype reads the shared tree. This one swaps a single
 * requirement — General Education — for a simpler shape, because
 * explainability is easier to see on a requirement that asks two questions
 * than on one that asks seven.
 *
 * The rest of the tree is the shared one, untouched, so a change to the degree
 * lands here too. Only the one requirement is local, and only to this page:
 * Proactive Compliance and Advanced What-If still read the courses their own
 * numbers are built on, and nothing that counts credits elsewhere has heard of
 * the courses below.
 *
 * The cost of that is one visible deviation. This page counts eleven courses
 * taken and two fewer outstanding than the others do, because six finished
 * general-education courses have replaced five and three unfinished ones.
 * That is the price of a prototype-local course set, and it buys a requirement
 * whose two constraints can be read at a glance. */

const ID = "general-education"

let seq = 0
const gen = (
  code: string,
  name: string,
  result: string,
  grade: string,
  attributes: string[]
): AuditCourse => ({
  kind: "course",
  id: `x${++seq}`,
  code,
  name,
  credits: 3,
  mark: "taken",
  result,
  grade,
  attributes,
})

/** The attribute every course here carries, and the one only some do. */
export const GENERAL = "General Education"
export const UPPER = "Upper Division"

/* Six taken, eighteen credits, and one of them upper division. The whole of
   the story this requirement is here to tell: a student who has done six
   courses and is still short, and short in a particular way. */
const TAKEN: AuditCourse[] = [
  gen("GEN 110", "Writing & Rhetoric", "Taken in Fall '25", "A-", [GENERAL]),
  gen("GEN 150", "The Ancient World", "Taken in Fall '25", "B+", [GENERAL]),
  gen("GEN 180", "Mind & Behaviour", "Taken in Fall '25", "A", [GENERAL]),
  gen("GEN 210", "Visual Culture", "Taken in Spring '26", "B", [GENERAL]),
  gen("GEN 240", "Public Speaking", "Taken in Spring '26", "A-", [GENERAL]),
  /* The one that answers the second constraint, and the reason it reads 3/15
     rather than 0/15 — one course of the five it wants. */
  gen("GEN 340", "Science, Ethics & Society", "Taken in Spring '26", "B+", [GENERAL, UPPER]),
]

/* Six rows and no seats, so the requirement marks itself complete: every
   course in it is finished. That is the point of it. The row reads as done at
   a glance and the explain says 18 of 30 — a student who has taken six courses
   and is still twelve credits short, twelve of which have to be upper
   division. A requirement that advertised its own gap would not need
   explaining. */
const COURSES = TAKEN

const CREDITS = (of: AuditCourse[]) => of.reduce((sum, course) => sum + course.credits, 0)

/** Both of them the same template — "Take at least [x] courses/credits from a
 *  given course set" — so the only thing that differs between the two lines is
 *  the fraction, which is the comparison the requirement exists to make.
 *
 *  Each set is matched rather than described: the courses carry the attributes
 *  and the constraint names them, so the numbers are counted off the rows
 *  above rather than typed underneath. */
export const GENERAL_EDUCATION_RULES: Constraint[] = [
  {
    id: "gen-ed-credits",
    text: "Take at least 30 courses/credits from a given course set",
    notes: [{ text: "Course set: GEN 100 to GEN 599" }],
    progress: { met: CREDITS(TAKEN), total: 30 },
    attributes: [GENERAL],
  },
  {
    id: "gen-ed-upper",
    text: "Take at least 15 courses/credits from a given course set",
    notes: [{ text: "Course set: courses with attribute Upper Division" }],
    progress: {
      met: CREDITS(TAKEN.filter((course) => course.attributes?.includes(UPPER))),
      total: 15,
    },
    attributes: [UPPER],
  },
]

const GENERAL_EDUCATION: AuditGroup = {
  kind: "group",
  id: ID,
  level: "requirement",
  name: "General Education",
  mark: markFrom(COURSES.map((course) => course.mark)),
  /* The chip counts the constraints, and there are two of them. */
  tags: ["fulfill all"],
  children: COURSES,
}

/** The shared tree with that one requirement standing in for its own. */
function swap(entry: AuditEntry): AuditEntry {
  if (entry.kind !== "group") return entry
  if (entry.id === ID) return GENERAL_EDUCATION
  return { ...entry, children: entry.children.map(swap) }
}

export const EXPLAIN_AUDIT = swap(AUDIT) as AuditGroup

/** The transcript this page reads. The shared record plus the six courses only
 *  this tree knows about — course mappings ask "what else is on the record",
 *  and a course sitting in the requirement would otherwise come back as one
 *  the requirement had never been offered. */
export const EXPLAIN_RECORD: Map<string, AuditCourse> = new Map([
  ...STUDENT_RECORD,
  ...TAKEN.map((course) => [course.code, course] as const),
])
