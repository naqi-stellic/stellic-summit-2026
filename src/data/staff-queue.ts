import type { PersonaKey } from "@/data/staff-home"

/* Open Items: the work that is waiting on a decision from you.
 *
 * Everything here carries `vis` — the people it is routed to — because a queue
 * is not a list of everything happening, it is a list of what is yours. Two
 * staff looking at the same Home see different rows in it. */

/** The step rail inside an expanded request. `skip` is a step somebody with
 *  the authority to waive it waived; it still counts as approved. */
export type StepState = "done" | "cur" | "todo" | "skip"

export type Step = {
  state: StepState
  label: string
  /** Who it sits with. "You…" is what marks the step the actions belong to. */
  who?: string
  /** A date for a step that has happened, "now" for the one that has not. */
  when?: string
  /** How long the current step has been waiting. */
  since?: string
  fields?: [string, string][]
}

/* ============================================================ Reports */

export type Report = {
  title: string
  count: string
  /** Whether Stellic is watching the number, and whether it notifies. */
  tracked?: boolean
  tag?: string
  up?: number
  down?: number
}

export const REPORTS: Report[] = [
  { title: "Advisees with < 2.0 GPA", count: "33 students", tracked: true, up: 4, down: 0 },
  { title: "Advisees Not Enrolled", count: "33 students", tracked: true, tag: "Auto Notify", up: 4 },
  { title: "Senior Advisees Close to Graduating", count: "33 students" },
  { title: "Missing Grad Clearance", count: "22 students", tag: "Manual" },
]

/** Everybody who turns up in this queue, and their face.
 *
 *  Keyed by name rather than by username, because most rows here name a
 *  student and only some carry a username — and a row that shows two grey
 *  letters beside a row that shows a photograph of the same person, which is
 *  what the Transfer tab was doing, reads as two different people. */
const FACES: Record<string, string> = {
  "Fawad Miller": "/faces/fmiller.jpg",
  "Ryo Nakamura": "/faces/rnakamura.jpg",
  "Marisol Vega": "/faces/mvega.jpg",
  "Bríd O'Sullivan": "/faces/bosullivan.jpg",
  "Farah Al-Amin": "/faces/falamin.jpg",
  "Jonah Miller": "/faces/jmiller.jpg",
  "Amara Osei": "/faces/aosei.jpg",
  "Selin Yıldız": "/faces/syildiz.jpg",
  "Tobias Wren": "/faces/twren.jpg",
  "Diego Ramos": "/faces/dramos.jpg",
  "Priya Chandran": "/faces/pchandran.jpg",
  "Ingrid Castellanos": "/faces/icastellanos.jpg",
  "Alexander Mitchell": "/faces/amitchell.jpg",
  "Tomas Reyes": "/faces/treyes.jpg",
  "Aaron Scott": "/faces/ascott.jpg",
  "Aaron Lewis": "/faces/alewis.jpg",
  "Aaron Kelley": "/faces/akelley.jpg",
}

/** The face for a name, where there is one. Initials stay as the fallback. */
export const faceOf = (name: string): string | undefined => FACES[name]

/* ============================================================ Today */

export type TodayAppt = {
  title: string
  when: string
  /** Who is in the room. One person, on every one of these — a transfer
   *  officer's day is a queue of individual transcripts, not a lecture. */
  who: { initials: string; color: string; photo?: string }[]
  /** How long until it starts. Every card carries it — a morning you are
   *  reading at a glance is one where nothing makes you work out the time. */
  starts?: string
}

/* Jessica's morning: four one-to-ones, all of them transcript evaluations.
   This board belongs to the transfer office, so a day of "Group Advising" was
   somebody else's job showing through — and a transfer officer's day really
   does read as the same job four times. Bríd is the one student here whose
   review is also waiting in Open Items below: you meet the person whose
   transcript you are about to decide on. */
