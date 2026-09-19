import type { PersonaKey } from "@/data/staff-home"

/* Insights: the work nobody assigned you.
 *
 * Open Items is what somebody sent you. This is what Stellic noticed on its own
 * in the audits you are allowed to change — a course that went inactive while a
 * requirement still asks for it, a rule that contradicts another one, or a
 * pattern in the exceptions people keep approving that the audit should simply
 * say out loud. Every item carries a suggested fix, because a finding without
 * one is a complaint.
 *
 * Findings bundle under the program they are about rather than arriving as a
 * flat list: a program with ten problems is one decision — open it and work
 * through them — not ten.
 *
 * And there are few of them, which took some doing. A list where thirteen
 * findings are critical is a list where none of them are: the reader stops
 * reading the badge and starts skimming, which is the opposite of what a
 * severity is for. Two programs' worth of real problems, said once each. */

/** How bad it is, and the three questions that decide which:
 *
 *  - `crit` — **no student in this program can complete the degree.** A credit
 *    minimum nothing can reach, a prerequisite that refers back to itself.
 *    Somebody has to fix it before anyone graduates.
 *  - `warn` — **the audit evaluates correctly and something downstream does
 *    not.** An inactive course still counts on the audit; students just cannot
 *    find it when planning. Nobody is blocked, somebody is inconvenienced.
 *  - `opp` — **nothing is broken.** The audit could do work that staff are
 *    currently doing by hand, one approved exception at a time.
 *
 *  Written down because the alternative is deciding it per row, and a severity
 *  decided per row is a severity nobody can predict. */
export type Severity = "crit" | "warn" | "opp"

/** Where the finding came from. The audit's own checker, or the pattern in
 *  what staff keep approving by hand. */
export type InsightSource = "audit" | "exceptions"

export type InsightItem = {
  id: string
  severity: Severity
  source: InsightSource
  /** A figure the sentence leads with, set in bold: "9 of 11". */
  count?: string
  message: string
  /** Which requirement it is about. */
  requirement: string
  /** Who it reaches, on an opportunity. A problem's impact is its severity. */
  impact?: string
  /** What to do. Specific enough to act on without opening anything. */
  fix: string
}

export type InsightProgram = {
  id: string
  program: string
  version: string
  students: number
  published: string
  iso: string
  /** Who may edit this program, which is who is shown its findings. */
  vis: PersonaKey[]
  items: InsightItem[]
}

/** Item ids are positional, so the data does not have to carry an id that
 *  means nothing to a reader and can fall out of step with the list. */
type RawProgram = Omit<InsightProgram, "items"> & { items: Omit<InsightItem, "id">[] }

const withIds = (programs: RawProgram[]): InsightProgram[] =>
  programs.map((program) => ({
    ...program,
    items: program.items.map((item, i) => ({ ...item, id: `${program.id}-${i}` })),
  }))

