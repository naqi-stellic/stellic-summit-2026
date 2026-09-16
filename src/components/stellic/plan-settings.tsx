import { cn } from "cn"

import { describePace, type PaceState } from "@/components/stellic/generate-plan-pace"
import { DEGREE, INSTITUTION_INSTRUCTIONS, PLANNING_RULES, type PlanStanding } from "@/data/plan"

/* Everything a plan is generated from, in one place: the answers the student
 * gave and the institution settings that apply regardless. The review screen
 * and the Edit Settings card both read from here, so they can't disagree. */

/** Which wizard step owns a row, where one does. A row with no step is a fact
 *  about the degree or the institution rather than an answer. */
export type SettingStep = 1 | 2 | 3

export type SettingRow = {
  label: string
  value: string
  step?: SettingStep
}

export function planSettings({
  standing,
  graduation,
  campus,
  keepPlanned,
  released,
  pace,
  notes,
}: {
  standing: PlanStanding
  graduation: string
  campus: string
  keepPlanned: string
  /** How many planned courses the student left open for the generator. */
  released: number
  pace: PaceState
  notes: string
}): { choices: SettingRow[]; rules: SettingRow[] } {
  const choices: SettingRow[] = [
    { label: "Program", value: DEGREE.program },
    { label: "Concentration", value: DEGREE.concentration },
    { label: "Minor", value: DEGREE.minor },
    { label: "Expected Graduation", value: graduation },
    {
      label: "Keeping",
      value:
        keepPlanned === "yes"
          ? "Everything planned"
          : `${standing.planned.reqs - released} of ${standing.planned.reqs} courses`,
      step: 2,
    },
    { label: "Pacing", value: describePace(pace), step: 2 },
  ]

  /* Nothing typed in step 3 means nothing to read back, so the row goes away
   * rather than reporting its own emptiness. */
  if (notes.trim()) {
    choices.push({ label: "Anything else", value: notes.trim(), step: 3 })
  }

  const rules: SettingRow[] = [
    { label: "Requirement priority", value: PLANNING_RULES.requirementPriority },
    { label: "Campus", value: campus },
    {
      label: "Existing credit",
      value: `${standing.completed.reqs} courses, ${standing.completed.credits} credits`,
    },
    { label: "Prerequisites, co-reqs, anti-reqs", value: PLANNING_RULES.prerequisites },
    {
      label: "Term offerings",
      value: `confirmed through ${PLANNING_RULES.offeringsThrough}, projected after`,
    },
    { label: "Credit load limits", value: `max ${PLANNING_RULES.maxCreditsPerTerm} per term` },
    { label: "Double counting rules", value: PLANNING_RULES.doubleCounting },
    { label: "Institution instructions", value: INSTITUTION_INSTRUCTIONS },
  ]

  return { choices, rules }
}

export function SettingsSection({
  title,
  rows,
  onEdit,
}: {
  title: string
  rows: SettingRow[]
  /** Given, every row that belongs to a step offers a way back to it. */
  onEdit?: (step: SettingStep) => void
}) {
  return (
    <div className="flex w-full flex-col gap-2 overflow-clip">
      <p className="text-overline font-medium tracking-[0.5px] text-gray-100 uppercase">{title}</p>
      {rows.map((row, i) => (
        <div
          key={row.label}
          className={cn("flex w-full items-start gap-2 text-body-md", i === 0 && "pt-2")}
        >
          <p className="w-[148px] shrink-0 text-gray-80">{row.label}</p>
          <p className="min-w-0 flex-1 text-gray-100">{row.value}</p>
          {/* Offered only where it leads somewhere: the step that set it. */}
          {onEdit && row.step && (
            <button
              type="button"
              onClick={() => onEdit(row.step!)}
              className="shrink-0 cursor-pointer text-gray-80 underline [text-underline-position:from-font]"
            >
              edit
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