export const TODAY: TodayAppt[] = [
  {
    title: "Fawad Miller / Transcript evaluation",
    when: "11:30am – 12:30pm",
    who: [{ initials: "FM", color: "#b54708", photo: "/faces/fmiller.jpg" }],
    starts: "In 1 hour",
  },
  {
    title: "Marisol Vega / Transcript evaluation",
    when: "1:00pm – 1:30pm",
    who: [{ initials: "MV", color: "#175cd3", photo: "/faces/mvega.jpg" }],
    starts: "In 2 hours",
  },
  {
    title: "Bríd O'Sullivan / Transcript evaluation",
    when: "2:00pm – 2:45pm",
    who: [{ initials: "BO", color: "#087443", photo: "/faces/bosullivan.jpg" }],
    starts: "In 3 hours",
  },
  {
    title: "Farah Al-Amin / Transcript evaluation",
    when: "3:15pm – 3:45pm",
    who: [{ initials: "FA", color: "#9f1ab1", photo: "/faces/falamin.jpg" }],
    starts: "In 4 hours",
  },
]

/* ============================================================ Audits */

export type PublishRequest = {
  id: string
  program: string
  version: string
  requestedBy: string
  date: string
  /** Sort key. The dates above are what a person reads. */
  iso: string
  /** A big enough audit that publishing it runs in the background. */
  large: boolean
  vis: PersonaKey[]
}

/* Publish requests only. A draft nobody has submitted is not waiting on
   anyone, so it does not belong in a queue. */
export const PUBLISH_REQUESTS: PublishRequest[] = [
  {
    id: "ap1",
    program: "Biology, B.S.",
    version: "EY2026",
    requestedBy: "Farida Mensah",
    date: "Jul 31",
    iso: "2026-07-31",
    large: true,
    vis: ["mark"],
  },
  {
    id: "ap2",
    program: "Political Science, B.A.",
    version: "EY2026",
    requestedBy: "Tariq Oduya",
    date: "Aug 3",
    iso: "2026-08-03",
    large: false,
    vis: ["mark"],
  },
]

/* ============================================================ Exceptions */

export type ExceptionRequest = {
  id: string
  student: string
  username: string
  initials: string
  color: string
  program: string
  /** `direct` is decided here in one press. `wf` has a workflow behind it, so
   *  the row opens onto the rail instead. */
  kind: "direct" | "wf"
  title: string
  requirement: string
  justification: string
  requestedBy: string
  date: string
  iso: string
  vis: PersonaKey[]
  workflow?: { name: string; fields: [string, string][]; steps: Step[] }
}

export const EXCEPTIONS: ExceptionRequest[] = [
  {
    id: "ex1",
    student: "Jonah Miller",
    username: "jmiller",
    initials: "JM",
    color: "#3e4784",
    program: "Computer Science, B.S.",
    kind: "direct",
    title: "Waive this Requirement",
    requirement: "Math Electives",
    justification:
      "Completed an equivalent linear algebra sequence at Seneca College before transferring.",
    requestedBy: "Mei-Ling Johansson",
    date: "Aug 3",
    iso: "2026-08-03",
    vis: ["mark"],
  },
  {
    id: "ex2",
    student: "Amara Osei",
    username: "aosei",
    initials: "AO",
    color: "#026aa2",
    program: "Political Science, B.A.",
    kind: "direct",
    title: "Substitution",
    requirement: "Regional Studies",
    justification:
      "POLS 2200 was canceled this term; HIST 2210 covers the same region with the same instructor.",
    requestedBy: "Mei-Ling Johansson",
    date: "Aug 1",
    iso: "2026-08-01",
    vis: ["mark"],
  },
  {
    id: "ex3",
    student: "Selin Yıldız",
    username: "syildiz",
    initials: "SY",
    color: "#087443",
    program: "Biology, B.S.",
    kind: "wf",
    title: "Manually Pick Courses",
    requirement: "Science Core",
    justification:
      "Research practicum covered lab methods at depth; syllabus attached to the request.",
    requestedBy: "Selin Yıldız (student)",
    date: "Jul 30",
    iso: "2026-07-30",
    vis: ["mark"],
    workflow: {
      name: "Make an Exception: Science Core",
      fields: [
        ["Requested change", "Apply BIOL 2900 (4 cr) toward Science Core"],
        ["Syllabus", "biol2900-syllabus.pdf"],
        ["Progress snapshot", "Attached automatically"],
        ["Student note", "Practicum covered the same lab methods as BIOL 2400."],
      ],
      steps: [
        {
          state: "done",
          label: "Advisor recommendation",
          who: "Mei-Ling Johansson · approved",
          when: "Jul 30",
        },
        {
          state: "skip",
          label: "Department chair",
          who: "Dr. R. Ibarra · skipped by Mei-Ling Johansson, counts as approved",
          when: "Aug 1",
        },
        {
          state: "cur",
          label: "Registrar review",
          who: "You · reassigned to you by Priya Raghavan",
          when: "now",
          since: "Aug 2",
        },
        {
          state: "todo",
          label: "Final confirmation",
          who: "Records office",
          when: "Final step, needs exception permission",
        },
      ],
    },
  },
  {
    id: "ex4",
    student: "Tobias Wren",
    username: "twren",
    initials: "TW",
    color: "#9f1ab1",
    program: "Graphic Design, B.F.A.",
    kind: "direct",
    title: "Waive or Modify Requirement Constraint",
    requirement: "Studio Electives",
    justification: "Medical leave in spring term; portfolio review passed with distinction.",
    requestedBy: "Camille Beaumont",
    date: "Aug 4",
    iso: "2026-08-04",
    vis: ["mark"],
  },
]

