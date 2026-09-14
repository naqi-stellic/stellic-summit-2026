import { cn } from "cn"
import type { ReactNode } from "react"

import { Icon } from "@/components/icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

/* What the panel shows once a draft exists: the instructions it was built from,
 * and the options it came up with. Picking one redraws the canvas. */

export type PlanOptionSummary = {
  id: string
  label: string
  blurb: string
  graduation: string
  added: number
  removed: number
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="animate-fade flex w-full flex-col gap-2">
      <div className="flex w-full items-center pb-2">
        <h3 className="flex-1 text-caption-lg font-semibold text-gray-100">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export function GeneratePlanOptions({
  instructions,
  options,
  selected,
  onSelect,
  onEdit,
}: {
  /** One line reading back what the draft was built from. */
  instructions: string
  options: PlanOptionSummary[]
  selected: string
  onSelect: (id: string) => void
  onEdit: () => void
}) {
  return (
    <>
      <Section title="Plan instructions">
        <div className="flex w-full items-center justify-between gap-2 rounded-md border border-gray-40 bg-gray-0 p-[15px]">
          <p className="min-w-0 flex-1 text-body-md text-gray-100">{instructions}</p>
          <Button onClick={onEdit}>
            <Icon name="edit" size={16} />
            Edit
          </Button>
        </div>
      </Section>

      <Section title="Plan options">
        <RadioGroup value={selected} onValueChange={onSelect} className="w-full gap-2">
          {options.map((option, index) => {
            const active = option.id === selected
            return (
              <div
                key={option.id}
                className={cn(
                  "flex w-full flex-col gap-2 rounded-md border p-[11px] transition-colors",
                  active ? "border-primary-50" : "border-gray-40"
                )}
              >
                <label className="flex w-full cursor-pointer items-start gap-3 border-b border-gray-40 pb-4">
                  <span className="flex items-center py-0.5">
                    <RadioGroupItem value={option.id} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 pt-px text-body-md">
                    <span className="font-semibold text-foreground">Option {index + 1}</span>
                    <span className="text-gray-80">Expected Graduation {option.graduation}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1">
                    <Badge variant="success">+{option.added}</Badge>
                    {option.removed > 0 && <Badge variant="danger">-{option.removed}</Badge>}
                  </span>
                </label>
                <p className="w-full text-label-md text-gray-100">
                  {/* The strategy names the option rather than replacing its
                      number, so "Option 2" stays the thing you refer to. */}
                  <span className="font-semibold">{option.label}.</span> {option.blurb}
                </p>
              </div>
            )
          })}
        </RadioGroup>
      </Section>
    </>
  )
}
