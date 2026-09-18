import { DEGREE, STUDENT } from "@/data/plan"

/* The degree audit behind Team Progress: what the degree asks for, and where
 * the student stands against every line of it.
 *
 * This is the same student and the same degree as the Team Plan prototypes —
 * Scott Abott on the 120-credit Business Administration B.S. with a Finance
 * concentration — read from the other end. Team Plan asks "which term does
 * this go in"; the audit asks "does the degree accept it". `DEGREE` and
 * `STUDENT` come from `src/data/plan.ts`, every course below is one the plan
 * holds or still owes, and the forty requirements split the same way: ten
 * taken, five under way, one registered, one seat planned, twenty-three
 * outstanding.
 *
 * The tree is written out rather than generated. An audit is a document the
 * registrar owns — its shape is the catalogue's, not something derived from a
 * plan — so the rows are literal, and every figure above them is counted off
 * these same rows by `auditStanding()`. */

/** How a line of the audit stands. The first four are a course's own state;
 *  `remaining` and `optional` belong to lines nothing has been placed against
 *  yet — the second because nothing needs to be. */
export type AuditMark =
  | "taken"
  | "in-progress"
  | "registered"
  | "planned"
  | "remaining"
  | "optional"

export type AuditCourse = {
  kind: "course"
  id: string
  code: string
  name: string
  credits: number
  mark: AuditMark
  /** "Taken in Fall '25", "In progress · Fall '26" — empty on a line the audit
   *  is only holding a place for. */
  result?: string
  grade?: string
  /** Counting toward more than one program at once. Set when a second program
   *  is on the record, never on an additional check — those always double
   *  count, so the mark would be on every row and mean nothing. */
  doubleCounts?: boolean
}

/** A requirement: a named thing the degree asks for, holding courses or
 *  further requirements. The degree is the same shape — what changes is how
 *  the row is drawn, which is `level`. */
export type AuditGroup = {
  kind: "group"
  id: string
  name: string
  /** The credential heads the tree and the program hangs off it; both carry no
   *  ground. Everything under them is a `requirement` and sits on one. */
  level: "degree" | "program" | "requirement"
  mark?: AuditMark
  /** The red count on the credential row: requirements outstanding. A second,
   *  flagged count for milestones is drawn where there is one to draw. */
  counts?: { requirements: number; milestones?: number }
  subtitle?: string
  /** The grey tags after the name: "fulfill all", "at least 12 credits". */
  tags?: string[]
  /** An additional check rather than a requirement: it re-lists courses that
   *  are counted elsewhere, so the tallies step over it. */
  restated?: boolean
  /** Folded away when the page opens. A group of seats has nothing to read —
   *  every row says the same thing — so it states how many it wants and keeps
   *  them behind the chevron until someone asks. */
  collapsed?: boolean
  /** The four shares the degree row reads at a glance. Filled in from
   *  `auditStanding()` rather than written down. */
  bar?: { taken: number; inProgress: number; claimed: number; total: number }
  pgpa?: string
  children: AuditEntry[]
}

/** A non-course requirement: something the degree asks you to do rather than
 *  to take. It has no code, no credits and no grade — only whether it has been
 *  done — so it carries a flag beside its mark and nothing on the right but
 *  when it happened. */
export type AuditMilestone = {
  kind: "milestone"
  id: string
  name: string
  mark: AuditMark
  /** When it was signed off, where it has been. */
  result?: string
}

export type AuditEntry = AuditGroup | AuditCourse | AuditMilestone

/* ------------------------------------------------------------------ student */

export const AUDIT_STUDENT = {
  name: STUDENT.name,
  username: STUDENT.username,
  email: `${STUDENT.username}@stellic.com`,
  /** The same two letters the plan header names him by. Kept as the fallback
   *  for anywhere the photo has not loaded. */
  initials: "SA",
  /** His own face, which is what a record of a person should lead with. */
  photo: "/scott-abott.jpg",
  /** Started Fall 2025 and partway through his second year. */
  standing: "Sophomore",
  program: `${DEGREE.program} (${DEGREE.concentration})`,
  pathway: "Business Administration: Fall Start 2025",
  campus: "Main campus",
  /** Entry year, written the way the registrar writes it: EY 2025 Fall. */
  entry: "2025 Fall",
  level: "Undergrad",
  /** The advisor the plan's review requests go to. */
  advisor: { name: "Mark Stehlik", initials: "MS", others: 1 },
  /* How much of Stellic this student is actually using — not a grade. One
     figure, drawn the same way on the record and in the search that finds it,
     so the two can never disagree. */
  engage: { bolts: 5, lit: 3, term: "Fall '26", termGpa: "3.42", cgpa: "3.38" },
  interests: [],
}

