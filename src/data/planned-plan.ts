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

/** What each term holds beyond what the plan already had in it: requirements
 *  by their code, seats standing for a requirement nobody has chosen a course
 *  for yet, and courses that were chosen for such a seat — which go on saying
 *  which requirement they are answering. */
type Filling = {
  id: string
  codes?: string[]
  seats?: string[]
  fills?: { code: string; name: string; seat: string }[]
}

const PLANNED_TERMS: Filling[] = [
  /* Registration is open on this one, and there is a 400-level finance course
     in it whose prerequisite is three years away — the mistake a planner is
     for catching before the window closes. The two electives beside it were
     chosen for seats, and go on saying which seat. */
  {
    id: "spring-2027",
    codes: ["FIN 415", "STAT 210"],
    fills: [
      { code: "PHIL 120", name: "Logic & Critical Thinking", seat: "GEN ELEC" },
      { code: "MUSC 120", name: "Music & Society", seat: "GEN ELEC" },
    ],
  },
  /* Operations only runs in Spring, and it has been planned into a Fall. */
  { id: "fall-2027", codes: ["ECON 202", "ACCT 202", "MGMT 210", "MIS 250", "OPS 320"] },
  {
    id: "spring-2028",
    codes: ["FIN 301", "BIO 105", "DATA 210", "PHIL 240"],
    fills: [{ code: "ANTH 210", name: "Cultural Anthropology", seat: "GEN ELEC" }],
  },
  /* Derivatives sits a year before Investments, which it asks for. */
  { id: "fall-2028", codes: ["FIN 420", "STAT 320", "BLAW 301", "BUS 390", "ECON 310"] },
  {
    id: "spring-2029",
    codes: ["FIN 340", "ACCT 310", "FIN 430", "SOC 101"],
    fills: [{ code: "DATA 330", name: "Predictive Modelling", seat: "DATA ELEC" }],
  },
  /* The last year is where the choosing is still to be done: the electives are
     held as seats rather than settled on courses. */
  { id: "fall-2029", codes: ["MGMT 340"], seats: ["FIN ELEC", "GEN ELEC"] },
  { id: "spring-2030", codes: ["BUS 495"], seats: ["FIN ELEC"] },
]

/** Terms whose classes are published. Past those a course is planned but has
 *  no sitting yet, which is why they are lists rather than weeks. */
const PLANNED_SCHEDULED = ["fall-2026", "spring-2027"]

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
    { id: "a5", name: "Finance Club", kind: "Student organisation" },
    { id: "a6", name: "Wilson & Reed internship", kind: "Internship" },
  ],
  "spring-2028": [{ id: "a7", name: "Investment Society", kind: "Student organisation" }],
}

let planned = 0

/* Each requirement is answered once. A term asks for one by its code and gets
 * the first that nothing has claimed, so two finance elective seats in the
 * same year are two of the three the concentration asks for rather than the
 * same one drawn twice. */
const claimed = new Set<number>()

function claim(code: string): number {
  const at = REMAINING_REQUIREMENTS.findIndex((r, i) => r.code === code && !claimed.has(i))
  if (at === -1) throw new Error(`No outstanding requirement left for ${code}`)
  claimed.add(at)
  return at
}

function planItem(fields: Partial<PlannedCourse> & { code: string; name: string }): PlannedCourse {
  planned += 1
  return {
    id: `n${planned}`,
    credits: CREDITS_PER_COURSE,
    accent: ACCENTS[planned % ACCENTS.length],
    lastActivity: "Added by pathway, 3 Apr 2026",
    ...fields,
  }
}

/** One of the outstanding requirements, as a course in a term. */
function plannedCourse(code: string): PlannedCourse {
  const at = claim(code)
  const entry = REMAINING_REQUIREMENTS[at]
  return planItem({
    code: entry.code,
    name: entry.name,
    requirement: at,
    classNo: String(3100 + planned * 13),
    campus: "Main",
    modality: "In Person",
    gradeOption: "Graded",
    subTerm: "Full Term",
  })
}

/** A requirement with no course against it yet. */
function plannedSeat(code: string): PlannedCourse {
  const at = claim(code)
  const entry = REMAINING_REQUIREMENTS[at]
  return planItem({
    code: entry.code,
    name: entry.name,
    requirement: at,
    placeholder: true,
  })
}

/** A seat that has been filled: the course stands where the seat did, under
 *  the name of the requirement it is answering. */
function plannedFill(fill: { code: string; name: string; seat: string }): PlannedCourse {
  const at = claim(fill.seat)
  const entry = REMAINING_REQUIREMENTS[at]
  return planItem({
    code: fill.code,
    name: fill.name,
    requirement: at,
    seat: { code: entry.code, name: entry.name },
    classNo: String(3100 + planned * 13),
    campus: "Main",
    modality: "In Person",
    gradeOption: "Graded",
    subTerm: "Full Term",
  })
}

export const PLANNED_YEARS: Year[] = INITIAL_YEARS.map((year) => ({
  ...year,
  terms: year.terms.map((term) => {
    const filling = PLANNED_TERMS.find((t) => t.id === term.id)
    const scheduled = PLANNED_SCHEDULED.includes(term.id)
    const added = [
      ...(filling?.codes ?? []).map(plannedCourse),
      ...(filling?.fills ?? []).map(plannedFill),
      ...(filling?.seats ?? []).map(plannedSeat),
    ]
    const held: Term = {
      ...term,
      scheduled: term.locked || scheduled,
      activities: ACTIVITIES[term.id],
      /* Seats last, whatever order they arrived in: a term reads as what has
         been decided, and then what has not. */
      courses: [
        ...term.courses.filter((c) => !c.placeholder),
        ...added.filter((c) => !c.placeholder),
        ...term.courses.filter((c) => c.placeholder),
        ...added.filter((c) => c.placeholder),
      ],
    }
    /* A term whose classes are out has them all: a course put into it by the
       pathway arrives with a sitting, the same as one chosen by hand. */
    return scheduled && !term.locked ? scheduleTerm(held) : held
  }),
}))