export const INSIGHT_PROGRAMS: InsightProgram[] = withIds([
  {
    id: "me",
    program: "Mechanical Engineering, B.Eng.",
    version: "EY2024",
    students: 210,
    published: "Sep 2024",
    iso: "2024-09-10",
    vis: ["mark"],
    items: [
      /* The two criticals on the page, and the only two. Both of them are the
         same shape: a rule that cannot be satisfied by anybody, ever, which is
         the bar the severity is set at. */
      {
        severity: "crit",
        source: "audit",
        message: "Minimum credits (132) exceed what the listed courses can total (128)",
        requirement: "Degree Total",
        fix: "Lower the minimum to 128 or add eligible courses — as written, no student can reach it.",
      },
      {
        severity: "crit",
        source: "audit",
        message: "ME 3110 requires ME 3120, which requires ME 3110",
        requirement: "Mechanics Core",
        fix: "Correct the prerequisite chain — as written, neither course can ever be taken.",
      },
      /* Not critical, and the reason is worth reading: an inactive course still
         loads against an audit requirement. The audit is right. What breaks is
         further down — the course is not searchable, so a student planning
         their capstone term cannot find the thing their degree is asking for. */
      {
        severity: "warn",
        source: "audit",
        message: "ME 4990 is inactive but still required",
        requirement: "Capstone Sequence",
        fix: "Replace with ME 4995. An inactive course still evaluates on the audit, but students cannot find it when planning.",
      },
      {
        severity: "warn",
        source: "audit",
        message: "Senior-standing rule blocks the only term ME 4820 is offered",
        requirement: "Advanced Electives",
        fix: "Relax the standing rule for ME 4820.",
      },
    ],
  },
  {
    id: "biol",
    program: "Biology, B.S.",
    version: "EY2025",
    students: 142,
    published: "Jan 12",
    iso: "2026-01-12",
    vis: ["mark"],
    items: [
      {
        severity: "warn",
        source: "audit",
        message: "“Choose 1 of 3” lists 2 courses with no offering terms since 2024",
        requirement: "Advanced Electives",
        fix: "Swap BIOL 3310 and BIOL 3340 for current offerings.",
      },
      {
        severity: "warn",
        source: "audit",
        message: "42 students double-count credits toward a minor",
        requirement: "Life Sciences",
        fix: "Confirm double counting is intended.",
      },
      {
        severity: "opp",
        source: "exceptions",
        count: "9 of 11",
        message: "waive requests approved",
        requirement: "Foundation Sciences",
        impact: "9 students",
        fix: "Make CHEM 2110 one-of-two with CHEM 2105.",
      },
      {
        severity: "opp",
        source: "audit",
        message: "Two requirements share the title “Electives”",
        requirement: "Electives",
        impact: "142 students",
        fix: "Rename one, e.g. “Biology Electives”.",
      },
    ],
  },
  {
    id: "polsci",
    program: "Political Science, B.A.",
    version: "EY2025",
    students: 96,
    published: "Mar 3",
    iso: "2026-03-03",
    vis: ["mark"],
    items: [
      {
        severity: "warn",
        source: "audit",
        message: "Counts a course that moved departments (POLS 2200 → GOVT 2200)",
        requirement: "Core Politics",
        fix: "Add GOVT 2200 as an equivalent.",
      },
    ],
  },
  {
    id: "cs",
    program: "Computer Science, B.S.",
    version: "EY2026",
    students: 388,
    published: "Jul 28",
    iso: "2026-07-28",
    vis: ["mark"],
    items: [
      {
        severity: "warn",
        source: "audit",
        message: "Math Electives lists MATH 3110 twice",
        requirement: "Math Electives",
        fix: "Remove the duplicate entry.",
      },
      {
        severity: "warn",
        source: "audit",
        message: "“Choose 2” has only 2 active courses",
        requirement: "Systems Electives",
        fix: "Add CS 4520 and CS 4610 (approved but unlisted).",
      },
      {
        severity: "opp",
        source: "exceptions",
        count: "12 of 14",
        message: "substitution requests approved",
        requirement: "Math Electives",
        impact: "35 students",
        fix: "Add MATH 2410 and STAT 2100 as listed alternatives.",
      },
      {
        severity: "opp",
        source: "audit",
        message: "Requirement note is 500+ characters and truncates on mobile",
        requirement: "Free Electives",
        impact: "388 students",
        fix: "Shorten the note.",
      },
    ],
  },
  {
    id: "enve",
    program: "Environmental Engineering, M.S.",
    version: "EY2026",
    students: 41,
    published: "Jun 19",
    iso: "2026-06-19",
    vis: ["mark"],
    items: [
      {
        severity: "warn",
        source: "audit",
        message: "Elective pool asks for 4 credits where every option is 3 credits",
        requirement: "Technical Electives",
        fix: "Set the requirement to 3 credits or add a 4-credit option.",
      },
    ],
  },
  {
    id: "bfa",
    program: "Graphic Design, B.F.A.",
    version: "EY2026",
    students: 58,
    published: "Jul 2",
    iso: "2026-07-02",
    vis: ["mark"],
    items: [
      {
        severity: "opp",
        source: "exceptions",
        count: "8 of 10",
        message: "credit-reduction requests approved",
        requirement: "Studio Electives",
        impact: "7 students",
        fix: "Lower the requirement from 24 to 21 credits to match approvals.",
      },
      {
        severity: "opp",
        source: "audit",
        message: "No rubric linked",
        requirement: "Portfolio Review",
        impact: "58 students",
        fix: "Attach the rubric so reviewers see the criteria.",
      },
    ],
  },
  {
    id: "bba",
    program: "Business Administration, B.B.A.",
    version: "EY2026",
    students: 176,
    published: "May 8",
    iso: "2026-05-08",
    vis: ["mark"],
    items: [
      {
        severity: "opp",
        source: "exceptions",
        count: "10 of 12",
        message: "substitution requests approved",
        requirement: "Global Electives",
        impact: "14 students",
        fix: "Add BUSI 3400 and ECON 3210 as listed alternatives.",
      },
    ],
  },
])

/* ============================================================ Articulations */

/** A course, written the way both columns of the equivalency form want it. */
export type Course = { code: string; name: string }

/** A home course Stellic proposes the incoming one should map onto, and the
 *  evidence it is proposing it from. Nothing here is decided — every one of
 *  them is offered with an Add and a Hide. */
