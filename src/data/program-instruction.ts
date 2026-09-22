import { AUDIT, programUnder, type AuditGroup } from "@/data/audit"
import { DEGREE } from "@/data/plan"
import { ROSTER } from "@/data/students"
import {
  FILTER_GROUPS,
  PROGRAMS,
  fieldOptions,
  type FilterField,
  type Program,
  type ProgramKind,
} from "@/data/programs"

/* The catalogue as the registrar keeps it, rather than as a student reads it.
 *
 * Every other prototype asks what a program is worth to somebody. This one asks
 * what state it is in: which catalogue years it has an audit for, which of them
 * are live, and what is still a draft on somebody's desk. Same twenty-four
 * programs — the ones Advanced What-If offers and the ones a plan is run
 * against — read from the other side of the desk.
 *
 * Nothing here restates what the catalogue already says. A program's code, the
 * way its name is written on a card and the counts on its pills are all worked
 * out from the entry itself, so the page cannot drift from the thing it is
 * about. What is written down is only what the catalogue has no way of knowing:
 * which audits somebody has versioned back, and which drafts are open. */

/* The catalogue years. LIVE is what students are audited against today; NEXT is
   the one being built, which is where every draft on this page sits. */
const BACK = "2024–25"
const LIVE = "2025–26"
const NEXT = "2026–27"

export type AuditVersion = {
  name: string
  published: boolean
  /** When it last changed hands, and whose hands. A published version says
   *  when it was published; a draft says when it was last saved. */
  on: string
  by: string
  /** Readings of this audit kept as they stood on a date. A draft has none —
   *  nothing has been read against it yet. */
  snapshots: number
}

/** What somebody has done to a program's audit beyond the one version every
 *  program has. Written per program because it is the one fact about a
 *  catalogue entry that the entry itself cannot imply — a work log, not a rule.
 *
 *  Where the work is, is the point: the business programs carry the drafts,
 *  because the 2026–27 revision started with the college the planners' student
 *  is in. The fine arts entries have been at one version for two catalogues and
 *  are not pretending otherwise. */
type Work = {
  /** The audit was versioned back to the previous catalogue, for the students
   *  who entered under it. */
  back?: boolean
  /** Drafts open against the next catalogue. Named, because a draft nobody can
   *  name is a draft nobody is working on. */
  drafts?: string[]
}

const WORK: Record<string, Work> = {
  business: { back: true, drafts: [NEXT] },
  "computer-science-bs": { back: true, drafts: [NEXT] },
  "accounting-bs": { back: true, drafts: [NEXT] },
  "marketing-bs": { drafts: [NEXT] },
  "management-bs": { back: true, drafts: [NEXT] },
  "supply-chain-bs": { drafts: [NEXT] },
  "international-business-bs": { back: true },
  "economics-ba": { back: true, drafts: [NEXT] },
  "psychology-ba": { drafts: [NEXT] },
  "communication-ba": { back: true },
  "data-analytics-minor": { drafts: [NEXT] },
  "economics-minor": { back: true },
  "accounting-minor": { drafts: [NEXT] },
  "statistics-minor": { back: true, drafts: [NEXT] },
  "marketing-minor": { drafts: [NEXT] },
  "psychology-minor": { back: true },
  "project-management-certificate": { drafts: [NEXT] },
}

/** The sub-plans a program is read at. Three words for one idea, because the
 *  colleges that run them do not agree on which word it is — and a page that
 *  flattened them into "sub-plan" would be inventing a term the institution
 *  does not use. */
type Subplans = {
  label: "Concentration" | "Emphasis" | "Specialization"
  names: string[]
}

const SUBPLANS: Record<string, Subplans> = {
  business: {
    label: "Concentration",
    names: ["Finance", "General Business", "Entrepreneurship"],
  },
  "computer-science-bs": {
    label: "Concentration",
    names: ["Artificial Intelligence", "Human–Computer Interaction", "Systems", "Theory"],
  },
  "management-bs": {
    label: "Concentration",
    names: ["Entrepreneurship", "Human Resources", "Operations", "Strategy"],
  },
  "international-business-bs": {
    label: "Concentration",
    names: ["Global Finance", "Global Marketing", "Global Supply Chains"],
  },
  "psychology-ba": {
    label: "Emphasis",
    names: ["Clinical", "Cognitive Science"],
  },
  "studio-art-bfa": {
    label: "Specialization",
    names: ["Ceramics", "Painting", "Photography", "Printmaking"],
  },
}

