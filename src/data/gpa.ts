import type { AuditCourse } from "@/data/audit"

/* How a grade point average is arrived at.
 *
 * A GPA is one number standing for a lot of arithmetic, and the whole of what
 * the panel does is put the arithmetic back: every course that contributed,
 * the weight its grade carries, the credits it carried, and the points those
 * two make. Add the points, add the credits, divide. Nothing here is a figure
 * anyone typed — change a grade in the audit and the average moves.
 *
 * Which is the point. A student asking "why is it 3.50" gets the six rows that
 * made it rather than a reassurance. */

/** What each letter is worth. The standard four-point scale; a course with a
 *  grade that is not on it carries no grade points, which is how pass/no-pass
 *  and transfer credit stay out of the average without being excluded by a
 *  rule — they simply have nothing to contribute. */
const WEIGHT: Record<string, number> = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  "D-": 0.7,
  F: 0.0,
}

export type GpaRow = {
  code: string
  name: string
  grade: string
  weight: number
  credits: number
  points: number
}

export type Gpa = {
  rows: GpaRow[]
  credits: number
  points: number
  /** The average itself, as a string — it is a number rounded to the
   *  institution's own number of decimal places, and 3.5 is not what it says
   *  on screen. */
  value: string
}

/** Whether a course has anything to contribute: credits above zero and a grade
 *  the scale can weigh. Both of the conditions the docs give for a course
 *  counting toward a Stellic-calculated GPA that a prototype can honestly
 *  check — the other two are about repeat codes and constraints, and this
 *  student has neither. */
export const factorable = (course: AuditCourse): boolean =>
  course.credits > 0 && course.grade !== undefined && course.grade in WEIGHT

/** The institution's own settings, which decide what the arithmetic rounds to
 *  and which attempts are in it. Named on screen under the sum, because a
 *  number you cannot reproduce is a number you have to take on faith. */
export const GPA_SETUP = [
  ["Number of decimal places", "2"],
  ["Official GPA rounding mode", "Standard"],
  ["Repeated courses in GPA", "Include all attempts of required non-repeatable courses"],
] as const

const DECIMALS = 2

export function gpaOf(courses: AuditCourse[]): Gpa {
  const rows = courses.filter(factorable).map((course) => {
    const weight = WEIGHT[course.grade!]
    return {
      code: course.code,
      name: course.name,
      grade: course.grade!,
      weight,
      credits: course.credits,
      /* Rounded to a tenth as it goes in, which is what makes the column add
         up on screen: a points column that does not sum to the total is a
         panel arguing with itself. */
      points: Math.round(weight * course.credits * 10) / 10,
    }
  })

  const credits = rows.reduce((sum, row) => sum + row.credits, 0)
  const points = Math.round(rows.reduce((sum, row) => sum + row.points, 0) * 10) / 10

  return {
    rows,
    credits,
    points,
    value: credits ? (points / credits).toFixed(DECIMALS) : "—",
  }
}
