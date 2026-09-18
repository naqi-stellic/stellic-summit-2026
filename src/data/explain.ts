import {
  AUDIT,
  COUNTING_NOW,
  STUDENT_RECORD,
  auditStanding,
  type AuditCourse,
  type AuditEntry,
  type AuditGroup,
} from "@/data/audit"
import { CREDITS_PER_COURSE, DEGREE } from "@/data/plan"

/* Why a requirement stands where it does, and why a course does or does not
 * count toward it.
 *
 * The audit says what; this says why. Nothing here is a second audit — it
 * reads the tree that is already on screen and the record it was audited
 * against, and its whole job is to put the rules that produced that answer
 * into words a student can argue with. */

/** A rule the requirement applies. Three shapes, and which one it is decides
 *  how it is marked:
 *
 *  - a **progress** rule can fail by being unfinished — that is the
 *    requirement itself, and the only line that goes red;
 *  - a **limit** can fail by being exceeded, and reads as a fraction;
 *  - everything else is descriptive. There is nothing to satisfy, so it is
 *    stated and marked grey rather than ticked. */
/** A line under a constraint. A rule in a real catalogue is rarely one
 *  sentence: it carries the set it applies to, the exceptions to itself, and
 *  the courses those exceptions name. Each of those is a note, and a note can
 *  carry its own chips — which is how "at most 12 credits Pass/No Pass, except
 *  for these twenty-six courses" gets said in the order it is meant. */
export type ConstraintNote = {
  text?: string
  /** Course codes, shown as chips. Long lists trail off into "+ N more". */
  codes?: string[]
  /** The catalogue's own list runs longer than anyone reads standing up. */
  truncated?: boolean
}

export type Constraint = {
  id: string
  text: string
  notes?: ConstraintNote[]
  limit?: { used: number; cap: number }
  progress?: { met: number; total: number }
  /** Courses this rule keeps out. */
  blocks?: string[]
  /** What a blocked course is told, where the rule's own wording is not the
   *  reason. A course already counting elsewhere has not failed a constraint —
   *  it has been spent. */
  blockReason?: string
}

export type ConstraintStatus = "rule" | "ok" | "unmet"

export function constraintStatus(constraint: Constraint): ConstraintStatus {
  if (constraint.progress) {
    return constraint.progress.met >= constraint.progress.total ? "ok" : "unmet"
  }
  if (constraint.limit) return constraint.limit.used > constraint.limit.cap ? "unmet" : "ok"
  return "rule"
}

/* ------------------------------------------------------------ the catalogue */

/** Every code the degree is presently counting. The Open Electives rule needs
 *  it — an elective is by definition a course nothing else has claimed — and
 *  computing it is the only honest way to write that rule down. */
const CLAIMED = COUNTING_NOW

/** Rules the degree applies to everything beneath it. These are the only ones
 *  that travel: a requirement's own rules are its own, and printing the whole
 *  programme's rulebook under each of them would make them all read alike. */
const PROGRAM_RULES: Constraint[] = [
  {
    id: "total-units",
    text: `At least ${DEGREE.credits} units in total`,
    progress: { met: 51, total: DEGREE.credits },
  },
  {
    id: "course-set",
    text: `Take at least ${DEGREE.credits} credits from a given course set`,
    notes: [{ text: "Level: Undergraduate" }],
  },
  {
    id: "min-units",
    text: "Minimum of 1 unit for each course counted",
  },
  {
    id: "double-count",
    text: "Double counting allowed up to unlimited courses with other programs",
  },
  {
    id: "pass-grades",
    text: "At most 12 units with defined grades",
    limit: { used: 0, cap: 12 },
    notes: [
      { text: "Grades: P" },
      { text: "The following courses will not impact this limit:" },
      {
        codes: [
          "ATHP 101",
          "BSAD 111",
          "BSAD 222",
          "BSAD 333",
          "COMB 101E",
          "FITN 140",
          "MLSC 101",
          "MLSC 201",
          "MUSC 120",
          "UNIV 101",
        ],
      },
    ],
  },
  {
    id: "low-grades",
    text: "At most 9 units with defined grades",
    limit: { used: 0, cap: 9 },
    notes: [{ text: "Grades: C-, D+, D, D-, F" }, { text: "Transfer coursework only" }],
  },
  {
    id: "military",
    text: "Take at most 15 credits from the following attributes:",
    limit: { used: 3, cap: 15 },
    notes: [
      { text: "AERO or equivalent; MLSC or equivalent; NAVS or equivalent" },
      { text: "Course with an enrollment tag Military Transfer Credit" },
    ],
  },
  {
    id: "developmental",
    text: "Do not count courses from a given set",
    notes: [
      { codes: ["MATH 110", "ENGL 100"] },
      {
        text: "Courses with attributes: DVAL or equivalent; Developmental Mathematics; Developmental Composition; ESL Composition; Study Skills",
        truncated: true,
      },
    ],
    blocks: ["MATH 110", "ENGL 100"],
  },
]