/* ============================================================ Workflows */

export type WorkflowRow = {
  id: string
  name: string
  student: string
  initials: string
  color: string
  program: string
  date: string
  iso: string
  vis: PersonaKey[]
  status?: string
  /** What the first rail node is called, where "Request submitted" is wrong. */
  openedAs?: string
  fields?: [string, string][]
  steps?: Step[]
}

export const WORKFLOWS: Record<"grad" | "transfer", { label: string; rows: WorkflowRow[] }> =
  {
    grad: {
      label: "Graduation Clearance",
      rows: [
        {
          id: "g1",
          name: "Class of 2026 Grad Clearance",
          student: "Farah Al-Amin",
          initials: "FA",
          color: "#b54708",
          program: "Biology, B.S.",
          date: "Jul 29",
          iso: "2026-07-29",
          vis: ["mark"],
          status: "In Review",
          openedAs: "Graduation application",
          fields: [
            ["Expected term", "Fall 2026"],
            ["Credential", "BSc in Biology"],
            ["Credits", "118 of 120, 2 in progress"],
            ["Remaining requirements", "0 unplanned, 1 planned"],
            ["Progress snapshot", "Attached automatically"],
          ],
          steps: [
            {
              state: "done",
              label: "Advisor sign-off",
              who: "Mei-Ling Johansson · approved",
              when: "Jul 29",
              fields: [["Advisor note", "On track, spring lab will close the last requirement."]],
            },
            { state: "cur", label: "Registrar review", who: "You", when: "now", since: "Jul 29" },
            {
              state: "todo",
              label: "Final confirmation",
              who: "Records office",
              when: "Sets the application to Conditionally Approved",
            },
          ],
        },
        {
          id: "g2",
          name: "Class of 2026 Grad Clearance",
          student: "Diego Ramos",
          initials: "DR",
          color: "#175cd3",
          program: "Computer Science, B.S.",
          date: "Jul 31",
          iso: "2026-07-31",
          vis: ["mark"],
          status: "In Review",
          openedAs: "Graduation application",
          fields: [
            ["Expected term", "Fall 2026"],
            ["Credential", "BSc in Computer Science"],
            ["Credits", "120 of 120"],
            ["Remaining requirements", "0"],
            ["Progress snapshot", "Attached automatically"],
          ],
          steps: [
            {
              state: "done",
              label: "Advisor sign-off",
              who: "Ozzy Blackwell · approved",
              when: "Jul 31",
            },
            { state: "cur", label: "Registrar review", who: "You", when: "now", since: "Jul 31" },
            {
              state: "todo",
              label: "Final confirmation",
              who: "Records office",
              when: "Sets the application to Conditionally Approved",
            },
          ],
        },
        {
          id: "g3",
          name: "Grad Clearance: Honors track",
          student: "Ingrid Castellanos",
          initials: "IC",
          color: "#0b7a6b",
          program: "Political Science, B.A.",
          date: "Aug 2",
          iso: "2026-08-02",
          vis: ["mark"],
          status: "In Review",
          openedAs: "Graduation application",
          fields: [
            ["Expected term", "Spring 2027, early walk"],
            ["Credential", "BA Political Science"],
            ["Credits", "112 of 120, 8 in progress"],
            ["Remaining requirements", "0 unplanned, 2 planned"],
            ["Progress snapshot", "Attached automatically"],
          ],
          steps: [
            {
              state: "done",
              label: "Honors committee",
              who: "Dr. L. Fontaine · approved",
              when: "Aug 2",
            },
            { state: "cur", label: "Registrar review", who: "You", when: "now", since: "Aug 2" },
          ],
        },
      ],
    },
    transfer: {
      label: "Transfer",
      rows: [
        {
          id: "t1",
          name: "Transfer Credit Review",
          student: "Ryo Nakamura",
          initials: "RN",
          color: "#3e4784",
          program: "Computer Science, B.S.",
          date: "Aug 3",
          iso: "2026-08-03",
          vis: ["jessica"],
          fields: [
            ["Incoming course", "MATH 1210 Calculus, Seneca College"],
            ["Proposed equivalency", "MATH 1200 Calculus I"],
            ["Grade", "A-"],
            ["Syllabus", "seneca-math1210.pdf"],
          ],
          steps: [
            {
              state: "done",
              label: "Department evaluation",
              who: "Mathematics, routed by course subject · approved by Dr. A. Petrov",
              when: "Aug 3",
              fields: [["Finding", "Equivalent, full 3 credits"]],
            },
            { state: "cur", label: "Registrar decision", who: "You", when: "now", since: "Aug 3" },
          ],
        },
        {
          id: "t2",
          name: "Transfer Credit Review",
          student: "Bríd O'Sullivan",
          initials: "BO",
          color: "#b42318",
          program: "Biology, B.S.",
          date: "Aug 4",
          iso: "2026-08-04",
          vis: ["jessica"],
          fields: [
            ["Institution", "University College Cork"],
            [
              "Incoming courses",
              "BI1001 → BIOL 1100 · CM1002 → CHEM 1050 · SS1010 → elective credit",
            ],
            ["Grades", "1.1, 1.2, 2.1 on the Irish scale"],
            ["Syllabi", "3 files attached"],
          ],
          steps: [
            {
              state: "done",
              label: "Department evaluation",
              who: "Biology, routed by course subject · approved by Dr. H. Osei",
              when: "Aug 4",
              fields: [["Finding", "2 equivalent, 1 as elective credit"]],
            },
            { state: "cur", label: "Registrar decision", who: "You", when: "now", since: "Aug 4" },
          ],
        },
      ],
    },
  }

