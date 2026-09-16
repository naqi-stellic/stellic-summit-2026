import { cn } from "cn"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  creditsToGo,
  programStanding,
  programTotal,
  type Program,
} from "@/data/programs"

/* What the transcript is worth elsewhere. One card per program, and the card
 * is the audit's own reading of it: the same four shares, the same colours,
 * counted the same way — so a student who has read the tree above can read
 * this without being taught anything new.
 *
 * Sorted by what is left, because that is the thing anyone actually weighs. */

const SHARES = [
  { key: "taken", colour: "bg-success-50", dot: "bg-success-50" },
  { key: "inProgress", colour: "bg-warning-75", dot: "bg-warning-75" },
  { key: "planned", colour: "bg-warning-25", dot: "bg-warning-25" },
  { key: "remaining", colour: "bg-gray-40", dot: "bg-gray-40" },
] as const

function ProgramCard({
  program,
  selected,
  onSelect,
  canAdd,
  addLabel,
  onAdd,
}: {
  program: Program
  selected: boolean
  onSelect: () => void
  /** Whether this run is going to change the record, or only look at it. */
  canAdd: boolean
  addLabel: string
  onAdd: () => void
}) {
  const total = programTotal(program)
  const standing = programStanding(program)

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-md border p-[15px] transition-colors",
        selected ? "border-primary-50 bg-primary-0" : "border-gray-40 bg-card hover:border-gray-60"
      )}
    >
      {/* The whole card is the way to choose it; the buttons inside belong to
          the one already chosen. */}
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className="flex cursor-pointer flex-col gap-3 text-left"
      >
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-body-md font-semibold text-foreground">{program.name}</span>
          <Badge variant="secondary" className="lowercase">
            {program.kind}
          </Badge>
        </span>
        <span className="text-body-md text-gray-80">
          {program.school} · {program.department}
        </span>

        <span className="flex flex-col gap-2">
          <span className="flex items-baseline justify-between gap-4">
            <span className="text-body-md text-foreground">Courses</span>
            <span className="text-body-md font-semibold text-success-100">
              {creditsToGo(program)} credits to go
            </span>
          </span>
          <span className="flex h-2 w-full overflow-hidden rounded-full">
            {SHARES.map((share) => (
              <span
                key={share.key}
                className={cn(share.colour, share.key !== "remaining" && "border-r border-white")}
                style={{ width: `${(standing[share.key] / total) * 100}%` }}
              />
            ))}
          </span>
          <span className="flex flex-wrap items-center gap-x-[17px]">
            {SHARES.map((share) => (
              <span key={share.key} className="flex items-center gap-2 px-0.5">
                <span className={cn("size-2 shrink-0 rounded-full", share.dot)} />
                <span className="text-body-md text-gray-80">{standing[share.key]}</span>
              </span>
            ))}
          </span>
        </span>
      </button>

      {selected && (
        <div className="flex flex-wrap items-center gap-2">
          {/* Just exploring changes nothing, so there is nothing to press but
              the way to read more. */}
          {canAdd && (
            <Button variant="primary" onClick={onAdd}>
              {addLabel}
            </Button>
          )}
          <Button>Program Details</Button>
        </div>
      )}
    </div>
  )
}

export function DiscoverResults({
  programs,
  selected,
  onSelect,
  canAdd,
  addLabel,
  onAdd,
}: {
  programs: Program[]
  selected: string | null
  onSelect: (id: string) => void
  canAdd: boolean
  addLabel: string
  onAdd: (program: Program) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-body-md font-semibold text-foreground">
          Programs matching your criteria
        </h3>
        <p className="text-body-md text-gray-80">
          {programs.length} {programs.length === 1 ? "program" : "programs"}, sorted by fewest
          credits remaining
        </p>
      </div>

      {programs.length === 0 ? (
        <p className="text-body-md text-gray-80">
          Nothing matches those filters. Go back and loosen one.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {programs.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              selected={program.id === selected}
              onSelect={() => onSelect(program.id)}
              canAdd={canAdd}
              addLabel={addLabel}
              onAdd={() => onAdd(program)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