/** A requirement's own rules — what this requirement, and no other, asks for.
 *  Worded the way the audit editor words them, because a constraint a student
 *  is shown and a constraint a registrar typed should be the same sentence. */
const OWN_RULES: Record<string, Constraint[]> = {
  "general-education": [
    {
      id: "gen-ed-subject",
      text: "Take at most 6 credits from a given course set",
      limit: { used: 6, cap: 6 },
      notes: [
        { text: "Course set: any one subject code" },
        { text: "Two of the eight must fall outside subject codes ACCT, BUS, ECON, FIN, MIS, MGMT, MKTG" },
      ],
    },
    {
      id: "gen-ed-grade",
      text: "Pass with minimum grade C",
    },
    {
      id: "gen-ed-pass",
      text: "Non-letter grade passed courses can satisfy this requirement",
      notes: [
        { text: "For the following courses only:" },
        { codes: ["ARTP 101", "FILM 150", "MUSC 120", "MUSC 165", "PHIL 120", "UNIV 101"] },
      ],
    },
    {
      id: "gen-ed-attributes",
      text: "Take 2 courses from the following attributes:",
      progress: { met: 1, total: 2 },
      notes: [
        { text: "ACE 1 or equivalent; ACE 2 or equivalent" },
        { text: "Course with an enrollment tag Honors Section" },
      ],
    },
    {
      id: "gen-ed-exclude",
      text: "Do not count courses from a given set",
      notes: [
        { codes: ["MATH 110", "ENGL 100"] },
        { text: "Courses with codes between MATH 000 and MATH 109 do not count" },
      ],
      blocks: ["MATH 110", "ENGL 100"],
    },
    {
      id: "gen-ed-overlap",
      text: "Up to 1 course may double count with other requirements",
    },
  ],
  "business-core": [
    { id: "core-grade", text: "Pass with minimum grade C" },
    { id: "core-units", text: "Minimum of 3 units for each course counted" },
    {
      id: "core-transfer",
      text: "Take at most 12 credits from a given course set",
      limit: { used: 0, cap: 12 },
      notes: [{ text: "Course set: transfer coursework" }],
    },
    {
      id: "core-exclude",
      text: "Do not count courses from a given set",
      notes: [{ codes: ["MATH 110"] }],
      blocks: ["MATH 110"],
    },
  ],
  "declared-concentration": [
    {
      id: "one-concentration",
      text: "The requirement is waived for students with any of these tags:",
      notes: [{ text: "Concentration Exempt; Second Degree Seeking" }],
    },
  ],
  "finance-declared": [
    {
      id: "finance-tag",
      text: "Student must have 1 attributes/tags",
      notes: [{ text: `Tag: ${DEGREE.concentration} concentration declared` }],
    },
    { id: "finance-grade", text: "Pass with minimum grade C" },
  ],
  "finance-core": [
    { id: "finance-core-grade", text: "Pass with minimum grade C" },
    {
      id: "finance-core-timing",
      text: "Same semester or after 60 credits are earned",
      notes: [{ text: "Courses taken before the sixtieth credit will not count" }],
    },
  ],
  "finance-advanced": [
    {
      id: "advanced-range",
      text: "Courses with codes between FIN 100 and FIN 399 do not count",
    },
  ],
  "finance-electives": [
    { id: "elective-preapproved", text: "Other pre-approved courses may also count" },
  ],
  "open-electives": [
    {
      id: "elective-unclaimed",
      /* The one constraint that reads the rest of the audit: an elective is by
         definition whatever nothing else has spent. */
      text: "Take at least 9 credits excluding the given course set",
      notes: [{ text: "Course set: courses counting toward another requirement" }],
      blocks: [...CLAIMED],
      blockReason: "Already counting toward another requirement",
    },
  ],
  capstone: [
    {
      id: "capstone-timing",
      text: "Same semester or after 90 credits are earned",
    },
    { id: "capstone-manual", text: "May only be satisfied manually by an institution" },
  ],
  residency: [
    {
      id: "residency-scope",
      text: "Only courses from the following sub-requirements can count toward the units total",
      notes: [{ text: "An additional check: it consumes nothing, and always double counts" }],
    },
    {
      id: "residency-exclude",
      text: "Do not count courses from a given set",
      notes: [{ text: "Course set: transfer and dual-enrolment coursework" }],
      blocks: ["MATH 110", "ENGL 100", "HIST 101", "SPAN 101"],
    },
  ],
  "total-credits": [
    { id: "total-min", text: "Minimum of 1 unit for each course counted" },
    {
      id: "total-exclude",
      text: "Do not count courses from a given set",
      notes: [{ codes: ["MATH 110", "ENGL 100"] }],
      blocks: ["MATH 110", "ENGL 100"],
    },
  ],
}

