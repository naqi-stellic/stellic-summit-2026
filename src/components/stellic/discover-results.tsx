import { cn } from "cn"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  creditsToGo,
  programNoun,
  programStanding,
  programTotal,
  reusedCredits,
  reusedShare,
  type Program,
} from "@/data/programs"

/* What the transcript is worth elsewhere. One card per program, and the card
 * is the audit's own reading of it: the same four shares, the same colours,
 * counted the same way — so a student who has read the tree above can read
 * this without being taught anything new.
 *
 * Every program is on screen from the first moment, with its progress still
 * arriving. That is the honest shape of the work: the catalogue is known at
 * once and the audit against it is not, so the list is complete and each row
 * fills itself in. A spinner over the whole panel hid a list that was ready. */

const SHARES = [
  { key: "taken", colour: "bg-success-50", dot: "bg-success-50" },
  { key: "inProgress", colour: "bg-warning-75", dot: "bg-warning-75" },
  { key: "planned", colour: "bg-warning-25", dot: "bg-warning-25" },
  { key: "remaining", colour: "bg-gray-40", dot: "bg-gray-40" },
] as const

/** Three dots taking their turn. The wait is per card and short, so it wants a
 *  pulse rather than a spinner — a spinner says "wait", and there is a whole
 *  list to be reading in the meantime. */
function Ellipsis() {
  return (
    <span aria-hidden="true">
      {[0, 200, 400].map((delay) => (
        <span
          key={delay}
          className="inline-block animate-ellipsis"
          style={{ animationDelay: `${delay}ms` }}
        >
          .
        </span>
      ))}
    </span>
  )
}

function ProgramCard({
  program,
  loaded,
  selected,
  onSelect,
  intent,
  onAdd,
  onSwitch,
}: {
  program: Program
  /** Whether this program's audit has come back yet. */
  loaded: boolean
  selected: boolean
  onSelect: () => void
  /** Whether this run is going to change the record, or only look at it. */
  /** What this run came to do, which decides which of the two is the
   *  primary. `null` when nothing is going to change the record. */
  intent: "add" | "change" | null
  onAdd: () => void
  onSwitch: () => void
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

        {loaded ? (
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
        ) : (
          <span className="text-body-md text-gray-60">
            Loading progress
            <Ellipsis />
          </span>
        )}
      </button>

      {selected && (
        <div className="flex flex-wrap items-center gap-2">
          {/* Just exploring changes nothing, so there is nothing to press but
              the way to read more. */}
          {/* The primary is what was asked for. Somebody changing their major
              came to press Switch to, and the other one is the thing they
              might do instead — so it is offered, quietly, and named for what
              it would do rather than repeating the card's own word. Only a
              major can take a major's place, so only a major offers it. */}
          {intent === "change" && (
            <>
              {program.kind === "Major" && (
                <Button variant="primary" onClick={onSwitch}>
                  Switch to
                </Button>
              )}
              <Button onClick={onAdd}>Add additional</Button>
            </>
          )}
          {intent === "add" && (
            <>
              <Button variant="primary" onClick={onAdd}>
                Add Program
              </Button>
              {program.kind === "Major" && <Button onClick={onSwitch}>Switch to</Button>}
            </>
          )}
          <Button>Program Details</Button>
        </div>
      )}
    </div>
  )
}

export function DiscoverResults({
  programs,
  loaded,
  selected,
  onSelect,
  intent,
  onAdd,
  onSwitch,
}: {
  programs: Program[]
  /** The ids whose audit has come back. */
  loaded: string[]
  selected: string | null
  onSelect: (id: string) => void
  intent: "add" | "change" | null
  onAdd: (program: Program) => void
  onSwitch: (program: Program) => void
}) {
  const waiting = loaded.length < programs.length


  /* A program cannot be ranked before it has been audited, so the ones that
     have come back sort to the top and the rest hold their catalogue order
     until they do. The list ranks itself as it fills. */
  const order = [...programs].sort((a, b) => {
    const known = Number(loaded.includes(b.id)) - Number(loaded.includes(a.id))
    if (known !== 0) return known
    if (!loaded.includes(a.id)) return 0
    return reusedShare(b) - reusedShare(a) || reusedCredits(b) - reusedCredits(a)
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-body-md font-semibold text-foreground">
          Programs matching your criteria
        </h3>
        <p className="text-body-md text-gray-80">
          {programs.length} {programNoun(programs)}
          {waiting ? (
            <>
              {" found — loading progress"}
              <Ellipsis />
            </>
          ) : (
            ", sorted by how much you have already done"
          )}
        </p>
      </div>

      {programs.length === 0 ? (
        <p className="text-body-md text-gray-80">
          Nothing matches those filters. Go back and loosen one.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {order.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              loaded={loaded.includes(program.id)}
              selected={program.id === selected}
              onSelect={() => onSelect(program.id)}
              intent={intent}
              onAdd={() => onAdd(program)}
              onSwitch={() => onSwitch(program)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
