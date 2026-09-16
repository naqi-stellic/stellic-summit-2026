import { cn } from "cn"
import { useEffect, useState } from "react"

import { Icon } from "@/components/icon"
import { DiscoverFilters } from "@/components/stellic/discover-filters"
import { DiscoverResults } from "@/components/stellic/discover-results"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  activeFilters,
  groupOf,
  matchPrograms,
  type FilterState,
} from "@/data/programs"

/* Discover Programs: the what-if, asked beside the audit it is asking about.
 *
 * The chrome is the Generate Plan wizard's, deliberately — a student who has
 * used one has used the other, and a second kind of side panel would be a
 * second thing to learn for no reason. Two questions, a review of the answers,
 * a moment's work, and then what the transcript is worth elsewhere. Only the
 * questions are numbered, which is the same rule the plan wizard follows.
 *
 * The frames this came from are sketches rather than drawn screens — they
 * count four steps where there are two — so the content is theirs and the
 * shape is the wizard's. */

const TOTAL_STEPS = 2

/** How long the check appears to take. Nothing is actually computed — the
 *  standings are already known — but a result that arrives the instant you ask
 *  for it does not read as having been checked against anything. */
const CHECKING_MS = 3000

/** What the student is here to do. The answer is what a second question would
 *  narrow, which is why it is asked first. */
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

/** The questions, then the review, the check, and what it found. Only the
 *  questions are numbered steps. */
type View = 1 | 2 | "summary" | "checking" | "results"

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

/** One line of the review: what was answered, and the way back to change it.
 *  The value is set to the right because these are answers being checked at a
 *  glance rather than a form being read down. */
function SummaryRow({
  label,
  value,
  onEdit,
}: {
  label: string
  value: string
  onEdit?: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-body-md">
      <p className="shrink-0 text-gray-80">{label}</p>
      <p className="flex min-w-0 items-center gap-2 text-right text-foreground">
        {value}
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 cursor-pointer text-gray-80 underline [text-underline-position:from-font]"
          >
            edit
          </button>
        )}
      </p>
    </div>
  )
}

function DiscoverSummary({
  intent,
  filters,
  matches,
  onEdit,
}: {
  intent: DiscoverIntent | null
  filters: FilterState
  matches: number
  onEdit: (step: 1 | 2) => void
}) {
  const active = activeFilters(filters)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-body-md font-semibold text-foreground">
          Here's what we are checking against
        </h3>
        <p className="text-body-md text-gray-80">
          Change anything that doesn't look right, then check progress.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <SummaryRow
          label="Looking to"
          value={INTENTS.find((option) => option.id === intent)?.label ?? "Just exploring"}
          onEdit={() => onEdit(1)}
        />
        {/* A filter that was never set is not an answer, so it is not a row. */}
        {active.map(({ field, values }) => (
          <SummaryRow
            key={field.id}
            label={`${groupOf(field).label} (${field.label})`}
            value={values.join(", ")}
            onEdit={() => onEdit(2)}
          />
        ))}
        {active.length === 0 && (
          <SummaryRow label="Filters" value="Every program" onEdit={() => onEdit(2)} />
        )}
      </div>

      <p className="text-body-md text-gray-80">
        {matches} {matches === 1 ? "program matches" : "programs match"} your selection
      </p>
    </div>
  )
}

/** The check, which is only a moment of held breath. No copy: there is nothing
 *  to say that the spinner does not. */
function DiscoverChecking({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, CHECKING_MS)
    return () => window.clearTimeout(timer)
  }, [onDone])

  return (
    <div className="flex flex-1 items-center justify-center py-16" role="status" aria-label="Checking progress">
      <span className="size-8 animate-spin rounded-full border-2 border-gray-40 border-t-primary-50" />
    </div>
  )
}

export function DiscoverPanel({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<View>(1)
  const [intent, setIntent] = useState<DiscoverIntent | null>(null)
  const [filters, setFilters] = useState<FilterState>({})
  const [chosen, setChosen] = useState<string | null>(null)

  const programs = matchPrograms(filters)
  const isStep = view === 1 || view === 2

  function startOver() {
    setIntent(null)
    setFilters({})
    setChosen(null)
    setView(1)
  }

  return (
    <aside className="@container flex h-full w-full flex-col overflow-x-clip overflow-y-auto bg-card">
      <header
        className={cn(
          "flex shrink-0 flex-col border-b border-gray-40 px-6 pt-3 pb-[15px]",
          isStep && "gap-2"
        )}
      >
        <div className="flex w-full items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <h2 className="text-caption-lg font-semibold text-foreground">Discover Programs</h2>
            {isStep && (
              <span className="text-overline font-medium tracking-[0.5px] text-gray-80 uppercase">
                Step {view} of {TOTAL_STEPS}
              </span>
            )}
          </div>
          <Button variant="ghost" size="icon" aria-label="Close Discover Programs" onClick={onClose}>
            <Icon name="s-close" size={16} />
          </Button>
        </div>

        {isStep && (
          <div className="flex w-full items-start gap-2">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1 min-w-0 flex-1 rounded-md",
                  i < (view as number) ? "bg-primary-50" : "bg-gray-40"
                )}
              />
            ))}
          </div>
        )}
      </header>

      <div className="flex flex-1 flex-col gap-8 p-6 pb-28">
        {view === 1 && <DiscoverIntentStep value={intent} onChange={setIntent} />}

        {view === 2 && (
          <DiscoverFilters filters={filters} onChange={setFilters} matches={programs.length} />
        )}

        {view === "summary" && (
          <DiscoverSummary
            intent={intent}
            filters={filters}
            matches={programs.length}
            onEdit={(step) => setView(step)}
          />
        )}

        {view === "checking" && <DiscoverChecking onDone={() => setView("results")} />}

        {view === "results" && (
          <DiscoverResults programs={programs} selected={chosen} onSelect={setChosen} />
        )}

        {/* The check finishes on its own and has nothing to press in the
            meantime. */}
        {view !== "checking" && (
          <div className="flex w-full items-center gap-2">
            {view === "results" ? (
              <>
                <Button className="flex-1" onClick={() => setView("summary")}>
                  Back
                </Button>
                <Button className="flex-1" onClick={startOver}>
                  Start over
                </Button>
              </>
            ) : view === "summary" ? (
              <>
                <Button className="flex-1" onClick={() => setView(2)}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    setChosen(programs[0]?.id ?? null)
                    setView("checking")
                  }}
                >
                  Check Progress
                </Button>
              </>
            ) : (
              <>
                {view === 2 && (
                  <Button className="flex-1" onClick={() => setView(1)}>
                    Back
                  </Button>
                )}
                <Button
                  variant="primary"
                  className="flex-1"
                  /* Nothing to continue to until the first question has an
                     answer; the filters are allowed to ask for everything. */
                  disabled={view === 1 && intent === null}
                  onClick={() => setView(view === 1 ? 2 : "summary")}
                >
                  Continue
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