/** Every code the requirement is actually counting. */
function countedBy(group: AuditGroup): Set<string> {
  const counted = new Set<string>()

  const walk = (entry: AuditEntry) => {
    if (entry.kind === "course") {
      if (entry.code && entry.mark !== "remaining") counted.add(entry.code)
      return
    }
    if (entry.kind === "milestone") return
    entry.children.forEach(walk)
  }
  walk(group)

  return counted
}

/* ----------------------------------------------------------------- deriving */

function isComplete(entry: AuditEntry): boolean {
  if (entry.kind === "course" || entry.kind === "milestone") return entry.mark === "taken"
  if (entry.mark === "optional") return true
  return entry.children.length > 0 && entry.children.every(isComplete)
}

/** The requirement's own first line, derived rather than written — it is a
 *  claim about the tree, and the tree is right there.
 *
 *  Which claim depends on what the requirement's tag says it wants. "Fulfill
 *  any" is satisfied by one, "at least N credits" is counted in credits, and
 *  everything else is all of whatever it holds. Getting that wrong would put
 *  "fulfill all — 1/3" on a requirement that only ever wanted one. */
function fulfilment(group: AuditGroup): Constraint {
  const tag = group.tags?.[0] ?? ""
  const children = group.children
  const holdsGroups = children.some((child) => child.kind === "group")
  const counting = countedBy(group).size

  if (tag.includes("fulfill any")) {
    return {
      id: `${group.id}-fulfil`,
      text: "Fulfill any 1 of the following sub-requirements",
      progress: { met: children.filter(isComplete).length, total: 1 },
    }
  }

  const credits = tag.match(/at least (\d+) credits/)
  if (credits) {
    return {
      id: `${group.id}-fulfil`,
      text: `Take at least ${credits[1]} credits from a given course set`,
      progress: { met: counting * CREDITS_PER_COURSE, total: Number(credits[1]) },
    }
  }

  if (holdsGroups) {
    return {
      id: `${group.id}-fulfil`,
      text: "Fulfill all of the following sub-requirements",
      progress: { met: children.filter(isComplete).length, total: children.length },
    }
  }

  return {
    id: `${group.id}-fulfil`,
    text: `Take at least ${children.length} courses from a given course set`,
    progress: { met: children.filter(isComplete).length, total: children.length },
  }
}

/** Everything the requirement applies: what it wants, its own rules, and — at
 *  the top only — the rules the whole degree runs on. */
export function constraintsFor(group: AuditGroup): Constraint[] {
  if (group.level === "degree") return [fulfilment(group), ...PROGRAM_RULES]
  return [fulfilment(group), ...(OWN_RULES[group.id] ?? [])]
}

/* ----------------------------------------------------------------- mappings */

export type MappingVerdict = "counting" | "not counting" | "not considered"

export type CourseMapping = {
  course: AuditCourse
  verdict: MappingVerdict
  /** Why it is not counting. Only a blocked course has one — "not considered"
   *  is not a judgement, it is the absence of one. */
  reason?: string
}

/** The whole record, read against one requirement: what it is counting, what a
 *  rule is keeping out and which rule, and what it simply never asked for.
 *
 *  The third of those is the commonest and the least interesting, which is why
 *  it is worded as "not considered" rather than as a refusal — the requirement
 *  has no opinion about a course it was never offered. */
export function courseMappings(group: AuditGroup): CourseMapping[] {
  const counting = countedBy(group)
  const constraints = constraintsFor(group)

  const blocked = new Map<string, string>()
  constraints.forEach((constraint) =>
    constraint.blocks?.forEach((code) => {
      if (!blocked.has(code)) {
        blocked.set(
          code,
          constraint.blockReason ?? `Does not satisfy "${constraint.text}"`
        )
      }
    })
  )

  return [...STUDENT_RECORD.values()].map((course) => {
    if (counting.has(course.code)) return { course, verdict: "counting" as const }

    const reason = blocked.get(course.code)
    if (reason) return { course, verdict: "not counting" as const, reason }

    return { course, verdict: "not considered" as const }
  })
}

/* ---------------------------------------------------------------- standings */

/** The line the panel opens on. A requirement is best read in the unit it is
 *  written in, and every requirement in this catalogue is written in credits. */
export function explainStanding(group: AuditGroup) {
  const counted = countedBy(group).size
  const total =
    group.level === "degree"
      ? DEGREE.requirements
      : group.children.filter((child) => child.kind === "course").length ||
        group.children.length

  return {
    earned: counted * CREDITS_PER_COURSE,
    needed: total * CREDITS_PER_COURSE,
    toGo: Math.max(0, (total - counted) * CREDITS_PER_COURSE),
  }
}

/** What the degree's own Pass/No Pass and transfer-grade limits have actually
 *  used. Both are zero here — this student has no P/N and no transfer grade
 *  below a C — and saying so is the point: a limit that is nowhere near being
 *  hit should read as satisfied, not be left out. */
export const PROGRAM_STANDING = auditStanding(AUDIT)
