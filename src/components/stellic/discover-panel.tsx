import { cn } from "cn"
import { useState } from "react"

import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

/* Discover Programs: the what-if, asked beside the audit it is asking about.
 *
 * The chrome is the Generate Plan wizard's, deliberately — a student who has
 * used one has used the other, and a second kind of side panel would be a
 * second thing to learn for no reason. What differs is the question and the
 * number of steps.
 *
 * The frame this came from is a rough sketch rather than a drawn screen: it
 * counts four steps where there are two, and it has no design behind the
 * second. So the content here is the sketch's and the shape is the wizard's. */

const TOTAL_STEPS = 2

/** What the student is here to do. The answer decides what the second step
 *  asks, which is why it is the first thing asked. */
export type DiscoverIntent = "add" | "change" | "explore"

const INTENTS: { id: DiscoverIntent; label: string; detail: string }[] = [
  {
    id: "add",
    label: "Add an additional major",
    detail: "Keep existing programs and add new programs to your profile",
  },
  {
    id: "change",
    label: "Change your major",
    detail: "Replace existing major with a new major",
  },
  {
    id: "explore",
    label: "Just exploring",
    detail: "Look how your current courses would map to other program requirements",
  },
]

/** A choice with a sentence under it rather than beside it. `RadioCard` puts
 *  the two on one row, which only works while the line is four or five words;
 *  these are sentences, so they stack and the radio centres against both. */
function IntentCard({ intent, selected }: { intent: (typeof INTENTS)[number]; selected: boolean }) {
  return (
    <label
      className={cn(
        "flex w-full cursor-pointer items-center gap-4 rounded-md border p-[15px] transition-colors",
        selected ? "border-primary-50" : "border-gray-40 hover:border-gray-60"
      )}
    >
      <RadioGroupItem value={intent.id} />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-body-md font-semibold text-foreground">{intent.label}</span>
        <span className="text-body-md text-gray-80">{intent.detail}</span>
      </span>
    </label>
  )
}

function DiscoverIntentStep({
  value,
  onChange,
}: {
  value: DiscoverIntent | null
  onChange: (next: DiscoverIntent) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-body-md font-semibold text-foreground">
          Find programs that fit your needs
        </h3>
        <p className="text-body-md text-gray-80">
          Whether you are looking to change a major, add a new minor or certificate, or just
          looking to see how your courses would map, we can help you with it.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-body-md text-foreground">What are you looking for?</p>
        <RadioGroup
          value={value ?? ""}
          onValueChange={(next) => onChange(next as DiscoverIntent)}
          className="flex flex-col gap-3"
        >
          {INTENTS.map((intent) => (
            <IntentCard key={intent.id} intent={intent} selected={value === intent.id} />
          ))}
        </RadioGroup>
      </div>
    </div>
  )
}

export function DiscoverPanel({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [intent, setIntent] = useState<DiscoverIntent | null>(null)

  return (
    <aside className="@container flex h-full w-full flex-col overflow-x-clip overflow-y-auto bg-card">
      <header className="flex shrink-0 flex-col gap-2 border-b border-gray-40 px-6 pt-3 pb-[15px]">
        <div className="flex w-full items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <h2 className="text-caption-lg font-semibold text-foreground">Discover Programs</h2>
            <span className="text-overline font-medium tracking-[0.5px] text-gray-80 uppercase">
              Step {step} of {TOTAL_STEPS}
            </span>
          </div>
          <Button variant="ghost" size="icon" aria-label="Close Discover Programs" onClick={onClose}>
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

      <div className="flex flex-1 flex-col gap-8 p-6 pb-28">
        {step === 1 && <DiscoverIntentStep value={intent} onChange={setIntent} />}

        {/* The sketch stops after the first question, so rather than invent the
            second this says so and keeps the way back. */}
        {step === 2 && (
          <p className="text-body-md text-gray-80">
            Nothing is designed behind this step yet.
          </p>
        )}

        <div className="flex w-full items-center gap-2">
          {step > 1 && (
            <Button className="flex-1" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          <Button
            variant="primary"
            className="flex-1"
            /* Nothing to continue to until the question is answered. */
            disabled={step === 1 && intent === null}
            onClick={() => setStep(Math.min(step + 1, TOTAL_STEPS))}
          >
            Continue
          </Button>
        </div>
      </div>
    </aside>
  )
}
