import {
  AUDIT,
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

/** Rules the degree applies to everything under it. Catalogue facts, so they
 *  are written down rather than derived — but the courses they name are real
 *  ones off this student's record, which is what lets a mapping cite them. */
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
    id: "transfer-grade",
    text: "At most 9 credits with transfer grades of C- or lower",
    limit: { used: 0, cap: 9 },
  },
  {
    id: "pass-no-pass",
    text: "At most 12 credits with the grading option Pass/No Pass",
    limit: { used: 0, cap: 12 },
  },
]

/** Rules that belong to one requirement rather than to the degree. */
const OWN_RULES: Record<string, Constraint[]> = {
  "general-education": [
    {
      id: "gen-ed-spread",
      text: "At most 6 credits from any one subject",
      limit: { used: 6, cap: 6 },
      detail: ["Two of the eight must come from outside the College of Business"],
    },
  ],
  "business-core": [
    {
      id: "core-grade",
      text: "Earn a C or better in every course",
      detail: ["A course below C must be repeated before it counts"],
    },
  ],
  residency: [
    {
      id: "residency-campus",
      text: "Credits must be earned on the main campus",
      detail: ["Transfer and dual-enrolment credit is not eligible"],
      blocks: ["MATH 110", "ENGL 100", "HIST 101", "SPAN 101"],
    },
  ],
  "total-credits": [
    {
      id: "total-floor",
      text: `At least ${DEGREE.credits} credits toward the degree`,
      progress: { met: 0, total: DEGREE.credits },
    },
  ],
}

/* ----------------------------------------------------------------- deriving */

function isComplete(entry: AuditEntry): boolean {
  if (entry.kind === "course") return entry.mark === "taken"
  if (entry.mark === "optional") return true
  return entry.children.length > 0 && entry.children.every(isComplete)
}

/** Everything the requirement applies, its own first line included.
 *
 *  That first line is derived rather than written: "fulfill all of the
 *  following" is a claim about the tree, and the tree is right there. It
 *  counts whatever the requirement actually holds — its courses where it holds
 *  courses, its sub-requirements where it holds those. */
export function constraintsFor(group: AuditGroup): Constraint[] {
  const children = group.children
  const met = children.filter(isComplete).length

  const own: Constraint[] = [
    {
      id: `${group.id}-fulfil`,
      text: children.some((child) => child.kind === "group")
        ? "Fulfill all of the following requirements"
        : "Fulfill all of the following courses",
      progress: { met, total: children.length },
    },
    ...(OWN_RULES[group.id] ?? []),
  ]

  /* The degree's rules apply to every requirement under it, which is why they
     are read out on each one rather than only at the top. */
  return group.level === "degree" ? [own[0], ...PROGRAM_RULES] : [...own, ...PROGRAM_RULES]
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
