/* Credit the student arrived with. It is not a year and it is not a term —
 * nothing here was taken on a timetable this plan knows about — so it is kept
 * as what it is: three kinds of incoming credit, each from somewhere. */

export type IncomingCredit = {
  id: string
  code: string
  name: string
  /** The one fact worth reading after the name: which exam it came from, what
   *  it satisfies, when it was taken. Whichever is the useful one for a kind. */
  detail: string
  credits: number
}

export type IncomingGroup = {
  /** What kind of credit this is — the card's name. */
  kind: string
  /** Where it came from — the institution, the board, the arrangement. */
  source: string
  items: IncomingCredit[]
}

export const INCOMING_CREDITS: IncomingGroup[] = [
  {
    kind: "Transfer Credits",
    source: "Mesa Community College",
    items: [
      {
        id: "t1",
        code: "ENGL 100",
        name: "Academic Writing Basics",
        detail: "General education",
        credits: 3,
      },
      {
        id: "t2",
        code: "MATH 110",
        name: "College Algebra",
        detail: "Quantitative reasoning",
        credits: 3,
      },
    ],
  },
  {
    kind: "Exam Credits",
    source: "College Board",
    items: [
      {
        id: "x1",
        code: "MATH 140",
        name: "Business Calculus",
        detail: "AP Calculus BC",
        credits: 3,
      },
      {
        id: "x2",
        code: "HIST 101",
        name: "United States History I",
        detail: "AP US History",
        credits: 3,
      },
    ],
  },
  {
    kind: "Pre-Year 1",
    source: "Dual enrolment",
    items: [
      {
        id: "p1",
        code: "SPAN 101",
        name: "Elementary Spanish I",
        detail: "Taken Fall 2024",
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
