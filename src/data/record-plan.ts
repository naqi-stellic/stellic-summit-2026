import { AUDIT, CURRENT_TERM, DUAL_ENROLMENT, type AuditEntry, type AuditMark } from "@/data/audit"
import type { IncomingGroup } from "@/data/incoming"
import { emptyYear, type PlannedCourse, type Year } from "@/data/plan"

/* The plan as this student's record has it.
 *
 * Team Plan's prototypes open on a plan of their own, and that is fine: they
 * are about the plan. This one is about the record, and a staff member who
 * opens Plans from a student's audit has to find the same student on the other
 * side of the click — the same term under way, holding the same five courses
 * the audit says are in progress.
 *
 * So it is derived rather than written down. The audit already knows which
 * courses are under way, which are registered and which are only planned; this
 * reads those marks and lays them out in terms. The two cannot drift, because
 * there is only one of them. */

/** Where a course sits in the plan follows from how the audit marks it. */
const TERM_OF: Partial<Record<AuditMark, "now" | "next">> = {
  "in-progress": "now",
  registered: "next",
  planned: "next",
}

type Found = { code: string; name: string; mark: AuditMark }

/** Every course the audit has put somewhere, in the order the tree holds them.
 *  Additional checks are stepped over — they re-list courses counted already,
 *  and a plan that showed a course twice would be wrong about the term. */
function scheduled(): Found[] {
  const found: Found[] = []
  const seen = new Set<string>()

  const walk = (entry: AuditEntry) => {
    if (entry.kind === "milestone") return
    if (entry.kind === "course") {
      if (!entry.code || seen.has(entry.code) || !TERM_OF[entry.mark]) return
      seen.add(entry.code)
      found.push({ code: entry.code, name: entry.name, mark: entry.mark })
      return
    }
    if (entry.restated) return
    entry.children.forEach(walk)
  }
  walk(AUDIT)

  return found
}

/** Course colours, handed out in order. A term of six is the most the credit
 *  ceiling allows, which is why there are six of them. */
const ACCENTS = ["purple", "green", "amber", "teal", "brown", "rose"] as const

const card = (found: Found, i: number, settled: boolean): PlannedCourse => ({
  id: `r${i}`,
  code: found.code,
  name: found.name,
  credits: 3,
  section: "Lec-01",
  accent: ACCENTS[i % ACCENTS.length],
  registered: settled,
  campus: "Main",
  modality: "In Person",
  gradeOption: "Graded",
  lastActivity: "Added by pathway, 3 Apr 2025",
})

/** The year the student is in, then the years ahead of them. The term under way
 *  takes its name from the record, so the plan and the term strip above it are
 *  naming the same term. */
export function recordPlan(): Year[] {
  const courses = scheduled()
  const now = courses.filter((course) => TERM_OF[course.mark] === "now")
  const next = courses.filter((course) => TERM_OF[course.mark] === "next")

  /* Fall 2026 → Spring 2027: the term under way and the one after it. */
  const start = Number(CURRENT_TERM.name.split(" ")[1])

  return [
    {
      label: `${start}-${start + 1}`,
      phase: "active",
      terms: [
        {
          id: `fall-${start}`,
          name: CURRENT_TERM.name,
          window: "Sep - Dec",
          campus: "Main campus",
          reviewed: true,
          /* Under way, so every class has been chosen and nothing moves. */
          locked: true,
          scheduled: true,
          state: "registered",
          courses: now.map((course, i) => card(course, i, true)),
        },
        {
          id: `spring-${start + 1}`,
          name: `Spring ${start + 1}`,
          window: "Jan - May",
          campus: "Main campus",
          reviewed: false,
          state: "planned",
          alert: { kind: "registration", closes: `Mon Jan 18, ${start + 1} • 11:59pm EST` },
          courses: [
            ...next.map((course, i) => card(course, now.length + i, course.mark === "registered")),
            /* The seat the audit is still holding open: a requirement with no
               course chosen for it, which is what a placeholder is for. */
            {
              id: "r-seat",
              code: "",
              name: "Finance elective",
              credits: 3,
              placeholder: true,
              seat: { code: "", name: "Finance elective" },
            },
          ],
        },
      ],
    },
    emptyYear(start + 1),
    emptyYear(start + 2),
    emptyYear(start + 3),
  ]
}

/** What the student arrived with, as the record has it. The audit calls this
 *  the unmatched list — credit the degree asked for none of — and the planner
 *  calls it incoming. Same four courses either way, so they read it from the
 *  same place. */
export function recordIncoming(): IncomingGroup[] {
  return [
    {
      kind: "Dual Enrollment",
      items: DUAL_ENROLMENT.courses.map((course) => ({
        id: `i-${course.code}`,
        code: course.code,
        name: course.name,
        detail: "Taken before enrollment",
        credits: course.credits,
      })),
    },
  ]
}
