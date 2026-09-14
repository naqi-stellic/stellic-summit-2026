import { REMAINING_REQUIREMENTS, REPLACEMENT_SEAT, type CatalogEntry } from "@/data/catalog"
import {
  CREDITS_PER_COURSE,
  PLANNING_RULES,
  emptyYear,
  findCourse,
  type PlannedCourse,
  type Term,
  type Year,
} from "@/data/plan"

/* A generated draft: the student's plan with the generator's proposal laid over
 * it. Nothing is destroyed — a course the draft wants to move or drop stays on
 * the canvas, struck through, until the draft is accepted or dismissed. */

export type DraftOption = {
  id: string
  label: string
  blurb: string
  /** How full the option packs a term. Every course is CREDITS_PER_COURSE. */
  coursesPerTerm: number
  /** Adds a summer term to each academic year and plans through it. */
  summers: boolean
  /** A course the option cannot leave where the student put it. */
  move?: { courseId: string; toTermId: string; reason: string }
  /** A course the option drops; its requirement comes back as a held seat. */
  drop?: { courseId: string; reason: string }
}

/** The most a term can hold, from the institution's credit ceiling. */
const MAX_COURSES_PER_TERM = Math.floor(PLANNING_RULES.maxCreditsPerTerm / CREDITS_PER_COURSE)
const MIN_COURSES_PER_TERM = 2
/** A guard on extending the plan, not a rule: eight years past the start is
 *  already far beyond any pace worth proposing. */
const MAX_YEARS = 12

/** Three ways to place the same requirements, built around the pace the student
 *  asked for: exactly that, one course heavier with summers, one course lighter.
 *  Answer a different pace and all three move with it. */
export function planOptions(coursesPerTerm: number): DraftOption[] {
  const steady = clamp(coursesPerTerm)
  const sooner = clamp(steady + 1)
  const lighter = clamp(steady - 1)

  return [
    {
      id: "steady",
      label: "Steady pace",
      blurb:
        `${steady} courses a term, the pace you asked for, no summers. Investments runs before ` +
        "Financial Modeling so the prerequisite is met, and the capstone lands in your final term.",
      coursesPerTerm: steady,
      summers: false,
      move: { courseId: "c6", toTermId: "fall-2028", reason: "FIN 340 is its prerequisite" },
    },
    {
      id: "sooner",
      label: "Finish sooner",
      blurb:
        `${sooner} courses a term and a summer term each year. Heavier than you asked for, but it ` +
        "clears the degree sooner.",
      coursesPerTerm: sooner,
      summers: true,
      move: { courseId: "c6", toTermId: "summer-2028", reason: "FIN 340 is its prerequisite" },
    },
    {
      id: "lighter",
      label: "Lighter terms",
      blurb:
        `${lighter} courses a term, which leaves room for work or a co-op. Financial Modeling is ` +
        "not offered late enough to keep, so its requirement is held as an elective seat.",
      coursesPerTerm: lighter,
      summers: false,
      drop: { courseId: "c6", reason: "Not offered again before you graduate" },
    },
  ]
}

function clamp(courses: number): number {
  return Math.max(MIN_COURSES_PER_TERM, Math.min(MAX_COURSES_PER_TERM, courses))
}

export type Draft = {
  optionId: string
  years: Year[]
  /** Courses the draft put on the canvas, placeholders included. */
  added: number
  /** Courses the draft took back out. */
  removed: number
  moved: number
  /** The last term the draft leaves you working in. */
  graduation: string
}

let seq = 0
function draftCourse(entry: CatalogEntry, order: number, note?: string): PlannedCourse {
  return {
    id: `d${(seq += 1)}`,
    code: entry.code,
    name: entry.name,
    credits: CREDITS_PER_COURSE,
    placeholder: entry.placeholder,
    draft: { mark: "added", note: note ?? entry.reason, order },
  }
}

function summerTerm(year: number): Term {
  return {
    id: `summer-${year}`,
    name: `Summer ${year}`,
    window: "Jun - Aug",
    campus: "Main campus",
    reviewed: false,
    state: "planned",
    courses: [],
  }
}

/** Courses that still count towards a term's load — what the draft struck out
 *  does not. */
export function keptCourses(term: Term): PlannedCourse[] {
  return term.courses.filter((c) => c.draft?.mark !== "moved" && c.draft?.mark !== "removed")
}

