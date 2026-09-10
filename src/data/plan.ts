import type { ReactNode } from "react"

export type YearPhase = "complete" | "active" | "future"

export type PlannedCourse = {
  code: string
  name: string
  section?: string
  /** Note count shown as an inline tally. */
  notes?: number
  /** Registered courses are fixed; planned ones can be reordered. */
  draggable?: boolean
}

export type Term = {
  name: string
  meta: string
  reviewed: boolean
  group?: {
    state: "registered" | "planned"
    label: string
    credits: number
    deltas?: { added: number; removed: number }
  }
  courses: PlannedCourse[]
  /** Slotted between the header and the course list. */
  alert?: ReactNode
}

export type Year = {
  label: string
  phase: YearPhase
  terms: Term[]
}

const BIOLOGY: PlannedCourse = {
  code: "CRS-CODE",
  name: "Introduction to Biology",
  section: "Lec-01",
}

export const FALL_2027: Term = {
  name: "Fall 2027",
  meta: "Sep - Dec • 30 credits",
  reviewed: true,
  group: { state: "registered", label: "In Progress", credits: 27 },
  courses: [
    { code: "CRS-CODE", name: "Calculus I", section: "Lec-01" },
    BIOLOGY,
    BIOLOGY,
    { ...BIOLOGY, notes: 1 },
  ],
}

export const SPRING_2028: Term = {
  name: "Spring 2028",
  meta: "Jan - May • 18 credits • Main campus",
  reviewed: false,
  group: {
    state: "planned",
    label: "Planned",
    credits: 27,
    deltas: { added: 3, removed: 1 },
  },
  courses: [
    {
      code: "CRS-CODE",
      name: "Materials & Manufacturing II",
      section: "Lec-01",
      draggable: true,
    },
    { code: "CRS-CODE", name: "Special Studies", draggable: true },
  ],
}

/** Years 3-5 are empty shells the student has not planned into yet. */
function emptyYear(label: string, fall: string, spring: string): Year {
  return {
    label,
    phase: "future",
    terms: [
      {
        name: fall,
        meta: "Sep - Dec • 12 credits • Main campus",
        reviewed: false,
        courses: [],
      },
      {
        name: spring,
        meta: "Jan - May • 15 credits • Main campus",
        reviewed: false,
        courses: [],
      },
    ],
  }
}

export const FUTURE_YEARS: Year[] = [
  emptyYear("2028-2029", "Fall 2028", "Spring 2029"),
  emptyYear("2029-2030", "Fall 2029", "Spring 2030"),
  emptyYear("2030-2031", "Fall 2030", "Spring 2031"),
]
