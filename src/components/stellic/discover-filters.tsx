import { cn } from "cn"

import { FilterBar } from "@/components/stellic/filter-bar"
import {
  FILTER_GROUPS,
  fieldOptions,
  activeFilters,
  type FilterState,
  type Program,
} from "@/data/programs"

/* Step 2: narrowing the catalogue down to the programs worth checking against.
 *
 * The row itself is the planner's own filter row; what belongs here is which
 * questions it asks and what each one can be answered with, which is read off
 * the programs on offer rather than written down beside them. */

export function DiscoverFilters({
  filters,
  onChange,
  onOffer,
  matches,
}: {
  filters: FilterState
  onChange: (next: FilterState) => void
  /** The programs this run is choosing between — changing a major is offered
   *  only majors, so the filters must offer only what those hold. */
  onOffer: Program[]
  /** How many programs the filters leave, which is the only reading of them
   *  that matters before Continue is pressed. */
  matches: number
}) {
  const groups = FILTER_GROUPS.map((group) => ({
    ...group,
    fields: group.fields.map((field) => ({
      ...field,
      options: fieldOptions(field.id, onOffer),
    })),
  }))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-body-md font-semibold text-foreground">Find Programs</h3>
        <p className="text-body-md text-gray-80">Use filters to identify the programs</p>
      </div>

      <div className="flex flex-col gap-4">
        <FilterBar
          groups={groups}
          filters={filters as Record<string, string[]>}
          onChange={(next) => onChange(next as FilterState)}
        />

        {activeFilters(filters).length > 0 && (
          <p className={cn("text-body-md", matches === 0 ? "text-alert-100" : "text-gray-80")}>
            {matches} {matches === 1 ? "program" : "programs"} with selected filters
          </p>
        )}
      </div>
    </div>
  )
}
