import {
  ALL_ELECTIVES,
  REMAINING_REQUIREMENTS,
  REPLACEMENT_SEAT,
  type CatalogEntry,
} from "@/data/catalog"
import {
  CREDITS_PER_COURSE,
  PLANNING_RULES,
  emptyYear,
  findCourse,
  findTerm,
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
        `${lighter} courses a term, which leaves room for work or a co-op but adds a year. ` +
        "Financial Modeling is not offered late enough to keep, so its requirement is held as an " +
        "elective seat.",
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
  /** Courses it took out of where they were — dropped, or moved elsewhere. */
  removed: number
  /** The last term the draft leaves you working in. */
  graduation: string
}

/** Reads a draft's tallies off the marks themselves, so a change made by hand
 *  counts exactly like one the generator made. `upTo` limits the count to the
 *  cards that have arrived, which is how the tallies climb as a draft lands. */
export function draftTally(years: Year[], upTo = Infinity): { added: number; removed: number } {
  let added = 0
  let removed = 0

  for (const year of years) {
    for (const term of year.terms) {
      for (const course of term.courses) {
        const mark = course.draft
        if (!mark || mark.order >= upTo) continue
        if (mark.mark === "added") {
          added += 1
          /* It is here because it left somewhere else. */
          if (mark.relocated) removed += 1
        } else {
          removed += 1
        }
      }
    }
  }

  return { added, removed }
}

/** The highest order a draft's marks carry, which is how long it takes to land. */
export function draftLength(years: Year[]): number {
  let last = 0
  for (const year of years) {
    for (const term of year.terms) {
      for (const course of term.courses) {
        if (course.draft) last = Math.max(last, course.draft.order)
      }
    }
  }
  return last
}

export function summariseDraft(years: Year[], optionId: string): Draft {
  return { optionId, years, ...draftTally(years), graduation: lastWorkingTerm(years) }
}

/** A catalogue entry on its way into a term. A released course carries the
 *  term it must not go back to, and the card it left behind. */
type QueueEntry = CatalogEntry & { avoid?: string; ghostFor?: string }

let seq = 0
/** When the generator ran. Fixed rather than "now" so the plan reads the same
 *  every time it is shown, like every other date in the data. */
const GENERATED_ON = "15 Sep 2027"

