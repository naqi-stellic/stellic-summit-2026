import { cn } from "cn"
import { useState } from "react"

import { Icon } from "@/components/icon"
import { GeneratePlanNotes } from "@/components/stellic/generate-plan-notes"
import {
  GeneratePlanPace,
  INITIAL_PACE,
  type PaceState,
} from "@/components/stellic/generate-plan-pace"
import { GeneratePlanScope } from "@/components/stellic/generate-plan-scope"
import { GeneratePlanSummary } from "@/components/stellic/generate-plan-summary"
import { Button } from "@/components/ui/button"
import type { PlanStanding } from "@/data/plan"

/* The Generate Plan wizard that opens beside the planner. Three questions, then
 * a review of the answers. Padding subtracts the border width where a container
 * is stroked (see button.tsx for why). */

const TOTAL_STEPS = 3

/** The three questions, then the review — which drops the step chrome. */
type View = 1 | 2 | 3 | "summary"

export function GeneratePlanPanel({
  standing,
  graduation,
  campus,
  terms,
  onClose,
}: {
  standing: PlanStanding
  graduation: string
  campus: string
  /** Terms the pacing step can include or exclude, summers included. */
  terms: string[]
  onClose: () => void
}) {
  const [view, setView] = useState<View>(1)

  /* The answers live here so the summary can read back exactly what was given,
   * and so Back never loses anything. */
  const [keepPlanned, setKeepPlanned] = useState("yes")
  const [pace, setPace] = useState<PaceState>(INITIAL_PACE)
  const [notes, setNotes] = useState("")

  function startOver() {
    setKeepPlanned("yes")
    setPace(INITIAL_PACE)
    setNotes("")
    setView(1)
  }

  const isSummary = view === "summary"

  return (
    <aside className="@container flex h-full w-full flex-col overflow-x-clip overflow-y-auto bg-card">
      <header
        className={cn(
          "flex shrink-0 flex-col border-b border-gray-40 px-6 pt-3 pb-[15px]",
          !isSummary && "gap-2"
        )}
      >
        <div className="flex w-full items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <h2 className="text-caption-lg font-semibold text-foreground">Generate Plan</h2>
            {!isSummary && (
              <span className="text-overline font-medium tracking-[0.5px] text-gray-80 uppercase">
                Step {view} of {TOTAL_STEPS}
              </span>
            )}
          </div>
          <Button variant="ghost" size="icon" aria-label="Close Generate Plan" onClick={onClose}>
            <Icon name="s-close" size={16} />
          </Button>
        </div>

        {!isSummary && (
          <div className="flex w-full items-start gap-2">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1 min-w-0 flex-1 rounded-md",
                  i < view ? "bg-primary-50" : "bg-gray-40"
                )}
              />
            ))}
          </div>
        )}
      </header>

      <div className="flex flex-1 flex-col gap-8 p-6">
        {view === 1 && (
          <GeneratePlanScope
            standing={standing}
            graduation={graduation}
            keepPlanned={keepPlanned}
            onKeepPlannedChange={setKeepPlanned}
          />
        )}

        {view === 2 && <GeneratePlanPace terms={terms} state={pace} onChange={setPace} />}

        {view === 3 && <GeneratePlanNotes value={notes} onChange={setNotes} />}

        {isSummary && (
          <GeneratePlanSummary
            standing={standing}
            graduation={graduation}
            campus={campus}
            keepPlanned={keepPlanned}
            pace={pace}
            notes={notes}
          />
        )}

        <div className="flex w-full items-center gap-2">
          {isSummary ? (
            <>
              <Button className="flex-1" onClick={startOver}>
                Start over
              </Button>
              <Button variant="primary" className="flex-1">
                Generate Plan
              </Button>
            </>
          ) : (
            <>
              {view > 1 && (
                <Button className="flex-1" onClick={() => setView((view as number) - 1 as View)}>
                  Back
                </Button>
              )}
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => setView(view === TOTAL_STEPS ? "summary" : ((view as number) + 1 as View))}
              >
                Continue
              </Button>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