/* ============================================================ Notes */

export type Note = {
  id: string
  category: "concerns" | "referrals" | "mentions"
  date: string
  iso: string
  student: string
  initials: string
  color: string
  program: string
  text: string
  tags: { label: string; tone?: "danger" | "warning" }[]
}

export const NOTES: Note[] = [
  {
    id: "nt1",
    category: "concerns",
    date: "Jul 1",
    iso: "2026-07-01",
    student: "Alexander Mitchell",
    initials: "AM",
    color: "#8891a6",
    program: "Materials Science and Engineering, M.S.",
    text: "Did not attend the last two sessions of MATH 131.",
    tags: [
      { label: "High", tone: "danger" },
      { label: "Absence" },
      { label: "Advisor" },
      { label: "MATH 131 Calculus I" },
    ],
  },
  {
    id: "nt2",
    category: "referrals",
    date: "Jun 22",
    iso: "2026-06-22",
    student: "Priya Chandran",
    initials: "PC",
    color: "#175cd3",
    program: "Computer Science, B.S.",
    text: "Referred to academic coaching after missing two midterms.",
    tags: [
      { label: "Medium", tone: "warning" },
      { label: "Academic" },
      { label: "Advisor" },
      { label: "CS 210 Data Structures" },
    ],
  },
  {
    id: "nt3",
    category: "referrals",
    date: "Jun 14",
    iso: "2026-06-14",
    student: "Tomas Reyes",
    initials: "TR",
    color: "#b54708",
    program: "Mechanical Engineering, B.Eng.",
    text: "Referred to the financial aid office regarding a tuition hold.",
    tags: [{ label: "Financial" }, { label: "Advisor" }],
  },
  {
    id: "nt4",
    category: "mentions",
    date: "May 30",
    iso: "2026-05-30",
    student: "Alexander Mitchell",
    initials: "AM",
    color: "#8891a6",
    program: "Materials Science and Engineering, M.S.",
    text: "Mentioned in Dr. Okafor's note as a strong capstone candidate.",
    tags: [{ label: "Mention" }, { label: "Faculty" }],
  },
]