/* ------------------------------------------------------------- derivation */

/** What the catalogue holds about an entry, before anything is asked of it.
 *  Flatter than `Program`, and deliberately: this page shows what a program is
 *  and what state its audit is in, and never opens the requirements — so the
 *  degree the whole suite stands on can be listed here without a requirement
 *  list being invented for it. */
export type CatalogEntry = {
  id: string
  /** The catalogue's own name, exactly as Advanced What-If writes it. */
  name: string
  kind: ProgramKind
  school: string
  department: string
  campus: string
  level: "Undergraduate" | "Graduate"
  /** What the entry asks for, one row per parent requirement. */
  requirements: CatalogRequirement[]
}

export type CatalogRequirement = {
  id: string
  name: string
  /** The grey tags after the name: "fulfill all", "at least 9 credits". */
  tags: string[]
  /** What the requirement asks for. A row without a code is something to do
   *  rather than something to take. */
  courses: { code: string; name: string }[]
}

/** Every course a requirement asks for, however deep it keeps them. A
 *  concentration holds its courses two groups down; read from the catalogue
 *  side that is still one list of courses. */
function coursesUnder(group: AuditGroup): { code: string; name: string }[] {
  return group.children.flatMap((child) =>
    child.kind === "group"
      ? coursesUnder(child)
      : child.kind === "course"
        ? [{ code: child.code, name: child.name }]
        : [{ code: "", name: child.name }]
  )
}

/** Business' requirements are not written twice. They are the tree Scott is
 *  read against, with the student taken out of it: the same seven rows, in the
 *  same order, asking for the same courses. An audit is a catalogue entry that
 *  somebody has been run through — so the catalogue entry is the audit with
 *  nobody in it. */
const BUSINESS_REQUIREMENTS: CatalogRequirement[] = programUnder(AUDIT)
  .children.filter((child): child is AuditGroup => child.kind === "group")
  .map((group) => ({
    id: group.id,
    name: group.name,
    tags: group.tags ?? [],
    courses: coursesUnder(group),
  }))

const CS_CORE = [
  { code: "CS 110", name: "Introduction to Programming" },
  { code: "CS 120", name: "Data Structures" },
  { code: "CS 210", name: "Computer Organization" },
  { code: "CS 230", name: "Algorithms" },
  { code: "CS 310", name: "Operating Systems" },
  { code: "CS 320", name: "Database Systems" },
  { code: "CS 340", name: "Software Engineering" },
  { code: "CS 410", name: "Computer Networks" },
  { code: "MATH 210", name: "Discrete Mathematics" },
  { code: "STAT 210", name: "Business Statistics" },
]

/** Computer Science is written here rather than derived, because nothing in the
 *  suite has ever had to answer a question about it. Four requirements, which
 *  is the shape every other major in the catalogue has. */
const CS_REQUIREMENTS: CatalogRequirement[] = [
  {
    id: "cs-foundation",
    name: "General Education",
    tags: ["fulfill all"],
    courses: [
      { code: "ENGL 101", name: "Composition I" },
      { code: "ENGL 210", name: "Advanced Composition" },
      { code: "HIST 110", name: "World Civilizations" },
      { code: "PHIL 220", name: "Logic" },
      { code: "MATH 110", name: "College Algebra" },
    ],
  },
  { id: "cs-core", name: "Computing Core", tags: ["fulfill all"], courses: CS_CORE },
  {
    id: "cs-electives",
    name: "Computer Science Electives",
    tags: ["at least 18 credits"],
    courses: [
      { code: "CS 350", name: "Machine Learning" },
      { code: "CS 360", name: "Computer Graphics" },
      { code: "CS 420", name: "Distributed Systems" },
      { code: "CS 430", name: "Compilers" },
      { code: "CS 450", name: "Computer Security" },
      { code: "CS 460", name: "Human–Computer Interaction" },
    ],
  },
  {
    id: "cs-open",
    name: "Open Electives",
    tags: ["at least 27 credits"],
    courses: [],
  },
]

