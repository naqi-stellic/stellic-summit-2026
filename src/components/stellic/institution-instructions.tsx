import { Icon } from "@/components/icon"
import { INSTITUTION_INSTRUCTIONS } from "@/data/plan"

/* The other half of the instructions: what the school has already told the
 * generator to do. The student writes theirs in the box above; these are read
 * and not written, which is the whole point of showing them side by side. */

export function InstitutionInstructions({ lines = INSTITUTION_INSTRUCTIONS }: { lines?: string[] }) {
  return (
    <div className="flex w-full flex-col gap-2">
      <span className="flex items-center gap-1 text-body-md font-semibold text-foreground">
        <Icon name="lock" size={16} className="text-gray-80" />
        Institution instructions
      </span>

      <ul className="flex w-full flex-col gap-1 rounded-md border border-gray-40 bg-gray-0 p-[11px]">
        {lines.map((line) => (
          <li key={line} className="flex items-start gap-2 text-body-md text-gray-100">
            <Icon name="check" size={16} className="mt-0.5 shrink-0 text-gray-80" />
            <span className="min-w-0 flex-1">{line}</span>
          </li>
        ))}
      </ul>

      <span className="text-body-md text-gray-80">
        Set by your school and always applied. You cannot change these.
      </span>
    </div>
  )
}