function draftCourse(entry: CatalogEntry, order: number, note?: string): PlannedCourse {
  return {
    id: `d${(seq += 1)}`,
    code: entry.code,
    name: entry.name,
    credits: CREDITS_PER_COURSE,
    placeholder: entry.placeholder,
    /* Nobody has picked a class for these yet, so a room or an instructor
     * would be inventing one. What is known is who put it here. */
    lastActivity: `Added by pathway, ${GENERATED_ON}`,
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

export function generateDraft(
  base: Year[],
  option: DraftOption,
  /** Courses the student did not keep, which the generator may pick up and
   *  place wherever they fit best. */
  released: string[] = []
): Draft {
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

  const edit = (termId: string, fn: (term: Term) => Term) => {
    years = years.map((year) => ({
      ...year,
      terms: year.terms.map((term) => (term.id === termId ? fn(term) : term)),
    }))
  }

  const queue: QueueEntry[] = [...REMAINING_REQUIREMENTS]

  /* A released course leaves its term the way the generator's own moves do —
   * struck through where it was — and goes to the front of the queue to be
   * placed again. `avoid` keeps it from landing back where it started: putting
   * it down where it already was is not a move worth showing. */
  const ghosts: { termId: string; courseId: string; order: number }[] = []
  for (const courseId of released) {
    const found = findCourse(years, courseId)
    if (!found || found.term.locked) continue
    const at = order++
    ghosts.push({ termId: found.term.id, courseId, order: at })
    edit(found.term.id, (term) => ({
      ...term,
      courses: term.courses.map((c) =>
        c.id === courseId
          ? { ...c, draft: { mark: "moved" as const, note: "You left this one open", order: at } }
          : c
      ),
    }))
    queue.unshift({
      code: found.course.code,
      name: found.course.name,
      reason: "You left this one open",
      placeholder: found.course.placeholder,
      avoid: found.term.id,
      ghostFor: courseId,
    })
  }

  /* A dropped course leaves its requirement unmet, so the draft holds a seat
   * for it further down the plan rather than quietly losing it. */
  if (option.drop && !released.includes(option.drop.courseId)) {
    const found = findCourse(years, option.drop.courseId)
    if (found && !found.term.locked) {
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
  if (option.move && !released.includes(option.move.courseId)) {
    const found = findCourse(years, option.move.courseId)
    if (found && !found.term.locked) {
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

  /* Where each released course ended up, for the note left behind. */
  const placed = new Map<string, string>()

  /* Fills one term to the option's load from the front of the queue. Terms are
   * reached in order, so the queue's own priority — core, then concentration,
   * then general — becomes the order of the plan. */
  /* How many elective seats the generator holds rather than fills, term by
   * term from the nearest one out. An elective is the choice worth leaving to
   * the student, and it is worth leaving while there is still time to make it
   * — so the near terms keep room and the far ones get a named course, which
   * is the more useful answer that far ahead. */
  const SEATS_BY_TERM = [2, 1, 1]
  let reached = 0

  const fillTerm = (term: Term): Term => {
    if (term.locked) return term
    const hold = SEATS_BY_TERM[reached] ?? 0
    reached += 1

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

    if (hold > 0) {
      for (let held = 0; held < hold && room > 0; held += 1) {
        const seat = queue.findIndex((entry) => entry.placeholder && entry.avoid !== term.id)
        if (seat === -1) break
        const [entry] = queue.splice(seat, 1)
        incoming.push(draftCourse(entry, order++))
        room -= 1
      }
    }

    while (room > 0) {
      /* The first entry that is allowed to be here. */
      const next = queue.findIndex((entry) => entry.avoid !== term.id)
      if (next === -1) break
      const [entry] = queue.splice(next, 1)
      if (entry.ghostFor) placed.set(entry.ghostFor, term.name)
      incoming.push(draftCourse(entry, order++))
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

  /* Now that the placement is known, the card left behind can say where its
   * course went. One that found no room anywhere is not struck out at all —
   * nothing happened to it. */
  for (const ghost of ghosts) {
    const to = placed.get(ghost.courseId)
    edit(ghost.termId, (term) => ({
      ...term,
      courses: term.courses.map((c) =>
        c.id !== ghost.courseId
          ? c
          : to
            ? { ...c, draft: { mark: "moved" as const, note: `Moved to ${to}`, order: ghost.order } }
            : { ...c, draft: undefined }
      ),
    }))
  }

  return summariseDraft(years, option.id)
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

/** Fills one term to a credit target, leaving the rest of the plan alone. The
 *  same draft the plan generator makes — added cards, a tally, an Apply — only
 *  the scope is a term rather than the whole degree. Courses the student
 *  released are struck out and their requirements go back on the queue, so the
 *  term can be rebuilt around what was kept. */
export function generateTermDraft(
  base: Year[],
  termId: string,
  targetCredits: number,
  released: string[] = [],
  optionId: string = TERM_OPTIONS[0].id
): Draft {
  seq = 0
  let order = 0

  let years: Year[] = base.map((year) => ({
    ...year,
    terms: year.terms.map((term) => ({ ...term, courses: [...term.courses] })),
  }))

  const queue: QueueEntry[] = termQueue(optionId, base)

  /* A held seat is the whole point of generating: it is a requirement with no
   * course against it, and the run is what chooses one. Striking it here frees
   * its credits, and the fill below puts a real course in its place. */
  for (const term of years.flatMap((y) => y.terms)) {
    if (term.id !== termId || term.locked) continue
    for (const course of term.courses) {
      if (!course.placeholder || released.includes(course.id)) continue
      const at = order++
      years = mapTerm(years, termId, (t) => ({
        ...t,
        courses: t.courses.map((c) =>
          c.id === course.id
            ? { ...c, draft: { mark: "removed" as const, note: "Filled with a course", order: at } }
            : c
        ),
      }))
    }
  }

  /* Anything let go leaves a struck card behind and its requirement returns to
   * the front of the queue, where the term may well pick it up again. */
  for (const courseId of released) {
    const found = findCourse(years, courseId)
    if (!found || found.term.id !== termId) continue
    const at = order++
    years = mapTerm(years, termId, (term) => ({
      ...term,
      courses: term.courses.map((c) =>
        c.id === courseId
          ? { ...c, draft: { mark: "removed" as const, note: "You left this one open", order: at } }
          : c
      ),
    }))
    if (!found.course.placeholder) {
      queue.unshift({
        code: found.course.code,
        name: found.course.name,
        reason: "You left this one open",
      })
    }
  }

  years = mapTerm(years, termId, (term) => {
    if (term.locked) return term
    const kept = keptCourses(term).reduce((n, c) => n + c.credits, 0)
    const room = Math.floor((targetCredits - kept) / CREDITS_PER_COURSE)

    const incoming: PlannedCourse[] = []
    for (let i = 0; i < room && queue.length > 0; i += 1) {
      incoming.push(draftCourse(queue.shift()!, order++))
    }
    return incoming.length > 0 ? { ...term, courses: [...term.courses, ...incoming] } : term
  })

  return summariseDraft(years, optionId)
}

/* Three ways to fill the same term to the same target. The load does not
 * change — that is the target the student set — so what differs is which of
 * the outstanding requirements gets taken first. */
export const TERM_OPTIONS: DraftOption[] = [
  {
    id: "term-core",
    label: "Core first",
    blurb:
      "Takes the business core before anything else, which is the order the requirements " +
      "are meant to be met in and keeps later terms free of prerequisites.",
    coursesPerTerm: 0,
    summers: false,
  },
  {
    id: "term-mixed",
    label: "A bit of each",
    blurb:
      "Alternates core, concentration and general education, so no single term is all of " +
      "one thing and the workload stays even.",
    coursesPerTerm: 0,
    summers: false,
  },
  {
    id: "term-general",
    label: "General education first",
    blurb:
      "Clears the general education requirements now and leaves the term free for the " +
      "concentration later, when more of it is on offer.",
    coursesPerTerm: 0,
    summers: false,
  },
]

/** What a term can still be filled with, ordered the way an option wants it
 *  taken. Held seats are left out on purpose: generating a term is meant to
 *  end with a term of real courses, so a seat is something to resolve rather
 *  than something to add. Anything already somewhere in the plan is out too,
 *  or the term would offer a course the student is taking elsewhere. */
function termQueue(optionId: string, years: Year[]): QueueEntry[] {
  const placed = new Set<string>()
  for (const year of years) {
    for (const term of year.terms) {
      for (const course of term.courses) placed.add(`${course.code} ${course.name}`)
    }
  }

  /* Requirements still outstanding, then the courses an elective seat can be
   * filled with. The electives are rotated per option, so the three runs
   * resolve the same seat differently — which is the choice being offered. */
  const turn = Math.max(0, TERM_OPTIONS.findIndex((o) => o.id === optionId))
  const electives = ALL_ELECTIVES.filter((e) => !placed.has(`${e.code} ${e.name}`))
  const rotated = [...electives.slice(turn * 2), ...electives.slice(0, turn * 2)]

  const all = [
    ...addableCourses(years).filter((entry) => !entry.placeholder),
    ...rotated,
  ]
  if (optionId === "term-general") {
    const general = all.filter((e) => /general|elective/i.test(e.reason))
    return [...general, ...all.filter((e) => !general.includes(e))]
  }
  if (optionId === "term-mixed") {
    /* Deal them out one from each reason in turn, so a term takes a spread
     * rather than the first five of one kind. */
    const groups = new Map<string, QueueEntry[]>()
    for (const entry of all) {
      const list = groups.get(entry.reason) ?? []
      list.push(entry)
      groups.set(entry.reason, list)
    }
    const lists = [...groups.values()]
    const out: QueueEntry[] = []
    for (let i = 0; out.length < all.length; i += 1) {
      for (const list of lists) if (list[i]) out.push(list[i])
    }
    return out
  }
  return all
}

/* ------------------------------------------------- changing a draft by hand

   The playground is the planner: courses can be moved, dropped and added
   while a draft is up. Every hand edit leaves the same marks the generator
   leaves, which is what lets the tallies and the canvas agree. */

function mapTerm(years: Year[], termId: string, fn: (term: Term) => Term): Year[] {
  return years.map((year) => ({
    ...year,
    terms: year.terms.map((term) => (term.id === termId ? fn(term) : term)),
  }))
}

/** Moves a course inside a draft. Within a term it is a reorder and nothing is
 *  marked; across terms the card arrives green, saying where it came from. */
export function moveInDraft(
  years: Year[],
  courseId: string,
  toTermId: string,
  toIndex?: number
): Year[] {
  const from = findCourse(years, courseId)
  const to = findTerm(years, toTermId)
  if (!from || !to || from.term.locked || to.locked) return years
  /* What the draft struck out is on its way off the plan, not up for moving. */
  if (from.course.draft?.mark === "moved" || from.course.draft?.mark === "removed") return years

  if (from.term.id === to.id) {
    if (toIndex === undefined || toIndex === from.index) return years
    return mapTerm(years, to.id, (term) => {
      const rest = term.courses.filter((c) => c.id !== courseId)
      return { ...term, courses: [...rest.slice(0, toIndex), from.course, ...rest.slice(toIndex)] }
    })
  }

  const moved: PlannedCourse = {
    ...from.course,
    draft: {
      mark: "added",
      note: `You moved this here from ${from.term.name}`,
      order: 0,
      /* A course that was already in the plan leaves a hole behind it. One the
       * draft had added is only being rearranged. */
      relocated: from.course.draft ? from.course.draft.relocated : true,
    },
  }

  const without = mapTerm(years, from.term.id, (term) => ({
    ...term,
    courses: term.courses.filter((c) => c.id !== courseId),
  }))

  return mapTerm(without, to.id, (term) => {
    const at = toIndex ?? term.courses.length
    return { ...term, courses: [...term.courses.slice(0, at), moved, ...term.courses.slice(at)] }
  })
}

/** Drops a course from a draft. One the draft itself added simply goes; one
 *  that was already in the plan is struck through instead, so the change stays
 *  visible until the draft is settled. */
export function removeInDraft(years: Year[], courseId: string): Year[] {
  const found = findCourse(years, courseId)
  if (!found || found.term.locked) return years

  const mark = found.course.draft
  if (mark?.mark === "added" && !mark.relocated) {
    return mapTerm(years, found.term.id, (term) => ({
      ...term,
      courses: term.courses.filter((c) => c.id !== courseId),
    }))
  }

  return mapTerm(years, found.term.id, (term) => ({
    ...term,
    courses: term.courses.map((c) =>
      c.id === courseId
        ? { ...c, draft: { mark: "removed" as const, note: "You removed this", order: 0 } }
        : c
    ),
  }))
}

/** Adds a course to a term. `marked` is false on the plan proper, where an
 *  addition is just a course rather than a proposal. */
export function addCourse(
  years: Year[],
  termId: string,
  entry: CatalogEntry,
  marked: boolean
): Year[] {
  const term = findTerm(years, termId)
  if (!term || term.locked) return years

  const course: PlannedCourse = {
    id: `u${(seq += 1)}`,
    code: entry.code,
    name: entry.name,
    credits: CREDITS_PER_COURSE,
    placeholder: entry.placeholder,
    lastActivity: `Added by you, ${GENERATED_ON}`,
    ...(marked ? { draft: { mark: "added" as const, note: "You added this", order: 0 } } : {}),
  }

  return mapTerm(years, termId, (t) => ({ ...t, courses: [...t.courses, course] }))
}

/** Requirements the plan is not holding a place for, which is what there is to
 *  add. The seat comes last: it is the answer when nothing specific is left. */
export function addableCourses(years: Year[]): CatalogEntry[] {
  const placed = new Set<string>()
  for (const year of years) {
    for (const term of year.terms) {
      for (const course of term.courses) {
        if (course.draft?.mark !== "removed") placed.add(`${course.code} ${course.name}`)
      }
    }
  }

  const unplaced = REMAINING_REQUIREMENTS.filter(
    /* A seat is a placeholder for a requirement, not a course: holding one
     * does not use it up. */
    (entry) => entry.placeholder || !placed.has(`${entry.code} ${entry.name}`)
  )
  return [...unplaced, REPLACEMENT_SEAT]
}
