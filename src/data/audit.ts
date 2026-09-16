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
  /** "Taken in Fall '26", "In progress · Fall '27" — empty on a line the audit
   *  is only holding a place for. */
  result?: string
  grade?: string
}

/** A requirement: a named thing the degree asks for, holding courses or
 *  further requirements. The degree is the same shape — what changes is how
 *  the row is drawn, which is `level`. */
export type AuditGroup = {
  kind: "group"
  id: string
  name: string
  /** The degree heads the tree and carries no ground; everything under it is
   *  a `requirement` and sits on one. */
  level: "degree" | "requirement"
  mark?: AuditMark
  /** The red counts on the degree row: requirements outstanding, then
   *  milestones. A flag marks the second. */
  counts?: { requirements: number; milestones: number }
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

export type AuditEntry = AuditGroup | AuditCourse

/* ------------------------------------------------------------------ student */

export const AUDIT_STUDENT = {
  name: STUDENT.name,
  username: STUDENT.username,
  email: `${STUDENT.username}@stellic.com`,
  /** The same two letters the plan header names him by. */
  initials: "SA",
  /** Started Fall 2026 and partway through his second year. */
  standing: "Sophomore",
  program: `${DEGREE.program} (${DEGREE.concentration})`,
  pathway: "Business Administration: Fall Start 2026",
  campus: "Main campus",
  /** Entry year, written the way the registrar writes it: EY 2026 Fall. */
  entry: "2026 Fall",
  level: "Undergrad",
  /** The advisor the plan's review requests go to. */
  advisor: { name: "Mark Stehlik", initials: "MS", others: 1 },
  engage: { stars: 5, term: "Fall '27", termGpa: "3.42", cgpa: "3.38" },
  interests: [],
}

/** The term under way, and the classes in it — Fall 2027, which is the term
 *  the planner opens on. */
export const CURRENT_TERM = {
  name: "Fall 2027",
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

const TREE: AuditGroup = {
  kind: "group",
  id: "bsba",
  level: "degree",
  name: DEGREE.program,
  subtitle: "Applied Version: Fall 2026 to present · Catalog Term: Fall 2026",
  tags: [`fulfill all | at least ${DEGREE.credits} credits`],
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
        course("ENGL 101", "Composition I", "taken", "Taken in Fall '26", "A-"),
        course("HIST 110", "World Civilizations", "taken", "Taken in Fall '26", "B+"),
        course("PSYC 101", "Introduction to Psychology", "taken", "Taken in Fall '26", "A"),
        course("ART 105", "Visual Culture", "taken", "Taken in Spring '27", "B"),
        course("COMM 230", "Public Speaking", "taken", "Taken in Spring '27", "A-"),
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
        course("BUS 101", "Introduction to Business", "taken", "Taken in Fall '26", "A"),
        course("MATH 140", "Business Calculus", "taken", "Taken in Fall '26", "B"),
        course("ACCT 201", "Financial Accounting", "taken", "Taken in Spring '27", "A-"),
        course("ECON 201", "Principles of Microeconomics", "taken", "Taken in Spring '27", "B+"),
        course("MIS 120", "Business Technology Essentials", "taken", "Taken in Spring '27", "A"),
        course("ACCT 202", "Managerial Accounting", "in-progress", "In progress · Fall '27"),
        course("ECON 202", "Principles of Macroeconomics", "in-progress", "In progress · Fall '27"),
        course("STAT 210", "Business Statistics", "in-progress", "In progress · Fall '27"),
        course("MKTG 201", "Principles of Marketing", "in-progress", "In progress · Fall '27"),
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
                course("FIN 301", "Corporate Finance", "in-progress", "In progress · Fall '27"),
                course(
                  "FIN 340",
                  "Investments & Portfolio Management",
                  "registered",
                  "Registered · Spring '28"
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
                course("", "Finance elective", "planned", "Planned · Spring '28"),
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
      children: [course("BUS 495", "Strategic Management", "remaining")],
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
        course("ACCT 201", "Financial Accounting", "taken", "Taken in Spring '27", "A-"),
        course("ECON 201", "Principles of Microeconomics", "taken", "Taken in Spring '27", "B+"),
        course("MIS 120", "Business Technology Essentials", "taken", "Taken in Spring '27", "A"),
        course("FIN 301", "Corporate Finance", "in-progress", "In progress · Fall '27"),
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
        course("BUS 101", "Introduction to Business", "taken", "Taken in Fall '26", "A"),
        course("MATH 140", "Business Calculus", "taken", "Taken in Fall '26", "B"),
        course("ENGL 101", "Composition I", "taken", "Taken in Fall '26", "A-"),
        course("ACCT 201", "Financial Accounting", "taken", "Taken in Spring '27", "A-"),
        course("COMM 230", "Public Speaking", "taken", "Taken in Spring '27", "A-"),
        course("FIN 301", "Corporate Finance", "in-progress", "In progress · Fall '27"),
        course("FIN 340", "Investments & Portfolio Management", "registered", "Registered · Spring '28"),
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

const STANDING = auditStanding(TREE)

export const AUDIT: AuditGroup = {
  ...TREE,
  bar: {
    taken: STANDING.taken,
    inProgress: STANDING.inProgress,
    claimed: STANDING.claimed,
    total: DEGREE.requirements,
  },
  counts: {
    requirements: STANDING.remaining,
    milestones: DEGREE.milestones - DEGREE.milestonesDone,
  },
}

export const OFFICIAL_PROGRESS = {
  courses: STANDING,
  milestones: { done: DEGREE.milestonesDone, total: DEGREE.milestones },
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

/** The dual-enrolment terms the student came in with. Real credit — twelve of
 *  it — that the degree asked for none of, which is exactly what the unmatched
 *  section is for. The plan prototypes hold the same four courses above their
 *  first year for the same reason. */
export const UNMATCHED = {
  count: 4,
  blurb: "These courses are in plan, but are not fulfilling any requirement",
  courses: [
    course("MATH 110", "College Algebra", "taken", "Taken in Fall '24", "A"),
    course("ENGL 100", "Academic Writing Basics", "taken", "Taken in Fall '24", "A-"),
    course("HIST 101", "United States History I", "taken", "Taken in Spring '25", "B+"),
    course("SPAN 101", "Elementary Spanish I", "taken", "Taken in Spring '25", "A"),
  ],
}
