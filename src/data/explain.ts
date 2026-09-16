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
export type Constraint = {
  id: string
  text: string
  /** Lines beneath it: a course set, an attribute list. */
  detail?: string[]
  /** Course codes the rule names, shown as chips. */
  codes?: string[]
  limit?: { used: number; cap: number }
  progress?: { met: number; total: number }
  /** Courses this rule keeps out, and therefore the reason they are told. */
  blocks?: string[]
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
    id: "course-set",
    text: "Count courses only from the given course set",
    detail: ["Level: Undergraduate"],
  },
  {
    id: "double-count",
    text: "Courses may double count without any limit with other programs unless specified otherwise",
  },
  {
    id: "developmental",
    text: "Developmental coursework does not count toward the degree",
    detail: ["Courses numbered below 101, and their equivalents"],
    codes: ["MATH 110", "ENGL 100"],
    blocks: ["MATH 110", "ENGL 100"],
  },
  {
    id: "upper-division",
    text: `At least 40 credits at the 300 level or above`,
    limit: { used: 6, cap: 40 },
  },
  {
    id: "pass-no-pass",
    text: "At most 12 credits with the grading option Pass/No Pass",
    limit: { used: 0, cap: 12 },
  },
  {
    id: "transfer-grade",
    text: "At most 9 credits with transfer grades of C- or lower",
    limit: { used: 0, cap: 9 },
  },
]

/** A requirement's own rules — what this requirement, and no other, asks for.
 *  The ones that name courses name real ones off this student's record, which
 *  is what lets a mapping cite them by name rather than in the abstract. */
const OWN_RULES: Record<string, Constraint[]> = {
  "general-education": [
    {
      id: "gen-ed-spread",
      text: "At most 6 credits from any one subject",
      detail: ["Two of the eight must be taken outside the College of Business"],
      limit: { used: 6, cap: 6 },
    },
    {
      id: "gen-ed-letter",
      text: "Courses must be taken for a letter grade",
      detail: ["Pass/No Pass is not accepted against general education"],
    },
    {
      id: "gen-ed-developmental",
      text: "Developmental coursework does not count toward the degree",
      codes: ["MATH 110", "ENGL 100"],
      blocks: ["MATH 110", "ENGL 100"],
    },
  ],
  "business-core": [
    {
      id: "core-grade",
      text: "Earn a C or better in every course",
      detail: ["A course below C must be repeated before it counts"],
    },
    {
      id: "core-substitution",
      text: "College Algebra does not substitute for Business Calculus",
      codes: ["MATH 110"],
      blocks: ["MATH 110"],
    },
    {
      id: "core-residency",
      text: "At most 12 credits of the core may be transferred in",
      limit: { used: 0, cap: 12 },
    },
  ],
  "declared-concentration": [
    {
      id: "one-concentration",
      text: "Only one concentration may be declared",
      detail: [`Declared: ${DEGREE.concentration}`],
    },
  ],
  "finance-declared": [
    {
      id: "finance-gpa",
      text: "Earn a 2.5 GPA across the concentration",
      detail: ["Measured on the concentration's own courses only"],
    },
  ],
  "finance-core": [
    {
      id: "finance-prereq",
      text: "Corporate Finance is a prerequisite for every other course here",
      codes: ["FIN 301"],
    },
    {
      id: "finance-internship",
      text: "At most 3 credits from an internship or independent study",
      limit: { used: 0, cap: 3 },
    },
  ],
  "finance-advanced": [
    {
      id: "advanced-level",
      text: "Every course must be at the 400 level",
    },
  ],
  "finance-electives": [
    {
      id: "elective-department",
      text: "Electives must carry the FIN subject code",
      detail: ["A course from another subject needs a written substitution"],
    },
  ],
  "open-electives": [
    {
      id: "elective-unclaimed",
      text: "Any undergraduate course not already counting toward another requirement",
      /* Which is most of the transcript, and the reason this requirement can
         look empty while the student has a hundred credits. */
      blocks: [...CLAIMED],
    },
  ],
  capstone: [
    {
      id: "capstone-last",
      text: "Taken in the final year",
      detail: ["May not be started before 90 credits are earned"],
    },
  ],
  residency: [
    {
      id: "residency-check",
      text: "An additional check: courses counted here are not consumed",
      detail: ["The same course still counts toward the requirement that claimed it"],
    },
    {
      id: "residency-campus",
      text: "Credits must be earned on the main campus",
      detail: ["Transfer and dual-enrolment credit is not eligible"],
      blocks: ["MATH 110", "ENGL 100", "HIST 101", "SPAN 101"],
    },
  ],
  "total-credits": [
    {
      id: "total-check",
      text: "An additional check: courses counted here are not consumed",
    },
    {
      id: "total-developmental",
      text: "Developmental coursework does not count toward the total",
      codes: ["MATH 110", "ENGL 100"],
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
    entry.children.forEach(walk)
  }
  walk(group)

  return counted
}

/* ----------------------------------------------------------------- deriving */

function isComplete(entry: AuditEntry): boolean {
  if (entry.kind === "course") return entry.mark === "taken"
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
      text: "Fulfill any one of the following requirements",
      progress: { met: children.filter(isComplete).length, total: 1 },
    }
  }

  const credits = tag.match(/at least (\d+) credits/)
  if (credits) {
    return {
      id: `${group.id}-fulfil`,
      text: `At least ${credits[1]} credits from the following`,
      progress: { met: counting * CREDITS_PER_COURSE, total: Number(credits[1]) },
    }
  }

  return {
    id: `${group.id}-fulfil`,
    text: holdsGroups
      ? "Fulfill all of the following requirements"
      : "Fulfill all of the following courses",
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
      if (!blocked.has(code)) blocked.set(code, constraint.text)
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
