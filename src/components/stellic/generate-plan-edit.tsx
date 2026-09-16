import {
  SettingsSection,
  type SettingRow,
  type SettingStep,
} from "@/components/stellic/plan-settings"
import { Button } from "@/components/ui/button"
import { INSTITUTION_INSTRUCTIONS } from "@/data/plan"

/* The instructions card opened up: everything the draft was built from, each
 * answer linked back to the step that set it, and the two ways out — start the
 * questions again, or run them again as they stand. The draft on the canvas
 * stays where it is meanwhile. */

export function GeneratePlanEdit({
  choices,
  onCancel,
  onEditStep,
  onStartOver,
  onRegenerate,
  canRegenerate,
}: {
  choices: SettingRow[]
  onCancel: () => void
  onEditStep: (step: SettingStep) => void
  onStartOver: () => void
  onRegenerate: () => void
  /* Nothing to re-run until an answer actually differs from the one the draft
   * on the canvas was built from. */
  canRegenerate: boolean
}) {
  return (
    <div className="animate-fade flex w-full flex-col gap-2 rounded-md border border-gray-40 bg-gray-0 p-[15px]">
      {/* The card's own 8px gap is all that separates this from the first
          group heading, so the row carries no padding of its own. */}
      <div className="flex w-full items-center justify-between gap-2">
        <p className="min-w-0 flex-1 text-body-md font-semibold text-gray-100">Edit Settings</p>
        <Button onClick={onCancel}>Cancel</Button>
      </div>

      <SettingsSection title="Your choices" rows={choices} onEdit={onEditStep} />
      <SettingsSection title="Also accounting for" text={INSTITUTION_INSTRUCTIONS} />

      <div className="flex w-full items-center gap-2 pt-2">
        <Button className="flex-1" onClick={onStartOver}>
          Start over
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          disabled={!canRegenerate}
          onClick={onRegenerate}
        >
          Re-generate plan
        </Button>
      </div>
    </div>
  )
}