export type Suggestion = Course & { because: string }

/* ---------------------------------------------------------------- lookup
   What the assistant finds when asked about an incoming course.

   Nobody here has Berkshire's catalogue. Somebody normally opens a tab, searches
   a college's site and reads a paragraph, which is the slow half of writing an
   equivalency — so the assistant goes and reads it, and shows its sources so
   the reading can be checked rather than trusted. */

export type CatalogMatch = {
  /** As the catalogue writes it: code and title together. */
  title: string
  school: string
  summary: string
  /** Where it was read. Shown because a description nobody can check is worth
   *  less than no description. */
  sources: string[]
}

/** What the assistant says it is doing while it does it. Five of them, one a
 *  second, because the work takes about that long and a progress bar that
 *  cannot say what it is waiting for says nothing. */
export const lookupSteps = (institution: string, code: string) => [
  "Finding catalog details…",
  `Locating ${institution}'s course catalog…`,
  `Searching the catalog for ${code}…`,
  "Matching the course code and title…",
  "Reading the course description…",
]

/** A catalogue-level finding that belongs to no program: an incoming course
 *  staff have articulated by hand often enough that it should be a rule. */
export type Articulation = {
  id: string
  /** The incoming course, which is what the row is about. */
  from: Course
  institution: string
  /** The one home course Stellic proposes it maps onto. The insight row names
   *  it and the equivalency form opens holding it — one suggestion, said once,
   *  in both places. */
  suggestion: Suggestion
  /** How much work the rule would take off the desk. */
  impact: string
  pending: number
  iso: string
  vis: PersonaKey[]
  /** What the assistant turns up when asked about the incoming course. One
   *  course in the source column, one course read out of the catalogue. */
  details: CatalogMatch
}

export const ARTICULATIONS: Articulation[] = [
  {
    id: "eq1",
    from: { code: "21-1200", name: "Calculus I" },
    institution: "Berkshire Community College",
    suggestion: {
      code: "31-1200",
      name: "Calculus I",
      because:
        "Matched to 31-1200 on 36 of the last 38 transfers from Berkshire Community College, every one of them approved.",
    },
    impact: "38 pending articulations",
    pending: 38,
    iso: "2026-08-04",
    vis: ["jessica"],
    details: {
      title: "21-1200: Calculus I",
      school: "Berkshire Community College",
      summary:
        "Limits, continuity, and the derivative, developed from first principles and applied to rates of change, curve sketching and optimisation. The term closes on the definite integral and the fundamental theorem. Six credit hours across lecture and tutorial, with a…",
      sources: ["catalog.berkshirecc.edu", "math.berkshirecc.edu"],
    },
  },
  {
    id: "eq2",
    from: { code: "21-2445", name: "Biology I" },
    institution: "Berkshire Community College",
    suggestion: {
      code: "32-1100",
      name: "Foundations of Biology",
      because:
        "Matched to 32-1100 on 22 of the last 24 transfers from Berkshire Community College. The other two were waived.",
    },
    impact: "24 pending articulations",
    pending: 24,
    iso: "2026-08-03",
    vis: ["jessica"],
    details: {
      title: "21-2445: Biology I",
      school: "Berkshire Community College",
      summary:
        "Cell structure and function, bioenergetics, molecular genetics and the principles of inheritance, taught alongside a weekly laboratory. Students practise microscopy, aseptic technique and experimental design, and keep a lab notebook assessed as part of the…",
      sources: ["catalog.berkshirecc.edu", "science.berkshirecc.edu"],
    },
  },
  {
    id: "eq3",
    from: { code: "PSY-837", name: "Intro to Psychology" },
    institution: "Conestoga College",
    suggestion: {
      code: "43-1000",
      name: "Intro to Psychology",
      because:
        "Matched to 43-1000 on all 17 transfers from Conestoga College since the 2024 catalogue.",
    },
    impact: "17 pending articulations",
    pending: 17,
    iso: "2026-08-01",
    vis: ["jessica"],
    details: {
      title: "PSY-837: Intro to Psychology",
      school: "Conestoga College",
      summary:
        "A survey of the discipline: biological bases of behaviour, sensation and perception, learning, memory, development, personality and psychological disorders. Assessment is by two term tests and a short paper on a peer-reviewed study of the student's…",
      sources: ["conestogac.on.ca/calendar"],
    },
  },
]

/* ---------------------------------------------------------------- the rule
   What a new equivalency is born with. They are the institution's defaults
   rather than this rule's answers, which is why the form states them and
   offers to change them rather than asking. */

