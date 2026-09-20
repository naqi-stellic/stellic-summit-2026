import { offeredIn, type TermName } from "@/data/catalog"
import { prerequisiteCodes } from "@/data/course-detail"
import type { PlannedCourse, Term, Year } from "@/data/plan"

/* What a term is waiting on. A course can be short of three things, and they
 * are worth telling apart: it has no class yet, something it depends on comes
 * after it, or it does not run in this term at all. The first is settled from
 * the term itself; the other two are only visible against the whole plan,
 * which is why they are read here rather than off a term. */

export type TermIssue = {
  course: PlannedCourse
  kind: "section" | "prereq" | "offering"
  says: string
  /** Offered only where there is something to press. */
  action?: string
}

/** Which of the year's terms this is, by its id. */
export function seasonOf(term: Term): TermName {
  if (term.id.startsWith("spring")) return "Spring"
  if (term.id.startsWith("summer")) return "Summer"
  return "Fall"
}

/** Every term in the plan, in the order they are taken. */
function order(years: Year[]): Term[] {
  return years.flatMap((year) => year.terms)
}

export function termIssues(term: Term, years: Year[]): TermIssue[] {
  /* A term nobody has scheduled yet is not waiting on anything: it is further
     out than the catalogue reaches. A term already taken is done with. */
  if (term.locked) return []

  const terms = order(years)
  const at = terms.findIndex((t) => t.id === term.id)
  const season = seasonOf(term)
  const issues: TermIssue[] = []

  for (const course of term.courses) {
    /* A seat is a requirement with no course against it. That is a thing the
       plan is waiting for, but not a thing to warn about — it is plain from
       the seat itself, and calling it an error only invites the argument. */
    if (course.placeholder || course.draft != null) continue

    /* Where a class has to be chosen, that is the first thing to say. */
    if (term.scheduled && !course.section) {
      issues.push({
        course,
        kind: "section",
        says: "No section selected.",
        action: "Search sections",
      })
      continue
    }

    /* Something it depends on, sitting after it. Anything not in the plan at
       all is the remaining list's business rather than this term's. */
    const needs = prerequisiteCodes(course.code)
    const late = terms
      .map((t, i) => ({ t, i }))
      .find(({ t, i }) => i >= at && t.courses.some((c) => !c.placeholder && needs.includes(c.code)))
    if (late && late.i >= at) {
      const held = late.t.courses.find((c) => !c.placeholder && needs.includes(c.code))!
      issues.push({
        course,
        kind: "prereq",
        says:
          late.i === at
            ? `${held.code} is its prerequisite and is in the same term.`
            : `${held.code} is its prerequisite and comes later, in ${late.t.name}.`,
      })
      continue
    }

    /* And whether it runs at all in the term it has been put in. */
    if (!offeredIn(course.code).includes(season)) {
      const runs = offeredIn(course.code)
      issues.push({
        course,
        kind: "offering",
        says: `Not offered in ${season} — runs in ${runs.join(" and ")}.`,
      })
    }
  }

  return issues
}
