import { createContext, use } from "react"

/* Which terms are out for review. Like the metadata setting, it sits above the
 * whole plan rather than being threaded down through years and terms: a term
 * card marks itself, wherever it is being drawn. */

const PendingReviewContext = createContext<string[]>([])

export function PendingReviewProvider({
  terms,
  children,
}: {
  /** Term ids covered by a request that has not come back yet. */
  terms: string[]
  children: React.ReactNode
}) {
  return <PendingReviewContext value={terms}>{children}</PendingReviewContext>
}

export function usePendingReview(termId: string): boolean {
  return use(PendingReviewContext).includes(termId)
}