/** Counts are the real app's, so the segments read as the whole record rather
 *  than as the handful of rows the prototype carries. */
export const NOTE_VIEWS: { id: Note["category"]; label: string; count: number }[] = [
  { id: "concerns", label: "Concerns", count: 1 },
  { id: "referrals", label: "Referrals", count: 307 },
  { id: "mentions", label: "Mentions", count: 1 },
]

/* ============================================================ Appointments */

export type ApptRow = {
  id: string
  iso: string
  title: string
  when: string
  student: string
  initials: string
  color: string
  program: string
  /** `null` is the one that still needs attendance recording. */
  attended: boolean | null
  minutes: boolean
}

export const APPTS: ApptRow[] = [
  {
    id: "r1",
    iso: "2026-10-07",
    title: "Default Timeblock",
    when: "Oct 7, 9:30am – 10:00am",
    student: "Aaron Scott",
    initials: "AS",
    color: "#8891a6",
    program: "Political Science, B.A.",
    attended: false,
    minutes: false,
  },
  {
    id: "r2",
    iso: "2026-10-20",
    title: "Buffer Time test",
    when: "Oct 20, 9:00am – 10:00am",
    student: "Aaron Lewis",
    initials: "AL",
    color: "#8891a6",
    program: "Educational Studies, B.S.",
    attended: true,
    minutes: false,
  },
  {
    id: "r3",
    iso: "2026-12-04",
    title: "Private Timeblock",
    when: "Dec 4, 9:45am – 10:00am",
    student: "Aaron Kelley",
    initials: "AK",
    color: "#8891a6",
    program: "",
    attended: false,
    minutes: false,
  },
  {
    id: "r4",
    iso: "2026-12-04",
    title: "Private Timeblock",
    when: "Dec 4, 10:30am – 10:45am",
    student: "Aaron Kelley",
    initials: "AK",
    color: "#8891a6",
    program: "",
    attended: null,
    minutes: false,
  },
  {
    id: "r5",
    iso: "2026-12-04",
    title: "Private Timeblock",
    when: "Dec 4, 12:00pm – 12:15pm",
    student: "Aaron Kelley",
    initials: "AK",
    color: "#8891a6",
    program: "",
    attended: null,
    minutes: true,
  },
  {
    id: "r6",
    iso: "2026-12-10",
    title: "Buffer Time test",
    when: "Dec 10, 9:00am – 10:00am",
    student: "Aaron Kelley",
    initials: "AK",
    color: "#8891a6",
    program: "",
    attended: null,
    minutes: false,
  },
  {
    id: "r7",
    iso: "2026-12-11",
    title: "Private Timeblock",
    when: "Dec 11, 1:00pm – 1:15pm",
    student: "Aaron Kelley",
    initials: "AK",
    color: "#8891a6",
    program: "",
    attended: true,
    minutes: true,
  },
]

export const APPT_VIEWS: { id: "all" | "attendance" | "meetinglog"; label: string; count: number }[] =
  [
    { id: "all", label: "All", count: 45 },
    { id: "attendance", label: "Attendance", count: 38 },
    { id: "meetinglog", label: "Meeting Log", count: 43 },
  ]

/* ============================================================ Reading it */

/** Only what is routed to this person. */
export const routedTo = <T extends { vis: PersonaKey[] }>(rows: T[], who: PersonaKey) =>
  rows.filter((row) => row.vis.includes(who))

/** Every step the request is currently waiting on. A workflow that enforces no
 *  order between two steps is waiting on both. */
export const openSteps = (steps: Step[] = []) =>
  steps.filter((step) => step.state === "cur").map((step) => step.label)

/** The step that is waiting on *you*, which is where the actions belong. */
export const yourStep = (steps: Step[] = []) =>
  steps.find((step) => step.state === "cur" && (step.who ?? "").startsWith("You")) ??
  steps.find((step) => step.state === "cur")