export const RULE_DEFAULTS: [string, string][] = [
  ["Effective Dates", "Anytime in the past - Indefinite in the future"],
  ["Min / max grades", "A- to C"],
  ["Min / max credit", "3 to 6"],
  ["Courses must be taken within the last", "Any number of years"],
]

/** What a rule does to the articulations it creates. Pending is the default
 *  because a rule going live should not award credit before anyone has looked
 *  at what it swept up. */
export type ArticulationStatus = "pending" | "new" | "completed"

export const ARTICULATION_STATUS: { id: ArticulationStatus; label: string; detail: string }[] = [
  { id: "pending", label: "Pending", detail: "Held for review. No credit awarded, nothing on audit." },
  { id: "new", label: "New", detail: "Held for review, flagged as created by this rule." },
  { id: "completed", label: "Completed", detail: "Awards credit to the student." },
]

/* ============================================================ Reading it */

/** The insight tabs mirror the Open Items tabs — same topics, same order, and
 *  no "All" — so the two panels read as one page rather than as two products. */
export type InsightTab = "audit" | "exceptions" | "transfer"

export const INSIGHT_TAB_LABELS: Record<InsightTab, string> = {
  audit: "Audits",
  exceptions: "Exceptions",
  transfer: "Transfers",
}

/** Whether to show everything, only what is wrong, or only what could be
 *  better. Two different moods, and people arrive in one of them. */
export type Tier = "all" | "fix" | "opp"

export const TIERS: { id: Tier; label: string }[] = [
  { id: "all", label: "All" },
  { id: "fix", label: "Needs fixing" },
  { id: "opp", label: "Opportunities" },
]

export type InsightSort = "urgency" | "students" | "newest" | "name"

export const INSIGHT_SORTS: { id: InsightSort; label: string }[] = [
  { id: "urgency", label: "Urgency" },
  { id: "students", label: "Students impacted" },
  { id: "newest", label: "Newest" },
  { id: "name", label: "Program / course name" },
]

export const SEVERITY_RANK: Record<Severity, number> = { crit: 0, warn: 1, opp: 2 }

const tierOk = (severity: Severity, tier: Tier) =>
  tier === "all" || (tier === "fix" ? severity !== "opp" : severity === "opp")

const hay = (value: unknown) => JSON.stringify(value).toLowerCase()

export type InsightQuery = {
  tab: InsightTab
  tier: Tier
  sort: InsightSort
  query: string
  /** Which items this person has put away. Per-user: a dismissal is a reading
   *  decision, not a resolution, so it never leaves anyone else's list. */
  hidden: Set<string>
  /** Show the hidden ones instead of the live ones. */
  showHidden?: boolean
}

/** Programs with the items that pass, each carrying only those items. A program
 *  with nothing left to show drops out. */
export function matchPrograms(programs: InsightProgram[], q: InsightQuery) {
  const shown = programs
    .map((program) => ({
      ...program,
      shown: program.items.filter((item) => {
        const hidden = q.hidden.has(item.id)
        if (hidden !== !!q.showHidden) return false
        return item.source === q.tab && tierOk(item.severity, q.tier)
      }),
    }))
    .filter((program) => program.shown.length && (!q.query || hay(program).includes(q.query)))

  const count = (program: (typeof shown)[number], severity: Severity) =>
    program.shown.filter((item) => item.severity === severity).length

  if (q.sort === "students") return [...shown].sort((a, b) => b.students - a.students)
  if (q.sort === "newest") return [...shown].sort((a, b) => (a.iso < b.iso ? 1 : -1))
  if (q.sort === "name") return [...shown].sort((a, b) => a.program.localeCompare(b.program))

  /* Urgency reads down the severities in turn, then by how many students are
     standing behind the program. */
  return [...shown].sort(
    (a, b) =>
      count(b, "crit") - count(a, "crit") ||
      count(b, "warn") - count(a, "warn") ||
      count(b, "opp") - count(a, "opp") ||
      b.students - a.students
  )
}

/** Articulation rows live under Transfer only, and they are all opportunities,
 *  so "Needs fixing" empties the tab rather than filtering it. */
export function matchArticulations(rows: Articulation[], q: InsightQuery) {
  if (q.tab !== "transfer" || q.tier === "fix") return []

  const shown = rows.filter(
    (row) =>
      q.hidden.has(row.id) === !!q.showHidden && (!q.query || hay(row).includes(q.query))
  )

  if (q.sort === "newest") return [...shown].sort((a, b) => (a.iso < b.iso ? 1 : -1))
  if (q.sort === "name") return [...shown].sort((a, b) => a.from.code.localeCompare(b.from.code))
  return [...shown].sort((a, b) => b.pending - a.pending)
}
