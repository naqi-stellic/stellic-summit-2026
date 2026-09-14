import { cn } from "cn"
import { useState } from "react"

import { Icon } from "@/components/icon"
import {
  GeneratePlanPace,
  INITIAL_PACE,
  type PaceState,
} from "@/components/stellic/generate-plan-pace"
import { GeneratePlanScope } from "@/components/stellic/generate-plan-scope"
import { Button } from "@/components/ui/button"
import type { PlanStanding } from "@/data/plan"

/* The Generate Plan wizard that opens beside the planner. Padding subtracts
 * the border width where a container is stroked (see button.tsx for why). */

const TOTAL_STEPS = 3

export function GeneratePlanPanel({
  standing,
  graduation,
  terms,
  onClose,
}: {
  standing: PlanStanding
  graduation: string
  /** Terms the pacing step can include or exclude, summers included. */
  terms: string[]
  onClose: () => void
}) {
  const [step, setStep] = useState(1)
  const [keepPlanned, setKeepPlanned] = useState("yes")
  const [pace, setPace] = useState<PaceState>(INITIAL_PACE)

  return (
    <aside className="@container flex h-full w-full flex-col overflow-x-clip overflow-y-auto bg-card">
      <header className="flex shrink-0 flex-col gap-2 border-b border-gray-40 px-6 pt-3 pb-[15px]">
        <div className="flex w-full items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <h2 className="text-caption-lg font-semibold text-foreground">Generate Plan</h2>
            <span className="text-overline font-medium tracking-[0.5px] text-gray-80 uppercase">
              Step {step} of {TOTAL_STEPS}
            </span>
          </div>
          <Button variant="ghost" size="icon" aria-label="Close Generate Plan" onClick={onClose}>
            <Icon name="s-close" size={16} />
          </Button>
        </div>

        <div className="flex w-full items-start gap-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 min-w-0 flex-1 rounded-md",
                i < step ? "bg-primary-50" : "bg-gray-40"
              )}
            />
          ))}
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-8 p-6">
        {step === 1 && (
          <GeneratePlanScope
            standing={standing}
            graduation={graduation}
            keepPlanned={keepPlanned}
            onKeepPlannedChange={setKeepPlanned}
          />
        )}

        {step === 2 && <GeneratePlanPace terms={terms} state={pace} onChange={setPace} />}

        <div className="flex w-full items-center gap-2">
          {step > 1 && (
            <Button className="flex-1" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          <Button
            variant="primary"
            className="flex-1"
            disabled={step === TOTAL_STEPS}
            onClick={() => setStep(step + 1)}
          >
            Continue
          </Button>
        </div>
      </div>
    </aside>
  )
}
