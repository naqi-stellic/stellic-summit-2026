import {
  AUDIT,
  COUNTING_NOW,
  STUDENT_RECORD,
  auditStanding,
  type AuditCourse,
  type AuditEntry,
  type AuditGroup,
} from "@/data/audit"
import { GENERAL_EDUCATION_RULES } from "@/data/explain-audit"
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
  /** Courses this rule counts, by attribute — the course-set type that names a
   *  tag and takes whatever carries it. */
  attributes?: string[]
  /** Courses this rule keeps out, by code. */
  blocks?: string[]
  /** And by attribute, which is how a catalogue actually writes it: the rule
   *  names a tag and catches whatever carries it, rather than a list somebody
   *  has to keep up to date. */
  blocksAttributes?: string[]
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

/** Courses the P/N limit does not touch. The catalogue names them, and a
 *  course on this list can be passed without spending any of the twelve. */
const PASS_EXEMPT = [
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
]

/** Every course sitting on a pass/no-pass grade that the limit counts. Read
 *  off the record rather than typed, so putting another P on the transcript
 *  moves the fraction and the advice with it. */
const PASSED: AuditCourse[] = [...STUDENT_RECORD.values()].filter(
  (course) => course.grade === "P" && !PASS_EXEMPT.includes(course.code)
)

const PASS_CREDITS = PASSED.reduce((sum, course) => sum + course.credits, 0)

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
    text: "At most 12 credits with the grading option pass/no pass",
    limit: { used: PASS_CREDITS, cap: 12 },
    notes: [
      /* What has been spent, before what is exempt from spending it. The
         fraction on the right is the answer to "can I take another one"; this
         is what it is made of. */
      { text: "Already counted against this limit:" },
      { codes: PASSED.map((course) => course.code) },
      { text: "The following courses will not impact this limit:" },
      { codes: PASS_EXEMPT },
    ],
  },
  {
    id: "low-grades",
    text: "At most 9 credits with transfer grades of C- or lower",
    limit: { used: 0, cap: 9 },
  },
  {
    id: "military",
    text: "Take at most 15 credits that match the following",
    limit: { used: 3, cap: 15 },
    notes: [
      { text: "Course with one of these attributes: AERO or equivalent; MLSC or equivalent; NAVS or equivalent" },
      { text: "Course with an enrollment tag Military Transfer Credit" },
    ],
  },
  {
    id: "developmental",
    text: "Following courses will not count",
    notes: [
      { codes: ["MATH 110", "ENGL 100"] },
      {
        text: "Course with one of these attributes: DVAL or equivalent; Developmental Mathematics; Developmental Composition; ESL Composition; Study Skills",
        truncated: true,
      },
    ],
    blocks: ["MATH 110", "ENGL 100"],
    blocksAttributes: [
      "DVAL",
      "Developmental Mathematics",
      "Developmental Composition",
      "ESL Composition",
      "Study Skills",
    ],
  },
]

/** A requirement's own rules — what this requirement, and no other, asks for.
 *  Worded the way the audit editor words them, because a constraint a student
 *  is shown and a constraint a registrar typed should be the same sentence. */
const OWN_RULES: Record<string, Constraint[]> = {
  /* Two constraints, and they live with the tree that draws them —
     `explain-audit.ts` owns the courses they count, so it owns the counting. */
  "general-education": GENERAL_EDUCATION_RULES,
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
/** Requirements whose own constraints are the whole of what they ask, so the
 *  generated "fulfill all" line would be a third thing claiming to be one of
 *  two. General Education on the Explain prototype is the only one: its two
 *  course-set rules are primary constraints, not filters under one. */
const OWN_FULFILMENT = new Set(["general-education"])

export function constraintsFor(group: AuditGroup): Constraint[] {
  /* The programme's rules belong to the programme. They had hung off the
     credential, one row above — "at least 120 units in total" is a thing
     Business Administration asks for, not a property of the letters after
     somebody's name. The credential answers with the same set, because a
     reader who clicks the row above should still get the answer. */
  if (group.level === "degree" || group.level === "program") {
    return [fulfilment(group), ...PROGRAM_RULES]
  }
  const own = OWN_RULES[group.id] ?? []
  if (OWN_FULFILMENT.has(group.id) && own.length) return own
  return [fulfilment(group), ...own]
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
export function courseMappings(
  group: AuditGroup,
  /** Whose transcript to read it against. Every prototype but one is reading
   *  the same student; the one that is not should not have to pretend. */
  record: Map<string, AuditCourse> = STUDENT_RECORD
): CourseMapping[] {
  const constraints = constraintsFor(group)
  const blocked = new Map<string, string>()

  const refuse = (code: string, why: string) => {
    if (!blocked.has(code)) blocked.set(code, why)
  }

  constraints.forEach((constraint) => {
    const said = constraint.blockReason ?? `Does not satisfy "${constraint.text}"`
    constraint.blocks?.forEach((code) => refuse(code, said))

    /* A rule written against a tag catches whatever carries it, so the reason
       names the tag rather than the rule alone — "does not satisfy Following
       courses will not count" leaves a student asking which part of it they
       fell foul of. */
    if (!constraint.blocksAttributes) return
    record.forEach((course) => {
      const caught = course.attributes?.find((attribute) =>
        constraint.blocksAttributes!.includes(attribute)
      )
      if (caught) refuse(course.code, `${said} because course has the attribute '${caught}'`)
    })
  })

  return recordMappings([...countedBy(group)], blocked, record)
}

/** The same reading, for a rule that is not a requirement.
 *
 *  A compliance check counts credit too, and it refuses credit for reasons a
 *  degree audit would never give — earned before enrolment, in progress rather
 *  than earned, carrying no grade points. Nothing on that page can derive
 *  those, so the check names the codes and the reason and this lays them
 *  against the record the same way. */
export function recordMappings(
  counting: string[],
  refused: Map<string, string> | { codes: string[]; reason: string }[] = [],
  record: Map<string, AuditCourse> = STUDENT_RECORD
): CourseMapping[] {
  const counts = new Set(counting)

  const blocked =
    refused instanceof Map
      ? refused
      : refused.reduce((all, { codes, reason }) => {
          codes.forEach((code) => {
            if (!all.has(code)) all.set(code, reason)
          })
          return all
        }, new Map<string, string>())

  return [...record.values()].map((course) => {
    if (counts.has(course.code)) return { course, verdict: "counting" as const }

    const reason = blocked.get(course.code)
    if (reason) return { course, verdict: "not counting" as const, reason }

    return { course, verdict: "not considered" as const }
  })
}

/* ---------------------------------------------------------------- standings */

/** The line the panel opens on. A requirement is best read in the unit it is
 *  written in, and every requirement in this catalogue is written in credits. */
export function explainStanding(group: AuditGroup) {
  /* What the requirement says it wants, where it says so. Counting the rows
     instead would have the sentence agree with the tree and disagree with the
     constraint underneath it — a requirement holding six finished courses and
     asking for thirty credits is exactly the case worth being right about. */
  const asked = constraintsFor(group).find((constraint) => constraint.progress)?.progress
  if (asked) {
    return {
      earned: asked.met,
      needed: asked.total,
      toGo: Math.max(0, asked.total - asked.met),
    }
  }

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
