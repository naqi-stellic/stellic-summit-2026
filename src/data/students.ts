import { AUDIT_STUDENT } from "@/data/audit"

/* The student search: the way a staff member finds anybody.
 *
 * Every other staff screen here opens on one student already chosen. This is
 * the screen before that, and it is the one that says what the product is for
 * — an institution of eighteen hundred people, narrowed by whatever question
 * you happen to be asking today.
 *
 * Built from a screenshot of the product rather than from a frame, so the
 * shape is the real one: keywords on the left, the filters that exist on the
 * right, what is applied under both, the reports somebody saved, and then the
 * cohort with its progress read at a glance. */

/** The filters the product offers, in the order it offers them. They are
 *  drawn and named and none of them opens — what matters on this screen is
 *  how many ways in there are, not what is behind any one of them. */
export const FILTERS = [
  "Demographics",
  "Programs",
  "Performance",
  "Advisors",
  "Graduation",
  "Remaining",
  "Planned",
  "Taken",
  "Unmatched",
  "Plan Reviews",
  "Canvas",
  "Status",
  "Notes",
  "Campaigns",
  "Pathways",
  "Appointments",
  "Requests",
  "Interests",
  "Enrollment",
  "Transfers",
]

/** What is narrowing the list right now. Each one is a student the search has
 *  been pointed at by name. */
export const APPLIED = [
  { name: "Eric Acosta", username: "eacosta" },
  { name: "Scott Abott", username: "sabott" },
  { name: "Shawn Acosta", username: "sacosta" },
  { name: "Susan Barton", username: "sbarton" },
]

export type SavedReport = {
  name: string
  /** How many the report returns, where it has been run. */
  count?: string
  /** Stellic is watching the number and will say when it moves. */
  tracked?: boolean
}

export const SAVED_REPORTS: SavedReport[] = [
  { name: "All students" },
  { name: "Registered Courses for Fall 2026", count: "1854 students", tracked: true },
  { name: "At Risk Students in FIN", count: "2 students" },
  { name: "Students who have not Registered for Next term", count: "1 students" },
]

/* ---------------------------------------------------------------- roster */

/** The three shares a meter reads: done, under way, and still wanted. A share
 *  of nothing is left off the legend rather than written as a zero. */
export type Meter = { done: number; inProgress: number; remaining: number }

export type Enrolment = {
  name: string
  /** Declared is the ordinary case; the badge is for the one that is not. */
  declared?: false
}

export type Student = {
  username: string
  name: string
  standing: string
  /** Out of five, as the record reads it. */
  engage: number
  photo?: string
  programs: Enrolment[]
  cgpa: string
  courses: Meter
  milestones: Meter
  /** The one thing wrong with this record, where there is one. */
  alert?: string
}

/** How many the institution has, against how many are on screen. The number is
 *  the point: the list is a sample of a cohort, not the cohort. */
export const ROSTER_TOTAL = 1854

export const ROSTER: Student[] = [
  {
    username: AUDIT_STUDENT.username,
    name: AUDIT_STUDENT.name,
    standing: AUDIT_STUDENT.standing,
    engage: AUDIT_STUDENT.engage.lit,
    photo: AUDIT_STUDENT.photo,
    programs: [
      { name: "Business Administration, B.S. (Finance)" },
      { name: "Data Analytics [minor]" },
    ],
    cgpa: "3.38",
    courses: { done: 10, inProgress: 5, remaining: 25 },
    milestones: { done: 1, inProgress: 0, remaining: 2 },
    alert: "6 credits short of NCAA progress",
  },
  {
    username: "aosei",
    name: "Amara Osei",
    standing: "Junior",
    engage: 4,
    programs: [{ name: "Political Science, B.A." }],
    cgpa: "2.81",
    courses: { done: 24, inProgress: 6, remaining: 10 },
    milestones: { done: 2, inProgress: 0, remaining: 1 },
  },
  {
    username: "jmiller",
    name: "Jonah Miller",
    standing: "Sophomore",
    engage: 3,
    programs: [{ name: "Computer Science, B.S." }, { name: "Mathematics", declared: false }],
    cgpa: "3.12",
    courses: { done: 18, inProgress: 5, remaining: 17 },
    milestones: { done: 1, inProgress: 1, remaining: 1 },
    alert: "Planned course not offered",
  },
  {
    username: "syildiz",
    name: "Selin Yıldız",
    standing: "Junior",
    engage: 5,
    programs: [{ name: "Biology, B.S." }],
    cgpa: "3.64",
    courses: { done: 26, inProgress: 6, remaining: 8 },
    milestones: { done: 2, inProgress: 0, remaining: 1 },
  },
  {
    username: "twren",
    name: "Tobias Wren",
    standing: "Senior",
    engage: 2,
    programs: [{ name: "Graphic Design, B.F.A." }],
    cgpa: "2.94",
    courses: { done: 33, inProgress: 6, remaining: 1 },
    milestones: { done: 2, inProgress: 1, remaining: 0 },
    alert: "No graduation application on file",
  },
  {
    username: "dramos",
    name: "Diego Ramos",
    standing: "Senior",
    engage: 4,
    programs: [{ name: "Computer Science, B.S." }],
    cgpa: "3.41",
    courses: { done: 38, inProgress: 2, remaining: 0 },
    milestones: { done: 3, inProgress: 0, remaining: 0 },
  },
  {
    username: "falamin",
    name: "Farah Al-Amin",
    standing: "Senior",
    engage: 3,
    programs: [{ name: "Biology, B.S." }],
    cgpa: "3.28",
    courses: { done: 36, inProgress: 2, remaining: 2 },
    milestones: { done: 2, inProgress: 1, remaining: 0 },
  },
  {
    username: "rnakamura",
    name: "Ryo Nakamura",
    standing: "Freshman",
    engage: 2,
    programs: [
      { name: "Computer Science, B.S." },
      { name: "Business Administration", declared: false },
    ],
    cgpa: "3.05",
    courses: { done: 5, inProgress: 5, remaining: 30 },
    milestones: { done: 0, inProgress: 1, remaining: 2 },
  },
]

/** How the list reads the cohort. Only the first is drawn; the rest are named
 *  because the choice is the point — the same students, measured differently. */
export const ROSTER_VIEWS = [
  "Planned Progress View",
  "Official Progress View",
  "Registration View",
  "Advising View",
]