/** The two entries this page holds that `PROGRAMS` does not.
 *
 *  Business is the degree every other prototype stands on, and what-if leaves
 *  it out by design — it offers a student the programs they are *not* on. Its
 *  requirements are written as an audit in `audit.ts`, which is the tree Scott
 *  is read against.
 *
 *  Computer Science is a degree the institution runs and no prototype has yet
 *  had a reason to write requirements for. Both belong here anyway: a
 *  registrar's catalogue is the list of everything the institution runs, and
 *  one that left out the degree most of its students are enrolled in would be a
 *  catalogue nobody could use. */
const OURS: CatalogEntry[] = [
  {
    id: "business",
    name: DEGREE.program,
    kind: "Major",
    school: "College of Business",
    department: "Finance",
    campus: "Main campus",
    level: "Undergraduate",
    requirements: BUSINESS_REQUIREMENTS,
  },
  {
    id: "computer-science-bs",
    name: "Computer Science, B.S.",
    kind: "Major",
    school: "School of Computing",
    department: "Computer Science",
    campus: "Main campus",
    level: "Undergraduate",
    requirements: CS_REQUIREMENTS,
  },
]

const [BUSINESS, ...ALSO] = OURS

function entryOf(program: Program): CatalogEntry {
  return {
    id: program.id,
    name: program.name,
    kind: program.kind,
    school: program.school,
    department: program.department,
    campus: program.campus,
    level: program.level,
    requirements: program.requirements.map((requirement) => ({
      id: requirement.id,
      name: requirement.name,
      tags: requirement.tags,
      courses: requirement.courses,
    })),
  }
}

/* Dropped from this page's catalogue. Two entries called Business Analytics,
   one a major and one a certificate, sitting either side of the degree the
   whole suite is about, read as a catalogue that cannot keep its own names
   straight. They are still in `PROGRAMS`, where Advanced What-If offers
   them. */
const WITHOUT = ["business-analytics-bs", "business-analytics-certificate"]

/** Every version of a program's audit, oldest first. One published version is
 *  the floor: a program students are enrolled in is a program something is
 *  auditing them against. */
function versionsOf(entry: CatalogEntry): AuditVersion[] {
  const work = WORK[entry.id] ?? {}
  return [
    ...(work.back ? [{ name: BACK, published: true, on: "12 June 2024", by: HAND, snapshots: 3 }] : []),
    { name: LIVE, published: true, on: "6 November 2025", by: HAND, snapshots: 2 },
    ...(work.drafts ?? []).map((name) => ({
      name,
      published: false,
      on: "4 September 2026",
      by: HAND,
      snapshots: 0,
    })),
  ]
}

/** Who publishes. The registrar on Staff Home, because he is the one with the
 *  permission there — one institution across the prototypes, with the same
 *  people in it. */
const HAND = "Mark"

export type CatalogProgram = CatalogEntry & {
  versions: AuditVersion[]
  subplans?: Subplans
}

function held(entry: CatalogEntry): CatalogProgram {
  return { ...entry, versions: versionsOf(entry), subplans: SUBPLANS[entry.id] }
}

/* The A's go last. Alphabetical from the top would open the catalogue on three
   entries nobody came to it for — Accounting twice and Art History — and the
   first row of a grid is the only part of a list of twenty-nine that gets read
   without scrolling. They keep their order among themselves. */
function shelf(a: CatalogProgram, b: CatalogProgram): number {
  const first = (entry: CatalogProgram) => (entry.name.startsWith("A") ? 1 : 0)
  return first(a) - first(b) || a.name.localeCompare(b.name)
}

export const CATALOG: CatalogProgram[] = [
  /* The degree the institution is mostly made of, and the one every other
     prototype stands on, at the head of its own catalogue rather than filed
     under B. */
  held(BUSINESS),
  ...[...ALSO, ...PROGRAMS.filter((program) => !WITHOUT.includes(program.id)).map(entryOf)]
    .map(held)
    .sort(shelf),
]