/** The term under way, and the classes in it — Fall 2026, which is the term
 *  the planner opens on. */
export const CURRENT_TERM = {
  name: "Fall 2026",
  credits: 15,
  courses: ["FIN 301", "ACCT 202", "ECON 202", "STAT 210", "MKTG 201"],
}

export const AUDIT_TABS = [
  { id: "progress", label: "Progress" },
  { id: "plans", label: "Plans" },
  { id: "courses", label: "Courses" },
  { id: "notes", label: "Notes" },
  { id: "requests", label: "Requests", count: 1 },
]

export const AUDIT_SCOPES = ["Full Audit", "Unmet Requirements", "Additional Checks"]

export const LAST_COMPUTED = "Last computed 8 days ago"

/* -------------------------------------------------------------------- audit */

let seq = 0

function course(
  code: string,
  name: string,
  mark: AuditMark,
  result?: string,
  grade?: string
): AuditCourse {
  /* Two elective seats read exactly alike, so the row needs an identity of its
     own rather than borrowing its course's. */
  return { kind: "course", id: `c${++seq}`, code, name, credits: 3, mark, result, grade }
}

/* The credential heads the tree and the program hangs off it — the thing that
 * gets conferred, then the thing being studied to earn it. They are two rows
 * because they are two facts: the credential carries what the whole degree
 * asks for and how far along it is, and the program carries which catalogue it
 * is being read against and what it has earned so far. */
/** Milestones live where the thing they are about lives, which means down in
 *  the tree rather than gathered at the top of it. Nobody looks for "declare a
 *  concentration" anywhere but under the core that asks for it. */
function milestone(name: string, mark: AuditMark, result?: string): AuditMilestone {
  return { kind: "milestone", id: `m${++seq}`, name, mark, result }
}

