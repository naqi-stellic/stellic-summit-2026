import { REMAINING_REQUIREMENTS } from "@/data/catalog"
import {
  CREDITS_PER_COURSE,
  INITIAL_YEARS,
  scheduleTerm,
  type Activity,
  type PlannedCourse,
  type Term,
  type Year,
} from "@/data/plan"

const ACCENTS = ["purple", "green", "amber", "teal", "brown", "rose"] as const

/* The two prototypes open on different plans, because they are demonstrating
 * different things. The generator opens on a plan with almost nothing in it,
 * so that generating one has work to do. The planner opens on a plan already
 * made: four years of it, classes chosen for the terms nearest to hand,
 * problems in the ones further out, and a last year still to fill — which is
 * what a planner is for.
 *
 * It is built from the same forty requirements rather than written out again,
 * so the two can never disagree about what the degree wants. */

const PLANNED_TERMS: { id: string; codes: string[] }[] = [
  { id: "spring-2027", codes: ["ECON 201", "MKTG 201", "SOC 101"] },
  { id: "fall-2027", codes: ["ECON 202", "ACCT 202", "STAT 210", "MGMT 210", "MIS 250"] },
  { id: "spring-2028", codes: ["FIN 301", "BIO 105", "ARTS 110", "DATA 210", "PHIL 240"] },
  /* The term worth opening, and the only one with anything wrong in it:
     Derivatives sits a year before Investments, which it asks for, and
     Operations only ever runs in Spring. */
  { id: "fall-2028", codes: ["FIN 420", "OPS 320", "BLAW 301", "BUS 390", "ECON 310"] },
  { id: "spring-2029", codes: ["FIN 340", "ACCT 310", "HIST 205", "FIN 430", "STAT 320"] },
  { id: "fall-2029", codes: ["MGMT 340", "FIN 445"] },
]

/** Terms whose classes are published, which is as far ahead as this school
 *  publishes them. Past that a course is planned but has no sitting yet. */
const PLANNED_SCHEDULED = ["fall-2026", "spring-2027", "fall-2027", "spring-2028"]

const ACTIVITIES: Record<string, Activity[]> = {
  "fall-2026": [
    { id: "a1", name: "Finance Club", kind: "Student organisation", meetings: [{ day: 3, from: 17, to: 18 }] },
    { id: "a2", name: "Peer tutoring — Calculus", kind: "Campus job", meetings: [{ day: 2, from: 16, to: 17.5 }] },
  ],
  "spring-2027": [
    { id: "a3", name: "Finance Club", kind: "Student organisation", meetings: [{ day: 3, from: 17, to: 18 }] },
    { id: "a4", name: "Investment Society", kind: "Student organisation", meetings: [{ day: 5, from: 15, to: 16.5 }] },
  ],
  "fall-2027": [
    { id: "a5", name: "Finance Club", kind: "Student organisation", meetings: [{ day: 3, from: 17, to: 18 }] },
    { id: "a6", name: "Wilson & Reed internship", kind: "Internship", meetings: [{ day: 5, from: 9, to: 13 }] },
  ],
  "spring-2028": [
    { id: "a7", name: "Investment Society", kind: "Student organisation", meetings: [{ day: 5, from: 15, to: 16.5 }] },
  ],
}

let planned = 0

/** One of the outstanding requirements, as a course in a term. */
function plannedCourse(code: string): PlannedCourse {
  const entry = REMAINING_REQUIREMENTS.find((r) => r.code === code)
  if (!entry) throw new Error(`No outstanding requirement for ${code}`)
  planned += 1

  return {
    id: `n${planned}`,
    code: entry.code,
    name: entry.name,
    credits: CREDITS_PER_COURSE,
    requirement: REMAINING_REQUIREMENTS.indexOf(entry),
    accent: ACCENTS[planned % ACCENTS.length],
    classNo: String(3100 + planned * 13),
    campus: "Main",
    modality: "In Person",
    gradeOption: "Graded",
    subTerm: "Full Term",
    lastActivity: "Added by pathway, 3 Apr 2026",
  }
}

export const PLANNED_YEARS: Year[] = INITIAL_YEARS.map((year) => ({
  ...year,
  terms: year.terms.map((term) => {
    const filling = PLANNED_TERMS.find((t) => t.id === term.id)
    const scheduled = PLANNED_SCHEDULED.includes(term.id)
    const held: Term = {
      ...term,
      scheduled: term.scheduled || scheduled,
      activities: ACTIVITIES[term.id],
      courses: filling ? [...term.courses, ...filling.codes.map(plannedCourse)] : term.courses,
    }
    /* A term whose classes are out has them all: a course put into it by the
       pathway arrives with a sitting, the same as one chosen by hand. */
    return scheduled && !term.locked ? scheduleTerm(held) : held
  }),
}))
