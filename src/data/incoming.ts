import { DUAL_ENROLMENT } from "@/data/audit"

/** Where it came from. One college, named the same on every screen that
 *  mentions it. */
export const TRANSFER_COLLEGE = "Berkshire Community College"

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

/* What was brought in, and it is the same credit every other prototype has
   him carrying: four courses from Berkshire Community College, taken before
   he enrolled. Read from the audit rather than written down again — the
   planner opened from a record derives exactly this list, and two planners
   disagreeing about what a student arrived with is the kind of thing nobody
   notices until it is on a projector. */
export const INCOMING_CREDITS: IncomingGroup[] = [
  {
    /* Named the way the audit names it. Credit earned at a college while
       still at school is dual enrolment, and calling it "Transfer Credits"
       here and "Dual Enrollment" on the record was two names for four
       courses. */
    kind: "Dual Enrollment",
    items: DUAL_ENROLMENT.courses.map((course) => ({
      id: `i-${course.code}`,
      code: course.code,
      name: course.name,
      detail: TRANSFER_COLLEGE,
      credits: course.credits,
    })),
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
