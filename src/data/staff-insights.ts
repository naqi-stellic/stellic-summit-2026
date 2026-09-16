import type { PersonaKey } from "@/data/staff-home"

/* Insights: the work nobody assigned you.
 *
 * Open Items is what somebody sent you. This is what Stellic noticed on its own
 * in the audits you are allowed to change — a course that retired while a
 * requirement still asks for it, a rule that contradicts another one, or a
 * pattern in the exceptions people keep approving that the audit should simply
 * say out loud. Every item carries a suggested fix, because a finding without
 * one is a complaint.
 *
 * Findings bundle under the program they are about rather than arriving as a
 * flat list: a program with ten problems is one decision — open it and work
 * through them — not ten. */

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
  code: string
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
    program: "BEng in Mechanical Engineering",
    code: "BENG-ME",
    version: "EY2024",
    students: 210,
    published: "Sep 2024",
    iso: "2024-09-10",
    vis: ["marcus"],
    items: [
      {
        severity: "crit",
        source: "audit",
        message: "ME 4990 is retired but still required",
        requirement: "Capstone Sequence",
        fix: "Replace with ME 4995, its listed successor.",
      },
      {
        severity: "crit",
        source: "audit",
        message: "THERMO 3200 is required twice without credit sharing",
        requirement: "Core Engineering",
        fix: "Allow credit sharing, or drop one instance.",
      },
      {
        severity: "crit",
        source: "audit",
        message: "ME 3110 requires ME 3120, which requires ME 3110",
        requirement: "Mechanics Core",
        fix: "Correct the prerequisite chain.",
      },
      {
        severity: "crit",
        source: "audit",
        message: "Minimum credits (132) exceed what the listed courses can total (128)",
        requirement: "Degree Total",
        fix: "Lower the minimum or add eligible courses.",
      },
      {
        severity: "crit",
        source: "audit",
        message: "“Choose 2 of 4” lists 2 courses merged in 2023",
        requirement: "Design Electives",
        fix: "Update to the merged course, ME 4410.",
      },
      {
        severity: "crit",
        source: "audit",
        message: "Lab requirement points at an archived requirement group",
        requirement: "Laboratory Sequence",
        fix: "Re-link to the active group.",
      },
      {
        severity: "crit",
        source: "audit",
        message: "MATH 2210 is required but excluded by the same requirement's course filter",
        requirement: "Engineering Math",
        fix: "Remove the exclusion or the requirement.",
      },
      {
        severity: "crit",
        source: "audit",
        message: "Co-op milestone requires a term that no longer exists",
        requirement: "Co-op",
        fix: "Map it to the renamed Work Term 3.",
      },
      {
        severity: "crit",
        source: "audit",
        message: "Senior-standing rule blocks the only term ME 4820 is offered",
        requirement: "Advanced Electives",
        fix: "Relax the standing rule for ME 4820.",
      },
      {
        severity: "crit",
        source: "audit",
        message: "Transfer credit cap of 0 contradicts the program's articulation policy",
        requirement: "Transfer Policy",
        fix: "Set the cap to 60, per policy.",
      },
      {
        severity: "warn",
        source: "audit",
        message: "Requirement note references the 2019 handbook",
        requirement: "Program Notes",
        fix: "Update the reference.",
      },
      {
        severity: "warn",
        source: "audit",
        message: "14 students double-count credits toward a minor",
        requirement: "Breadth",
        fix: "Confirm double counting is intended.",
      },
    ],
  },
  {
    id: "biol",
    program: "BS in Biology",
    code: "BS-BIOL",
    version: "EY2025",
    students: 142,
    published: "Jan 12",
    iso: "2026-01-12",
    vis: ["marcus"],
    items: [
      {
        severity: "crit",
        source: "audit",
        message: "BIOL 3120 is retired but still required",
        requirement: "Physiology",
        fix: "Replace with BIOL 3125, its listed successor.",
      },
      {
        severity: "crit",
        source: "audit",
        message: "BIOL 2200 is required twice without credit sharing",
        requirement: "Foundation Sciences",
        fix: "Allow credit sharing, or drop one instance.",
      },
      {
        severity: "warn",
        source: "audit",
        message: "“Choose 1 of 3” lists 2 courses not offered since 2024",
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
    program: "BA in Political Science",
    code: "BA-POLSCI",
    version: "EY2025",
    students: 96,
    published: "Mar 3",
    iso: "2026-03-03",
    vis: ["marcus"],
    items: [
      {
        severity: "crit",
        source: "audit",
        message: "Cross-listed POLS 3410 / HIST 3410 makes “3 of 6” unreachable",
        requirement: "Regional Studies",
        fix: "De-duplicate the cross-listing.",
      },
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
    program: "BS in Computer Science",
    code: "BS-CS",
    version: "EY2026",
    students: 388,
    published: "Jul 28",
    iso: "2026-07-28",
    vis: ["marcus"],
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
        message: "Capstone requires senior standing but no credit floor",
        requirement: "Capstone",
        fix: "Add a minimum-credits condition (90+).",
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
    program: "MS in Environmental Engineering",
    code: "MS-ENVE",
    version: "EY2026",
    students: 41,
    published: "Jun 19",
    iso: "2026-06-19",
    vis: ["marcus"],
    items: [
      {
        severity: "warn",
        source: "audit",
        message: "Thesis Track points at an archived approval workflow",
        requirement: "Thesis Track",
        fix: "Point the rule at the active “Thesis Approval” workflow.",
      },
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
    program: "BFA in Graphic Design",
    code: "BFA-GD",
    version: "EY2026",
    students: 58,
    published: "Jul 2",
    iso: "2026-07-02",
    vis: ["marcus"],
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
    program: "BBA in Business Administration",
    code: "BBA-BUS",
    version: "EY2026",
    students: 176,
    published: "May 8",
    iso: "2026-05-08",
    vis: ["marcus"],
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

/** A catalogue-level finding that belongs to no program: an incoming course
 *  staff have articulated by hand often enough that it should be a rule. */
export type Articulation = {
  id: string
  /** The incoming course, which is what the row is about. */
  from: string
  institution: string
  /** The home course to map it onto — Stellic's suggestion, not a fact. */
  suggestion: string
  /** How much work the rule would take off the desk. */
  impact: string
  pending: number
  iso: string
  vis: PersonaKey[]
}

export const ARTICULATIONS: Articulation[] = [
  {
    id: "eq1",
    from: "21-1200: Calculus I",
    institution: "Seneca College",
    suggestion: "21-1200: Calculus I",
    impact: "38 pending articulations",
    pending: 38,
    iso: "2026-08-04",
    vis: ["jessica"],
  },
  {
    id: "eq2",
    from: "21-2445: Biology I",
    institution: "Seneca College",
    suggestion: "32-1100: Foundations of Biology",
    impact: "24 pending articulations",
    pending: 24,
    iso: "2026-08-03",
    vis: ["jessica"],
  },
  {
    id: "eq3",
    from: "PSY-837: Intro to Psychology",
    institution: "Conestoga College",
    suggestion: "43-1000: Intro to Psychology",
    impact: "17 pending articulations",
    pending: 17,
    iso: "2026-08-01",
    vis: ["jessica"],
  },
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
  if (q.sort === "name") return [...shown].sort((a, b) => a.from.localeCompare(b.from))
  return [...shown].sort((a, b) => b.pending - a.pending)
}