const TREE: AuditGroup = {
  kind: "group",
  id: "credential",
  level: "degree",
  name: DEGREE.credential,
  tags: [`fulfill all | at least ${DEGREE.credits} credits`],
  children: [
    {
      kind: "group",
      id: "bsba",
      level: "program",
      /* Named without the credential, which the row above it states. */
      name: DEGREE.major,
      mark: "remaining",
      subtitle: "Applied Version: Fall 2025 to present · Catalog Term: Fall 2025",
      tags: ["fulfill all"],
      pgpa: "PGPA 3.38",
      children: [
    {
      kind: "group",
      id: "general-education",
      level: "requirement",
      name: "General Education",
      mark: "in-progress",
      tags: ["fulfill all"],
      children: [
        course("ENGL 101", "Composition I", "taken", "Taken in Fall '25", "A-"),
        course("HIST 110", "World Civilizations", "taken", "Taken in Fall '25", "B+"),
        course("PSYC 101", "Introduction to Psychology", "taken", "Taken in Fall '25", "A"),
        course("ART 105", "Visual Culture", "taken", "Taken in Spring '26", "B"),
        course("COMM 230", "Public Speaking", "taken", "Taken in Spring '26", "A-"),
        course("ENGL 210", "Advanced Composition", "remaining"),
        course("PHIL 240", "Business Ethics", "remaining"),
        course("HIST 205", "Modern World History", "remaining"),
      ],
    },
    {
      kind: "group",
      id: "business-core",
      level: "requirement",
      name: "Business Core",
      mark: "in-progress",
      tags: ["fulfill all"],
      children: [
        course("BUS 101", "Introduction to Business", "taken", "Taken in Fall '25", "A"),
        course("MATH 140", "Business Calculus", "taken", "Taken in Fall '25", "B"),
        course("ACCT 201", "Financial Accounting", "taken", "Taken in Spring '26", "A-"),
        course("ECON 201", "Principles of Microeconomics", "taken", "Taken in Spring '26", "B+"),
        course("MIS 120", "Business Technology Essentials", "taken", "Taken in Spring '26", "A"),
        milestone("Declare a concentration", "taken", "Signed off Spring '26"),
        course("ACCT 202", "Managerial Accounting", "in-progress", "In progress · Fall '26"),
        course("ECON 202", "Principles of Macroeconomics", "in-progress", "In progress · Fall '26"),
        course("STAT 210", "Business Statistics", "in-progress", "In progress · Fall '26"),
        course("MKTG 201", "Principles of Marketing", "in-progress", "In progress · Fall '26"),
        course("MGMT 210", "Principles of Management", "remaining"),
        course("ACCT 310", "Intermediate Accounting I", "remaining"),
        course("MIS 250", "Management Information Systems", "remaining"),
        course("BLAW 301", "Business Law & Ethics", "remaining"),
        course("OPS 320", "Operations & Supply Chain Management", "remaining"),
        course("BUS 390", "Business Communication", "remaining"),
      ],
    },
    {
      kind: "group",
      id: "declared-concentration",
      level: "requirement",
      name: "Complete your declared concentration",
      mark: "in-progress",
      tags: ["fulfill any"],
      children: [
        {
          kind: "group",
          id: "finance-declared",
          level: "requirement",
          name: "Finance",
          mark: "in-progress",
          tags: ["declared · fulfill all"],
          children: [
            {
              kind: "group",
              id: "finance-core",
              level: "requirement",
              name: "Finance Core",
              mark: "in-progress",
              tags: ["fulfill all"],
              children: [
                course("FIN 301", "Corporate Finance", "in-progress", "In progress · Fall '26"),
                course(
                  "FIN 340",
                  "Investments & Portfolio Management",
                  "registered",
                  "Registered · Spring '27"
                ),
                course("ECON 310", "Money & Banking", "remaining"),
                course("FIN 350", "Financial Institutions & Markets", "remaining"),
                course("FIN 415", "Financial Modeling & Valuation", "remaining"),
                course("STAT 320", "Econometrics for Business", "remaining"),
              ],
            },
            {
              kind: "group",
              id: "finance-advanced",
              level: "requirement",
              name: "Finance Advanced",
              mark: "remaining",
              tags: ["at least 15 credits"],
              children: [
                course("FIN 420", "Derivatives & Risk Management", "remaining"),
                course("FIN 430", "International Finance", "remaining"),
                course("FIN 445", "Real Estate Finance", "remaining"),
                course("FIN 460", "Mergers & Acquisitions", "remaining"),
                course("FIN 470", "Fixed Income Analysis", "remaining"),
              ],
            },
            {
              kind: "group",
              id: "finance-electives",
              level: "requirement",
              name: "Finance Electives",
              mark: "planned",
              tags: ["at least 6 credits"],
              collapsed: true,
              children: [
                /* A seat, not a course: the requirement is settled and
                   which course answers it is not, so the code column is
                   empty until one is chosen. */
                course("", "Finance elective", "planned", "Planned · Spring '27"),
                course("", "Finance elective", "remaining"),
              ],
            },
          ],
        },
        {
          kind: "group",
          id: "marketing",
          level: "requirement",
          name: "Marketing",
          mark: "optional",
          tags: ["not needed"],
          children: [],
        },
        {
          kind: "group",
          id: "operations",
          level: "requirement",
          name: "Operations Management",
          mark: "optional",
          tags: ["not needed"],
          children: [],
        },
      ],
    },
    {
      kind: "group",
      id: "open-electives",
      level: "requirement",
      name: "Open Electives",
      mark: "remaining",
      tags: ["at least 9 credits"],
      collapsed: true,
      children: [
        course("", "General elective", "remaining"),
        course("", "General elective", "remaining"),
        course("", "General elective", "remaining"),
      ],
    },
    {
      kind: "group",
      id: "capstone",
      level: "requirement",
      name: "Capstone",
      mark: "remaining",
      tags: ["fulfill all · taken last"],
      children: [
        course("BUS 495", "Strategic Management", "remaining"),
        milestone("Capstone proposal approved", "remaining"),
        milestone("Complete capstone thesis", "remaining"),
      ],
    },
    {
      kind: "group",
      id: "residency",
      level: "requirement",
      name: "Complete 30 of the last 36 credits on the main campus",
      mark: "in-progress",
      restated: true,
      tags: ["at least 30 credits", "Additional Check"],
      children: [
        course("ACCT 201", "Financial Accounting", "taken", "Taken in Spring '26", "A-"),
        course("ECON 201", "Principles of Microeconomics", "taken", "Taken in Spring '26", "B+"),
        course("MIS 120", "Business Technology Essentials", "taken", "Taken in Spring '26", "A"),
        milestone("Declare a concentration", "taken", "Signed off Spring '26"),
        course("FIN 301", "Corporate Finance", "in-progress", "In progress · Fall '26"),
      ],
    },
    {
      kind: "group",
      id: "total-credits",
      level: "requirement",
      name: `${DEGREE.credits} Total Credits`,
      mark: "in-progress",
      restated: true,
      tags: [`at least ${DEGREE.credits} credits`, "Additional Check"],
      children: [
        course("BUS 101", "Introduction to Business", "taken", "Taken in Fall '25", "A"),
        course("MATH 140", "Business Calculus", "taken", "Taken in Fall '25", "B"),
        course("ENGL 101", "Composition I", "taken", "Taken in Fall '25", "A-"),
        course("ACCT 201", "Financial Accounting", "taken", "Taken in Spring '26", "A-"),
        course("COMM 230", "Public Speaking", "taken", "Taken in Spring '26", "A-"),
        course("FIN 301", "Corporate Finance", "in-progress", "In progress · Fall '26"),
        course("FIN 340", "Investments & Portfolio Management", "registered", "Registered · Spring '27"),
      ],
    },
      ],
    },
  ],
}

