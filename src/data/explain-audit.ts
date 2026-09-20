import {
  AUDIT,
  STUDENT_RECORD,
  auditStanding,
  milestoneStanding,
  viewsFor,
  type AuditCourse,
  type AuditEntry,
  type AuditGroup,
} from "@/data/audit"
import type { Constraint } from "@/data/explain"
import { gpaOf, gpaOfGroup, type Gpa } from "@/data/gpa"
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

/* Six taken, eighteen credits, five of them upper division. The whole of the
   story this requirement is here to tell, and it needs both answers in it: a
   student who has satisfied one of the two constraints outright and is still
   twelve credits short on the other. A requirement with nothing met reads as
   a requirement nobody has started — the interesting case, and the one that
   makes a reader look at which line the number came from, is the requirement
   that is half answered. */
const TAKEN: AuditCourse[] = [
  gen("GEN 110", "Writing & Rhetoric", "Taken in Fall '25", "A-", [GENERAL]),
  /* The 300s are what carries the attribute, which is the whole of why the
     second constraint is met and the first is not: fifteen of these eighteen
     credits are upper division, and the course set the first constraint reads
     against does not care either way. */
  gen("GEN 310", "The Ancient World", "Taken in Fall '25", "B+", [GENERAL, UPPER]),
  gen("GEN 330", "Mind & Behaviour", "Taken in Fall '25", "A", [GENERAL, UPPER]),
  gen("GEN 340", "Science, Ethics & Society", "Taken in Spring '26", "B", [GENERAL, UPPER]),
  gen("GEN 360", "Visual Culture", "Taken in Spring '26", "A-", [GENERAL, UPPER]),
  gen("GEN 380", "Power, Politics & Society", "Taken in Spring '26", "B+", [GENERAL, UPPER]),
]

const COURSES = TAKEN

const CREDITS = (of: AuditCourse[]) => of.reduce((sum, course) => sum + course.credits, 0)

/** Both of them the same template — "Take at least [x] courses/credits from a
 *  given course set" — so the only thing that differs between the two lines is
 *  the fraction, which is the comparison the requirement exists to make — and
 *  one of them is met and the other is not, so the panel shows both answers a
 *  constraint can give against the same wording and the same student.
 *
 *  Each set is matched rather than described: the courses carry the attributes
 *  and the constraint names them, so the numbers are counted off the rows
 *  above rather than typed underneath. */
export const GENERAL_EDUCATION_RULES: Constraint[] = [
  {
    id: "gen-ed-credits",
    text: "Take at least 30 credits from a given course set",
    notes: [{ text: "Course set: GEN 100 to GEN 599" }],
    progress: { met: CREDITS(TAKEN), total: 30 },
    attributes: [GENERAL],
  },
  {
    id: "gen-ed-upper",
    text: "Take at least 15 credits from a given course set",
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
  const children = entry.children.map(swap)
  /* The programme's average is read off the courses under it, and the courses
     under it have just changed — five general-education grades have become
     six. Left alone it would go on publishing the shared tree's number while
     the rows it is a sum of said otherwise. */
  if (entry.level === "program") {
    const swapped = { ...entry, children }
    return { ...swapped, pgpa: gpaOfGroup(swapped) }
  }
  return { ...entry, children }
}

/* The credential row's own counts, recounted off the tree it is now heading.
   They are stated on the node rather than derived at render, so the swap has
   to restate them — left alone the degree row went on reporting the shared
   tree's twenty-five outstanding while the progress card directly above it,
   which reads this tree, said twenty-two. */
const counted = (audit: AuditGroup): AuditGroup => ({
  ...audit,
  counts: {
    requirements: auditStanding(audit).remaining,
    milestones: milestoneStanding(audit).total - milestoneStanding(audit).done,
  },
})

export const EXPLAIN_AUDIT = counted(swap(AUDIT) as AuditGroup)

/** The two audit-view bars, read off this tree. The shared ones are a picture
 *  of a tree with one fewer finished course in it. */
export const EXPLAIN_VIEWS = viewsFor(auditStanding(EXPLAIN_AUDIT))

/** The transcript this page reads. The shared record plus the six courses only
 *  this tree knows about — course mappings ask "what else is on the record",
 *  and a course sitting in the requirement would otherwise come back as one
 *  the requirement had never been offered. */
export const EXPLAIN_RECORD: Map<string, AuditCourse> = new Map([
  ...STUDENT_RECORD,
  ...TAKEN.map((course) => [course.code, course] as const),
])

/** And what that transcript comes to. The three courses this tree's General
 *  Education displaced are still on the record — they fulfil nothing here,
 *  which the unmatched section says, and a cumulative average counts them
 *  anyway. That is the difference between it and the programme's own. */
export const EXPLAIN_CGPA: Gpa = gpaOf([...EXPLAIN_RECORD.values()])
