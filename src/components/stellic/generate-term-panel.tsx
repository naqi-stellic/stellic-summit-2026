import { cn } from "cn"
import { useState } from "react"

import { Icon } from "@/components/icon"
import { keepChoices } from "@/components/stellic/generate-plan-pace"
import { KeepPicker } from "@/components/stellic/keep-picker"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RadioGroup } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { RadioCard } from "@/components/stellic/primitives"
import { CREDITS_PER_COURSE, type Term } from "@/data/plan"

/* Generating one term rather than the whole plan. The question is narrower —
 * how full should this term be, and what in it is settled — so it fits in two
 * steps instead of three. */

const TOTAL_STEPS = 2

/** What the slider can ask for. The floor is a half load; the ceiling is two
 *  terms' worth, for anyone who wants to see the plan push back. */
const MIN_CREDITS = 6
const MAX_CREDITS = 30

/** The load the institution calls full-time, which is where the slider starts
 *  and what the badge under it is pointing at. */
const RECOMMENDED = 15

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex w-full flex-col gap-2">
      <h4 className="pb-2 text-body-md font-semibold text-gray-100">{title}</h4>
      {children}
    </section>
  )
}

/** The gray panel reading back what the answers add up to. */
function Preview({ kept, adding, empty }: { kept: number; adding: number; empty: boolean }) {
  return (
    <div className="flex w-full flex-col gap-2 rounded-md bg-gray-0 p-3">
      <p className="text-body-md font-semibold text-foreground">Here is what will be generated</p>
      {/* A term with nothing in it is not keeping anything, and saying so in
          credits reads as a failure rather than a blank page. */}
      {!empty && (
        <p className="flex items-center gap-2 text-body-md text-gray-100">
          <Icon name="lock" size={16} className="shrink-0" />
          Keeping {kept} credit{kept === 1 ? "" : "s"} already planned
        </p>
      )}
      <p className="flex items-center gap-2 text-body-md text-gray-100">
        <Icon name="add" size={16} className="shrink-0" />
        {adding > 0
          ? `Up to ${adding} credit${adding === 1 ? "" : "s"} will be added`
          : "Nothing to add at this target"}
      </p>
    </div>
  )
}

export function GenerateTermPanel({
  term,
  onGenerate,
  onClose,
}: {
  term: Term
  /** Fill this term to the target, keeping everything but the released. */
  onGenerate: (targetCredits: number, released: string[]) => void
  onClose: () => void
}) {
  const [step, setStep] = useState(1)
  const [target, setTarget] = useState(RECOMMENDED)
  const [keepPlanned, setKeepPlanned] = useState("yes")
  const [released, setReleased] = useState<string[]>([])

  const planned = term.courses.filter((c) => !released.includes(c.id))
  const courses = planned.filter((c) => !c.placeholder).length
  const seats = planned.filter((c) => c.placeholder).length
  const kept = planned.reduce((n, c) => n + c.credits, 0)
  /* Only whole courses can be added, so the target rounds down to one. */
  const adding = Math.max(0, Math.floor((target - kept) / CREDITS_PER_COURSE)) * CREDITS_PER_COURSE

  return (
    <aside className="@container flex h-full w-full flex-col overflow-x-clip overflow-y-auto bg-card">
      <header className="flex shrink-0 flex-col gap-2 border-b border-gray-40 px-6 pt-3 pb-[15px]">
        <div className="flex w-full items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <h2 className="text-caption-lg font-semibold text-foreground">Generate Term</h2>
            <span className="text-overline font-medium tracking-[0.5px] text-gray-80 uppercase">
              Step {step} of {TOTAL_STEPS}
            </span>
          </div>
          <Button variant="ghost" size="icon" aria-label="Close Generate Term" onClick={onClose}>
            <Icon name="s-close" size={16} />
          </Button>
        </div>
        <div className="flex w-full items-start gap-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span
              key={i}
              className={cn("h-1 min-w-0 flex-1 rounded-md", i < step ? "bg-primary-50" : "bg-gray-40")}
            />
          ))}
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-8 p-6">
        <div className="flex w-full flex-col gap-2">
          <h3 className="text-h400 font-semibold text-foreground">Let's plan {term.name}</h3>
          <p className="text-body-md text-gray-80">
            {step === 1
              ? "Set a credit target and tell us what to keep. We'll build the rest around it."
              : "This is what we will do. Generate it and you can still change anything after."}
          </p>
        </div>

        {step === 1 ? (
          <>
            <section className="flex w-full flex-col items-center gap-2">
              <div className="flex w-full items-start">
                <p className="min-w-0 flex-1 pb-2 text-body-md font-semibold text-gray-100">
                  Target credits
                </p>
              </div>
              <div className="flex w-full items-start gap-2 text-body-md text-gray-80">
                <span className="min-w-0 flex-1">{MIN_CREDITS} credits</span>
                <span className="min-w-0 flex-1 text-right">{MAX_CREDITS} credits</span>
              </div>
              <Slider
                value={[target]}
                min={MIN_CREDITS}
                max={MAX_CREDITS}
                step={CREDITS_PER_COURSE}
                onValueChange={([next]) => setTarget(next)}
                aria-label="Target credits"
              />
              <div className="flex flex-col items-center gap-2">
                <p className="text-body-md text-gray-100">{target} credits</p>
                {target === RECOMMENDED && (
                  <Badge className="bg-primary-0 text-primary-50">Recommended</Badge>
                )}
              </div>
            </section>

            {term.courses.length > 0 && (
              <Step title="Keep everything already planned?">
                <RadioGroup
                  value={keepPlanned}
                  onValueChange={(next) => {
                    setKeepPlanned(next)
                    if (next === "yes") setReleased([])
                  }}
                  className="w-full gap-2"
                >
                  {keepChoices(term.courses.length).map((choice) => (
                    <RadioCard
                      key={choice.value}
                      value={choice.value}
                      label={choice.label}
                      detail={choice.detail}
                      selected={keepPlanned === choice.value}
                    />
                  ))}
                </RadioGroup>

                {keepPlanned === "no" && (
                  <KeepPicker terms={[term]} released={released} onChange={setReleased} />
                )}
              </Step>
            )}

            <Preview kept={kept} adding={adding} empty={term.courses.length === 0} />
          </>
        ) : (
          <>
            <Preview kept={kept} adding={adding} empty={term.courses.length === 0} />
            <Step title="What you asked for">
              <p className="text-body-md text-gray-100">
                {term.courses.length === 0
                  ? `A ${target}-credit ${term.name}, built from what the degree still needs.`
                  : `A ${target}-credit ${term.name}, keeping ${courses} course${
                      courses === 1 ? "" : "s"
                    }${seats > 0 ? ` and ${seats} placeholder${seats === 1 ? "" : "s"}` : ""}.`}
              </p>
            </Step>
          </>
        )}

        {/* In flow under the preview, as the design has it — and out from
            under the assistant button, which is fixed to the bottom right. */}
        <div className="flex w-full items-center gap-2">
          <Button
            className="flex-1"
            onClick={() => (step === 1 ? onClose() : setStep(1))}
          >
            Back
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => (step === 1 ? setStep(2) : onGenerate(target, released))}
          >
            {step === 1 ? "Continue" : "Generate Term"}
          </Button>
        </div>
      </div>
    </aside>
  )
}