/* ----------------------------------------------------------------- tallies */

/** What the tree says, counted off the tree. A requirement is one course, as
 *  it is in the plan, so this counts rows rather than credits — and the bar
 *  above the audit cannot say anything the audit does not.
 *
 *  Additional checks are stepped over: they re-list courses counted already,
 *  so walking into them would count the same course twice. */
export function auditStanding(audit: AuditGroup) {
  const marks: AuditMark[] = []

  const walk = (entry: AuditEntry) => {
    if (entry.kind === "course") return marks.push(entry.mark)
    /* A milestone is not a course. The bar measures what the degree wants
       taken, and counting a thesis among them would make forty forty-three. */
    if (entry.kind === "milestone") return
    if (entry.restated) return
    entry.children.forEach(walk)
  }
  walk(audit)

  const count = (...of: AuditMark[]) => marks.filter((mark) => of.includes(mark)).length

  return {
    taken: count("taken"),
    inProgress: count("in-progress"),
    /* Registered and planned are not earned yet, so on a bar about what the
       degree still wants they sit with the rest of what it wants. */
    remaining: count("registered", "planned", "remaining"),
    /* What the plan has claimed but not yet earned, which is the whole of the
       difference between the official audit and the planned one. */
    claimed: count("registered", "planned"),
  }
}

/** The milestones the tree holds, counted off the tree — so the flag on the
 *  credential row and the meter on the profile card can never disagree with
 *  what is actually in the audit. */
export function milestoneStanding(audit: AuditGroup) {
  let done = 0
  let total = 0

  const walk = (entry: AuditEntry) => {
    if (entry.kind === "course") return
    if (entry.kind === "milestone") {
      total += 1
      if (entry.mark === "taken") done += 1
      return
    }
    if (entry.restated) return
    entry.children.forEach(walk)
  }
  walk(audit)

  return { done, total }
}

const STANDING = auditStanding(TREE)
const MILESTONES = milestoneStanding(TREE)

export const AUDIT: AuditGroup = {
  ...TREE,
  bar: {
    taken: STANDING.taken,
    inProgress: STANDING.inProgress,
    claimed: STANDING.claimed,
    total: DEGREE.requirements,
  },
  /* Both counted off the tree, so neither can say anything the audit cannot
     show: the requirements still wanted, and the milestones still to do. */
  counts: { requirements: STANDING.remaining, milestones: MILESTONES.total - MILESTONES.done },
}

export const OFFICIAL_PROGRESS = {
  courses: STANDING,
  milestones: MILESTONES,
}

