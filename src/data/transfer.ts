/* Explore Transfer Credits: what a prospective transfer student brings, and
 * what it is worth here.
 *
 * Nobody in this file has applied yet. There is no student record to read, so
 * everything the screen knows comes from one uploaded transcript and three
 * questions — which is why the data is shaped as a *submission* rather than as
 * a profile: transcripts the visitor added, courses read off them, and a
 * verdict per course.
 *
 * The verdicts are the whole point. A degree audit answers "what does the
 * degree still want"; this answers "does what I already did count", before
 * anyone commits to finding out officially. So a course carries an
 * **equivalent** when it articulates to something here, and carries nothing
 * when it does not — and the difference between `pending` and `none` is the
 * difference between "a human still has to look" and "we looked". */

import { DUAL_ENROLMENT } from "@/data/audit"
import { ARTICULATIONS } from "@/data/staff-insights"

/** The two the transfer office has not settled yet, read from the insights
 *  they appear in rather than named twice. */
const PENDING_REVIEW = ARTICULATIONS.slice(0, 2)

export const UNIVERSITY = "Stellic University"

/** What it is called in running text, where the full name would be the longest
 *  thing in the sentence. */
export const UNIVERSITY_SHORT = "Stellic"

/** Whoever is asking. They are a visitor, not a student: an email and nothing
 *  else, which is exactly what the landing screen promised to ask for. */
/* The same student the rest of the prototypes follow, two years earlier.
 * Prospective Student Lite is Scott before he enrolled — which is why the
 * address is a personal one: he has no account here yet, and the credit he is
 * asking about is the credit his audit will later call dual enrolment. */
export const VISITOR = {
  name: "Scott Abott",
  email: "scott.abott@gmail.com",
  initials: "SA",
}

/* ---- Transcripts ---------------------------------------------------- */

/** College credits come from an institution; examination credits come from a
 *  board. Same flow, same alert, different noun — so the kind travels with the
 *  transcript rather than being inferred from whether `institution` is set. */
export type CreditKind = "college" | "exam"

export type Transcript = {
  id: string
  kind: CreditKind
  /** What the rail calls it: the institution, or the exam board. */
  name: string
  file: string
}

export const CREDIT_KINDS: Array<{
  kind: CreditKind
  icon: "school" | "fact-check"
  title: string
  description: string
}> = [
  {
    kind: "college",
    icon: "school",
    title: "College credits",
    description: "Credits from universities or community colleges",
  },
  {
    kind: "exam",
    icon: "fact-check",
    title: "Examination credits",
    description: "AP, IB, CLEP, AICE, DSST and other exams",
  },
]

/** Enough institutions for the search to be a search. Berkshire Community
 *  College is the one this flow picks, and the one the courses below came
 *  from — the same college the Transfers insights are about, so the two
 *  prototypes are describing one transcript rather than two. */
export const INSTITUTIONS = [
  "Cambridge College",
  "Cambridge Community College",
  "Camden County College",
  "Bay State College",
  "Berkshire Community College",
  "Holyoke Community College",
  "Middlesex Community College",
  "Quinsigamond Community College",
]

/** The board a set of examination credits comes from. The prototype takes the
 *  first; the master flow puts a select here. */
export const EXAM_BOARD = "AP Credits"

export const UPLOADED_FILE = "transcript.pdf"

/* ---- What the transcript was worth ---------------------------------- */

export type Verdict = "confirmed" | "pending" | "none"

export type TransferCourse = {
  code: string
  name: string
  term: string
  credits: number
  grade: string
  verdict: Verdict
  /** What it articulates to here. Only a confirmed course has one — that is
   *  what makes it confirmed. */
  equivalent?: { code: string; name: string; credits: number; grade: string }
}

/* Scott's transcript, and it is the one his audit already knows about.
 *
 * Four of these were confirmed and became the twelve credits of dual enrolment
 * the degree audit carries; two are still pending, which is exactly why a
 * transfer officer is looking at them in Transfer Insights; one answers to
 * nothing here. Both ends are read from where they already live — the granted
 * courses from the audit, the pending pair from the articulations — so a
 * prospective student, a staff member and a degree audit cannot end up
 * describing different transcripts.
 *
 * Berkshire numbers its courses and this university names its own, which is
 * why the two columns read differently: the left is what they taught, the
 * right is what it is worth here. */

const CONFIRMED_SOURCE: Record<string, { code: string; name: string; term: string }> = {
  "MATH 110": { code: "21-1010", name: "Introductory Algebra", term: "Fall 2024" },
  "ENGL 100": { code: "21-1100", name: "Composition I", term: "Fall 2024" },
  "HIST 101": { code: "21-2200", name: "United States History I", term: "Spring 2025" },
  "SPAN 101": { code: "21-1500", name: "Spanish I", term: "Spring 2025" },
}