export function generateDraft(base: Year[], option: DraftOption): Draft {
  seq = 0
  let order = 0

  /* Work on a copy: the student's own plan stays untouched underneath, so
   * dismissing the draft is just throwing this away. */
  let years: Year[] = base.map((year) => ({
    ...year,
    terms: year.terms.map((term) => ({ ...term, courses: [...term.courses] })),
  }))

  if (option.summers) {
    years = years.map((year) => {
      const end = Number(year.label.split("-")[1])
      return year.terms.some((t) => t.id.startsWith("summer-"))
        ? year
        : { ...year, terms: [...year.terms, summerTerm(end)] }
    })
  }

  const queue: CatalogEntry[] = [...REMAINING_REQUIREMENTS]
  let removed = 0
  let moved = 0

  const edit = (termId: string, fn: (term: Term) => Term) => {
    years = years.map((year) => ({
      ...year,
      terms: year.terms.map((term) => (term.id === termId ? fn(term) : term)),
    }))
  }

  /* A dropped course leaves its requirement unmet, so the draft holds a seat
   * for it further down the plan rather than quietly losing it. */
  if (option.drop) {
    const found = findCourse(years, option.drop.courseId)
    if (found && !found.term.locked) {
      removed += 1
      const at = order++
      edit(found.term.id, (term) => ({
        ...term,
        courses: term.courses.map((c) =>
          c.id === option.drop!.courseId
            ? { ...c, draft: { mark: "removed", note: option.drop!.reason, order: at } }
            : c
        ),
      }))
      queue.push(REPLACEMENT_SEAT)
    }
  }

  /* A move leaves a struck-through marker behind, so the student can see where
   * the course went rather than hunting for it. */
  let moving: { course: PlannedCourse; from: string; to: string; reason: string } | null = null
  if (option.move) {
    const found = findCourse(years, option.move.courseId)
    if (found && !found.term.locked) {
      moved += 1
      const at = order++
      moving = {
        course: found.course,
        from: found.term.name,
        to: option.move.toTermId,
        reason: option.move.reason,
      }
      edit(found.term.id, (term) => ({
        ...term,
        courses: term.courses.map((c) =>
          c.id === option.move!.courseId
            ? { ...c, draft: { mark: "moved", note: `Moved to ${termName(years, option.move!.toTermId)}`, order: at } }
            : c
        ),
      }))
    }
  }

  let added = 0

  /* Fills one term to the option's load from the front of the queue. Terms are
   * reached in order, so the queue's own priority — core, then concentration,
   * then general — becomes the order of the plan. */
  const fillTerm = (term: Term): Term => {
    if (term.locked) return term

    const incoming: PlannedCourse[] = []
    if (moving && moving.to === term.id) {
      incoming.push({
        ...moving.course,
        id: `${moving.course.id}-to`,
        draft: {
          mark: "added",
          note: `Moved from ${moving.from} — ${moving.reason}`,
          order: order++,
        },
      })
    }

    let room = option.coursesPerTerm - keptCourses(term).length - incoming.length
    while (room > 0 && queue.length > 0) {
      incoming.push(draftCourse(queue.shift()!, order++))
      added += 1
      room -= 1
    }

    return incoming.length > 0 ? { ...term, courses: [...term.courses, ...incoming] } : term
  }

  years = years.map((year) => ({ ...year, terms: year.terms.map(fillTerm) }))

  /* A light pace needs more years than the plan has. Rather than leaving
   * requirements unplaced, the draft extends the plan — which is the same thing
   * the student would do by hand with "Add Year". */
  while (queue.length > 0 && years.length < MAX_YEARS) {
    const start = Number(years.at(-1)!.label.split("-")[0]) + 1
    const next = emptyYear(start)
    const terms = option.summers ? [...next.terms, summerTerm(start + 1)] : next.terms
    years = [...years, { ...next, terms: terms.map(fillTerm) }]
  }

  return {
    optionId: option.id,
    years,
    added: added + moved,
    removed,
    moved,
    graduation: lastWorkingTerm(years),
  }
}

function termName(years: Year[], termId: string): string {
  for (const year of years) {
    for (const term of year.terms) if (term.id === termId) return term.name
  }
  /* A summer the option is about to add is not on the canvas yet. */
  const [season, year] = termId.split("-")
  return `${season[0].toUpperCase()}${season.slice(1)} ${year}`
}

function lastWorkingTerm(years: Year[]): string {
  let last = "—"
  for (const year of years) {
    for (const term of year.terms) {
      if (keptCourses(term).length > 0) last = term.name
    }
  }
  return last
}

/** Takes the draft: struck-out courses go, marks come off everything else. */
export function acceptDraft(years: Year[]): Year[] {
  return years.map((year) => ({
    ...year,
    terms: year.terms.map((term) => ({
      ...term,
      courses: keptCourses(term).map(({ draft: _draft, ...course }) => course),
    })),
  }))
}

/** What the draft did to one term, in a sentence. */
export function explainTerm(term: Term, option: DraftOption): string {
  const added = term.courses.filter((c) => c.draft?.mark === "added")
  const moved = term.courses.filter((c) => c.draft?.mark === "moved")
  const removed = term.courses.filter((c) => c.draft?.mark === "removed")

  const clauses: string[] = []
  if (added.length > 0) {
    const seats = added.filter((c) => c.placeholder).length
    clauses.push(
      `filled ${added.length} of the ${option.coursesPerTerm} seats this option plans per term` +
        (seats > 0 ? `, ${seats} of them held for a course you pick later` : "")
    )
  }
  /* Only the first letter drops case — term names keep theirs. */
  const uncapitalise = (text: string) => text[0].toLowerCase() + text.slice(1)
  for (const course of moved) clauses.push(`${course.code} ${uncapitalise(course.draft!.note)}`)
  for (const course of removed) {
    clauses.push(`dropped ${course.code} — ${uncapitalise(course.draft!.note)}`)
  }
  if (clauses.length === 0) return "Nothing changed here."

  const sentence = clauses.join("; ")
  return sentence[0].toUpperCase() + sentence.slice(1) + "."
}