/** Both toggles read the same tree — there is no second audit to compute yet —
 *  so Planned differs from Official only by counting what the plan has claimed
 *  and the registrar has not yet seen. */
export const AUDIT_VIEWS = [
  {
    id: "official",
    label: "Official",
    bar: { taken: STANDING.taken, inProgress: STANDING.inProgress, planned: 0 },
  },
  {
    id: "planned",
    label: "Planned",
    bar: {
      taken: STANDING.taken,
      inProgress: STANDING.inProgress,
      planned: STANDING.claimed,
    },
  },
]

export const AUDIT_TOTAL = DEGREE.requirements

/** The dual-enrolment terms the student came in with: real credit — twelve of
 *  it — that the degree asked for none of, which is why it is what the
 *  unmatched section opens on. The plan prototypes hold the same four courses
 *  above their first year for the same reason.
 *
 *  How many of them are unmatched is not written here. That depends on what is
 *  on screen, so `unmatchedAgainst()` answers it. */
export const UNMATCHED_BLURB =
  "These courses are in plan, but are not fulfilling any requirement"

export const DUAL_ENROLMENT = {
  courses: [
    course("MATH 110", "College Algebra", "taken", "Taken in Fall '24", "A"),
    course("ENGL 100", "Academic Writing Basics", "taken", "Taken in Fall '24", "A-"),
    course("HIST 101", "United States History I", "taken", "Taken in Spring '25", "B+"),
    course("SPAN 101", "Elementary Spanish I", "taken", "Taken in Spring '25", "A"),
  ],
}

/* ------------------------------------------------- what the student holds */

/** Every course the student actually has, by code: taken, under way,
 *  registered or planned. A `remaining` row is a course the degree wants and
 *  the student has not got, so it is not a record of anything.
 *
 *  This is what another program is audited against — it is the transcript,
 *  and the whole question a what-if asks is what else it would satisfy. */
export const STUDENT_RECORD: Map<string, AuditCourse> = (() => {
  const held = new Map<string, AuditCourse>()

  const walk = (entry: AuditEntry) => {
    if (entry.kind === "course") {
      /* A seat has no code, and an empty string is not an identity: keyed on
         one, every seat in the audit would answer for every other. */
      if (entry.code && entry.mark !== "remaining" && !held.has(entry.code)) {
        held.set(entry.code, entry)
      }
      return
    }
    if (entry.kind === "milestone") return
    entry.children.forEach(walk)
  }
  walk(TREE)
  /* The unmatched courses are held too. The degree has no use for them, which
     is exactly why they are worth offering to another one. */
  DUAL_ENROLMENT.courses.forEach((course) => held.set(course.code, course))

  return held
})()

/** The codes that are actually counting toward the degree on screen. A course
 *  here that also counts toward a second program is double counting; one of
 *  the unmatched courses is not, because it was counting toward nothing. */
export const COUNTING_NOW: Set<string> = (() => {
  const counting = new Set<string>()

  const walk = (entry: AuditEntry) => {
    if (entry.kind === "course") {
      if (entry.code && entry.mark !== "remaining") counting.add(entry.code)
      return
    }
    if (entry.kind === "milestone") return
    /* An additional check never makes a course double count — it consumes
       nothing, which is the point of it. */
    if (entry.restated) return
    entry.children.forEach(walk)
  }
  walk(TREE)

  return counting
})()

/** What no program on screen has a use for. The degree's own unmatched list is
 *  this same question asked of the degree alone — so once a what-if puts a
 *  second program up, or swaps the degree out, the answer has to be asked
 *  again: an Economics B.A. wants the Spanish the business degree ignored, and
 *  wants nothing to do with the finance courses it prized.
 *
 *  An additional check is stepped over. It consumes nothing, so a course it
 *  lists is not thereby spoken for. */
export function unmatchedAgainst(trees: AuditGroup[]): AuditCourse[] {
  const claimed = new Set<string>()

  const walk = (entry: AuditEntry) => {
    if (entry.kind === "course") {
      if (entry.code && entry.mark !== "remaining") claimed.add(entry.code)
      return
    }
    if (entry.kind === "milestone") return
    if (entry.restated) return
    entry.children.forEach(walk)
  }
  trees.forEach(walk)

  return [...STUDENT_RECORD.values()].filter((course) => !claimed.has(course.code))
}