export const TRANSFER_COURSES: TransferCourse[] = [
  ...DUAL_ENROLMENT.courses.map((granted) => {
    const source = CONFIRMED_SOURCE[granted.code]
    return {
      code: source.code,
      name: source.name,
      term: source.term,
      credits: granted.credits,
      grade: granted.grade ?? "",
      verdict: "confirmed" as const,
      equivalent: {
        code: granted.code,
        name: granted.name,
        credits: granted.credits,
        grade: granted.grade ?? "",
      },
    }
  }),
  /* No equivalent has been agreed, so it is nobody's call but a human's. That
     is the whole of what "pending review" means here — and these two are the
     ones the transfer office has 62 other students waiting on. */
  ...PENDING_REVIEW.map((row, i) => ({
    code: row.from.code,
    name: row.from.name,
    term: i === 0 ? "Fall 2024" : "Spring 2025",
    credits: i === 0 ? 6 : 4,
    grade: i === 0 ? "B" : "B+",
    verdict: "pending" as const,
  })),
  /* The elective that does not count: nothing wrong with it, nothing here
     that it answers to. */
  {
    code: "21-3300",
    name: "World History I",
    term: "Fall 2024",
    credits: 3,
    grade: "C",
    verdict: "none",
  },
]

/** The three headings on the results card, in the order the verdict reads
 *  best: what you have, what is still being decided, what you do not. */
export const VERDICT_SECTIONS: Array<{ verdict: Verdict; label: string }> = [
  { verdict: "confirmed", label: "Confirmed" },
  { verdict: "pending", label: "Pending review" },
  { verdict: "none", label: "No credit" },
]

export function creditsBy(verdict: Verdict) {
  return TRANSFER_COURSES.filter((course) => course.verdict === verdict).reduce(
    (total, course) => total + course.credits,
    0
  )
}

export const TOTAL_CREDITS = TRANSFER_COURSES.reduce(
  (total, course) => total + course.credits,
  0
)

/* ---- The three questions -------------------------------------------- */

/** Asked while the transcript is being read, which is the only reason they are
 *  on this screen at all: the wait is long enough to fill, and the answers are
 *  what turn a credit count into a recommendation. All three are skippable. */
export const PROFILE_QUESTIONS = [
  {
    id: "level",
    label: "What level are you studying for?",
    options: ["Undergraduate", "Postgraduate"],
  },
  {
    id: "start",
    label: "When do you plan to start?",
    options: ["This year", "Next year", "Just exploring"],
  },
] as const

export const INTERESTS = [
  "Data Science",
  "Graphic Design",
  "Environmental Studies",
  "Business Analytics",
  "Psychology",
  "Digital Marketing",
  "Game Development",
  "Social Media Management",
  "Artificial Intelligence",
  "Public Health",
]

/* ---- What we do with the answers ------------------------------------ */

/** Every program says why it is here. A recommendation with no reason beside
 *  it is a guess, and the badges are the only place the three questions and
 *  the credit count are visibly doing any work. */
export const PROGRAMS = [
  { name: "BS Business Analytics", reasons: ["Transfers the most credits", "Similar field of study"] },
  { name: "BS Information Systems", reasons: ["Matches interests", "Most of your credits count"] },
  { name: "BS Data Science", reasons: ["Matches interests", "Similar field of study"] },
  { name: "BS Computer Science", reasons: ["Matches interests", "Similar field of study"] },
]

/** Institution content, not design: the admin panel in the same Figma file
 *  configures all four titles, lines and images. They are the last card on the
 *  page because they are the only thing on it that is not about this person. */
export const DISCOVER = [
  {
    image: "/brand/explore/housing.png",
    title: "Housing & accommodation",
    description: "Where you'll live on and off campus",
  },
  {
    image: "/brand/explore/scholarships.png",
    title: `Scholarships at ${UNIVERSITY_SHORT}`,
    description: "Funding options available to transfer students",
  },
  {
    image: "/brand/explore/transfer-stories.png",
    title: "Hear from transfer students",
    description: "Real stories from people who made the switch",
  },
  {
    image: "/brand/explore/admissions.png",
    title: "Admissions assistant",
    description: "We are here to help at every step of the process",
  },
]

/** How long the read takes. The copy promises up to 60 seconds and a real OCR
 *  pass would use them; a prototype that did would only ever be watched once,
 *  so the bar runs in eight and the sentence stays honest about the real
 *  thing. The point being demonstrated is that the questions are answerable
 *  while it runs, and eight seconds is long enough to show that. */
export const PROCESSING_MS = 8000