export function published(entry: CatalogProgram): AuditVersion[] {
  return entry.versions.filter((version) => version.published)
}

export function unpublished(entry: CatalogProgram): AuditVersion[] {
  return entry.versions.filter((version) => !version.published)
}

/** What the Audit Status filter is asking. Read off the versions rather than
 *  stored beside them, so a program cannot say "up to date" while a draft sits
 *  open on it. */
export const STATUSES = ["Published", "Unpublished changes"] as const
export type Status = (typeof STATUSES)[number]

export function statusOf(entry: CatalogProgram): Status {
  return unpublished(entry).length > 0 ? "Unpublished changes" : "Published"
}

/** How a version reads on the page: the catalogue year, and what state it is
 *  in. The state is the thing being chosen between, so it is said out loud
 *  rather than left to a colour. */
export function versionLabel(version: AuditVersion): string {
  return `${version.name} (${version.published ? "Published" : "Draft"})`
}

/** The version a program opens on: the newest one students are actually being
 *  audited against. A draft is the work, not the answer. */
export function currentVersion(entry: CatalogProgram): AuditVersion {
  return published(entry).at(-1) ?? entry.versions[0]
}

/** The entry years a version is the audit for. The newest published version
 *  takes everybody who has arrived since; an older one keeps the year it was
 *  written for, because the year after it has a version of its own. A draft
 *  will take the years after it, once it is published. */
export function entryYears(entry: CatalogProgram, version: AuditVersion): string {
  const from = Number(version.name.slice(0, 4))
  return version === currentVersion(entry) || !version.published
    ? `${from} and later`
    : `${from}`
}

/** How many students this version is the audit for: the ones on the program who
 *  arrived under it. Counted off the roster rather than written down — which is
 *  also why a draft is nobody's, and says so. */
export function appliesTo(entry: CatalogProgram, version: AuditVersion): number {
  if (!version.published) return 0
  const from = Number(version.name.slice(0, 4))
  const current = version === currentVersion(entry)
  return ROSTER.filter(
    (student) =>
      student.programs.some((program) => program.name.startsWith(entry.name)) &&
      (current ? student.entryYear >= from : student.entryYear === from)
  ).length
}

/* -------------------------------------------------------------- pathways */

export type Pathway = {
  name: string
  /** The entry year it was written for, as the catalogue writes it. */
  entryYear: string
  terms: number
  courses: number
  /** Applied to a student's plan without anybody asking for it. One per
   *  program at most — two pathways both applying themselves is two plans. */
  autoApply?: boolean
  /** The main line through the program, or a branch off it. A branch is a
   *  route through one concentration; the main line is every route. */
  kind: "Main" | "Branch"
  /** What it is a route through. */
  scope: string
  /** The term it starts in. A four-year plan that starts in spring is not the
   *  same plan shifted by a term — it meets different course offerings. */
  start: string
}

/** Built pathways, per program. Two programs have them, because two is the
 *  truth: a pathway is somebody's term-by-term route through a whole degree,
 *  and an institution with one for every entry would not need this page.
 *
 *  Business has three because the planners' student is standing in one of them
 *  — four lines of his plan say "Added by Pathway", and the Finance branch is
 *  the one that put them there.
 *
 *  A name says what kind of route it is and nothing about how long it takes:
 *  the card underneath already says eight terms, and a name carrying the same
 *  fact is a second place for it to go stale. */
const PATHWAYS: Record<string, Pathway[]> = {
  business: [
    {
      name: "Business - Full Time",
      entryYear: "EY2025",
      terms: 8,
      courses: 40,
      autoApply: true,
      kind: "Main",
      scope: "All concentrations",
      start: "Fall start",
    },
    {
      name: "Business - Part Time",
      entryYear: "EY2025",
      terms: 10,
      courses: 40,
      kind: "Main",
      scope: "All concentrations",
      start: "Fall start",
    },
    {
      name: "Business - Finance",
      entryYear: "EY2025",
      terms: 8,
      courses: 40,
      kind: "Branch",
      scope: "Finance",
      start: "Fall start",
    },
  ],
  "computer-science-bs": [
    {
      name: "Computer Science - Full Time",
      entryYear: "EY2025",
      terms: 8,
      courses: 40,
      autoApply: true,
      kind: "Main",
      scope: "All concentrations",
      start: "Fall start",
    },
    {
      name: "Computer Science - Accelerated",
      entryYear: "EY2026",
      terms: 7,
      courses: 40,
      kind: "Branch",
      scope: "Systems",
      start: "Fall start",
    },
  ],
}

