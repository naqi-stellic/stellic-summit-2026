import { createContext, useContext, type ReactNode } from "react"

import { termIssues, type TermIssue } from "@/data/issues"
import type { Term, Year } from "@/data/plan"

/* The plan, held where anything drawing a term can reach it. What a term is
 * waiting on is not a fact about that term — a prerequisite sitting after it
 * is a fact about the plan — so the plan is put in reach rather than threaded
 * through every card, row and view that has to say so. */

const PlanYears = createContext<Year[]>([])

export function PlanIssuesProvider({ years, children }: { years: Year[]; children: ReactNode }) {
  return <PlanYears.Provider value={years}>{children}</PlanYears.Provider>
}

export function useTermIssues(term: Term): TermIssue[] {
  return termIssues(term, useContext(PlanYears))
}

/** The issues against one course, for a row that has to speak for itself. */
export function useCourseIssues(term: Term, courseId: string): TermIssue[] {
  return useTermIssues(term).filter((issue) => issue.course.id === courseId)
}
