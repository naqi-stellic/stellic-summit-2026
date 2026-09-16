/* Credit the student arrived with. It is not a year and it is not a term —
 * nothing here was taken on a timetable this plan knows about — so it is kept
 * as what it is: three kinds of incoming credit, each from somewhere. */

export type IncomingCredit = {
  id: string
  /** The quiet line above the name. A course's own code where it has one; for
   *  an exam, whoever set it — there is no course code to give. */
  code: string
  name: string
  /** The line under the name, where there is one to give: the college the
   *  credit transferred from, the score the exam was passed at. A course taken
   *  at this campus has neither, and reads like any other course of ours. */
  detail?: string
  credits: number
}

export type IncomingGroup = {
  /** What kind of credit this is — the card's name. */
  kind: string
  items: IncomingCredit[]
}

/* What was brought in, as it was brought in: the courses another college
 * taught and the exams a board set, not the courses of ours they stand for.
 * Which of ours they answer to is the audit's business, not the planner's.
 * Two kinds only — what came from elsewhere, and what was taken here before
 * the first year began. */
export const INCOMING_CREDITS: IncomingGroup[] = [
  {
    /* Everything brought in from elsewhere, whoever it came from: a college
       that taught it or a board that examined it. Where it came from is the
       line under the name, which is what tells the two apart. */
    kind: "Transfer Credits",
    items: [
      {
        id: "t1",
        code: "ENG 101",
        name: "English Composition I",
        detail: "Mesa Community College",
        credits: 3,
      },
      {
        id: "t2",
        code: "MAT 151",
        name: "College Algebra",
        detail: "Mesa Community College",
        credits: 3,
      },
      {
        id: "x1",
        code: "College Board",
        name: "AP Calculus BC",
        detail: "Score 5",
        credits: 3,
      },
      {
        id: "x2",
        code: "College Board",
        name: "AP US History",
        detail: "Score 4",
        credits: 3,
      },
    ],
  },
  {
    /* Courses of this campus, taken before the first year began. They read the
       way every other course of ours reads, minus the class: which sitting of
       it you attended is not something the plan keeps this far back. */
    kind: "Pre-Year 1",
    items: [
      {
        id: "p1",
        code: "SPAN 101",
        name: "Elementary Spanish I",
        credits: 3,
      },
    ],
  },
]

export function groupCredits(group: IncomingGroup): number {
  return group.items.reduce((sum, item) => sum + item.credits, 0)
}

/** What the whole section comes to: the line the heading reads, and the one
 *  inside it above the cards. */
export function incomingTotals(groups: IncomingGroup[] = INCOMING_CREDITS) {
  const items = groups.reduce((n, group) => n + group.items.length, 0)
  const credits = groups.reduce((n, group) => n + groupCredits(group), 0)
  return { items, credits, sources: groups.length }
}