export function pathwaysFor(entry: CatalogProgram): Pathway[] {
  return PATHWAYS[entry.id] ?? []
}

/** What the Planning tab says the instructions are for. The Generator reads
 *  them when it builds a plan against this program, which is why they are
 *  written on the program rather than on a student. */
export const PLANNING_PLACEHOLDER = "Add planning instructions for this program"

/** What the box fills itself in with.
 *
 *  Pasted rather than typed, which is what actually happens: nobody composes
 *  three paragraphs of course advice into a form — they write it down
 *  somewhere else, over months, and paste it in when a place to put it finally
 *  exists. So it arrives whole, and the field is filled the instant it is
 *  clicked into. See the README, "Fields that fill themselves in".
 *
 *  Program-level rather than student-level, which is the whole distinction this
 *  tab is making: every line of it is true of everybody on the program, so the
 *  Generator can hold it while building anybody's plan. */
export const PLANNING_INSTRUCTION = [
  "The following classes have a lot of coursework and are difficult for most students. Students " +
    "shouldn't take these courses together, and we should encourage students to take a lighter " +
    "course load when they take any one of them:",
  "- FIN 430",
  "- STAT 320",
  "- ECON 202",
  "",
  "Based on a student's score on the Math Placement test, we will recommend that they take " +
    "courses in different math series:",
  "- Score below 70 -> Start with MATH 100",
  "- Score below 85 -> Start with MATH 160",
  "- Score above 85 -> Start with Math 210",
  "",
  "While not required or officially set as a pre-req, we recommend that students take the " +
    "following courses to set themselves up for success:",
  "- ECON 150 before ECON 202",
  "- STAT 110 before STAT 210",
].join("\n")

export const PLANNING_BLURB =
  "Add any additional context you have on this program. This can be used by the Generator to " +
  "build out pathways and plans."

/* ---------------------------------------------------------------- asking */

/** The filters, in the order the product asks them. Three of the four are the
 *  ones Advanced What-If already asks of the same catalogue — a school, a type,
 *  a level — because they are questions about the program rather than about the
 *  screen. Audit Status is this screen's own: it is the only one of the four
 *  that is about the state of the work. */
export const PROGRAM_FILTERS = [
  ...FILTER_GROUPS.map((group) => ({
    ...group,
    fields: group.fields.map((field) => ({
      ...field,
      options: fieldOptions(field.id),
    })),
  })),
  {
    id: "audit-status",
    label: "Audit Status",
    fields: [
      {
        id: "status",
        label: "Audit Status",
        placeholder: "Select Status",
        options: [...STATUSES],
        mode: "menu" as const,
      },
    ],
  },
  /* Level last, as the product draws it: the broadest question is the one you
     reach for having tried the others. */
].sort((a, b) => order(a.id) - order(b.id))

function order(id: string): number {
  const rank = ["offered-by", "type", "audit-status", "level"]
  return rank.indexOf(id)
}

/** What a program answers to each filter field. */
export function valueOf(entry: CatalogProgram, fieldId: string): string {
  if (fieldId === "status") return statusOf(entry)
  return entry[fieldId as FilterField["id"]]
}

/** The keyword box. It searches the name, the department and the school — and
 *  says so in its placeholder, rather than offering to search things this
 *  catalogue has no record of. */
export function matchesKeywords(entry: CatalogProgram, keywords: string): boolean {
  const query = keywords.trim().toLowerCase()
  if (!query) return true
  return [entry.name, entry.department, entry.school]
    .join(" ")
    .toLowerCase()
    .includes(query)
}
