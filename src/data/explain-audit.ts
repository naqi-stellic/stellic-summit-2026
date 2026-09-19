import {
  AUDIT,
  STUDENT_RECORD,
  type AuditCourse,
  type AuditEntry,
  type AuditGroup,
} from "@/data/audit"
import type { Constraint } from "@/data/explain"
import { gpaOf } from "@/data/gpa"
import { CREDITS_PER_COURSE } from "@/data/plan"

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
  /* The third is not a bar to clear — it is what makes the requirement carry a
     GPA at all. Stellic computes one for a requirement only where somebody has
     asked it to, which is why the badge appears on this row and on no other. */
  {
    id: "gen-ed-gpa",
    text: "Compute GPA for this requirement",
  },
]

/** What those six grades come to. Read off the courses rather than stated, so
 *  the badge on the row, the sum in the panel and the rows it is a sum of
 *  cannot disagree. */
export const GENERAL_EDUCATION_GPA = gpaOf(TAKEN)

/** Six rows and no seats, and still four courses short: the credits the first
 *  constraint wants and has not got, said in the unit the mark counts in.
 *
 *  Counting the rows would find nothing missing — every course in this
 *  requirement is finished — which is exactly the case the requirement is here
 *  to demonstrate, and exactly the case a green tick would get wrong. */
const SHORT = Math.ceil(
  (GENERAL_EDUCATION_RULES[0].progress!.total - GENERAL_EDUCATION_RULES[0].progress!.met) /
    CREDITS_PER_COURSE
)

const GENERAL_EDUCATION: AuditGroup = {
  kind: "group",
  id: ID,
  level: "requirement",
  name: "General Education",
  /* Stated rather than derived: this node is swapped into a tree that has
     already had its marks worked out, so it has to arrive with its own. And
     it is the remaining mark whatever its rows say — a requirement short of
     the credits it asks for is not one anybody has finished. */
  mark: "remaining",
  short: SHORT,
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
