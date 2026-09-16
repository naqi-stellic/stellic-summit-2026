import { useDraggable } from "@dnd-kit/core"
import { cn } from "cn"

import { Icon } from "@/components/icon"
import type { CatalogEntry } from "@/data/catalog"
import { COMPLETED, DEGREE, type Year } from "@/data/plan"

/* Everything the degree still wants, with nowhere to be yet. The plan is not
 * finished until this list is empty, so each row is picked up from here and
 * dropped into the term it is going to be taken in. */

/** The id a row is dragged under. The planner reads the index back off it. */
export const REQUIREMENT_ID = "requirement:"

export function requirementIndex(id: string): number | null {
  if (!id.startsWith(REQUIREMENT_ID)) return null
  const index = Number(id.slice(REQUIREMENT_ID.length))
  return Number.isNaN(index) ? null : index
}

/** A course still to place, or a seat held against a requirement that has no
 *  course chosen for it. The seat says what it is for rather than naming a
 *  course, and opens onto the choice; the course is itself. */
export function RequirementRow({
  entry,
  id,
  overlay,
  onOpen,
}: {
  entry: CatalogEntry
  id?: string
  /** Drawn under the cursor rather than in the list. */
  overlay?: boolean
  /** Opens the course on its own. A press that does not travel far enough to
   *  start a drag is a click, which is what this answers. */
  onOpen?: () => void
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: id ?? `${REQUIREMENT_ID}overlay`,
    disabled: overlay || id == null,
  })

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      {...(overlay ? {} : listeners)}
      {...(overlay ? {} : attributes)}
      onClick={overlay ? undefined : onOpen}
      className={cn(
        "flex w-full cursor-grab items-center gap-2 rounded-md border border-gray-40 bg-card p-[11px]",
        !overlay && onOpen && "transition-colors hover:bg-gray-0",
        overlay && "cursor-grabbing shadow-secondary",
        isDragging && "opacity-40"
      )}
    >
      <Icon name="drag-indicator" size={16} className="shrink-0 text-gray-40" />

      <span className="flex min-w-0 flex-1 flex-col">
        {/* A seat has no course, so it has no code to show. */}
        {!entry.placeholder && (
          <span className="truncate text-body-md text-gray-80">{entry.code}</span>
        )}
        <span className="truncate text-body-md font-semibold text-foreground">{entry.name}</span>
      </span>

      {entry.placeholder && (
        <Icon name="chevron-right" size={16} className="shrink-0 text-gray-80" />
      )}
    </div>
  )
}

/** One of the three shares of the degree, drawn as a length of the bar and
 *  read back underneath it. */
type Share = { label: string; count: number; icon: "check" | "shopping-cart" | "crop-square"; bar: string; tone: string }

function Meter({ total, shares }: { total: number; shares: Share[] }) {
  return (
    <div className="flex w-full flex-col gap-2">
      <span className="flex h-1.5 w-full overflow-hidden rounded-md bg-gray-5">
        {shares.map((share) => (
          <span
            key={share.label}
            className={share.bar}
            style={{ width: `${total === 0 ? 0 : (share.count / total) * 100}%` }}
          />
        ))}
      </span>
      <span className="flex flex-wrap items-center gap-4">
        {shares.map((share) => (
          <span
            key={share.label}
            title={share.label}
            className="flex items-center gap-1 text-body-md text-gray-100"
          >
            <Icon name={share.icon} size={16} className={share.tone} />
            {share.count}
          </span>
        ))}
      </span>
    </div>
  )
}

export function RequirementsPanel({
  entries,
  years,
  onOpenCourse,
}: {
  /** What is still to place, in the order the degree asks for it, each with
   *  its place in that list. */
  entries: { entry: CatalogEntry; index: number }[]
  /** The plan as it stands, for the shares at the top. */
  years: Year[]
  /** Opens one of them on its own, by its place in the outstanding list. */
  onOpenCourse?: (index: number) => void
}) {
  const placed = years.reduce(
    (sum, year) => sum + year.terms.reduce((n, term) => n + term.courses.length, 0),
    0
  )
  /* Taken, planned, and still to place. They are three counts of the same
     forty, so each is read from where it actually lives rather than inferred
     from the other two. */
  const done = COMPLETED.courses

  /* Grouped the way the degree asks for them — core before concentration
     before general — which is the order they are listed in. */
  const groups: { name: string; entries: { entry: CatalogEntry; index: number }[] }[] = []
  entries.forEach(({ entry, index }) => {
    const name = entry.reason ?? "Other requirements"
    const group = groups.find((g) => g.name === name)
    if (group) group.entries.push({ entry, index })
    else groups.push({ name, entries: [{ entry, index }] })
  })

  return (
    /* pb-28 keeps the last few rows clear of the assistant, which floats over
       the foot of whatever is beside the plan. */
    <aside className="flex h-full w-full flex-col gap-6 overflow-x-clip overflow-y-auto bg-card p-6 pb-28">
      <header className="flex w-full flex-col gap-2">
        <h2 className="text-h300 font-semibold text-gray-100">Add remaining courses</h2>
        <p className="text-body-md text-gray-80">
          Your plan isn't done until every requirement has a term. Drag each one into the term you
          plan to take it.
        </p>
      </header>

      <div className="flex w-full flex-col gap-2">
        <span className="text-body-md font-semibold text-foreground">Courses</span>
        <Meter
          total={DEGREE.requirements}
          shares={[
            {
              label: "Complete",
              count: done,
              icon: "check",
              bar: "bg-success-50",
              tone: "text-success-50",
            },
            {
              label: "Planned",
              count: placed,
              icon: "shopping-cart",
              bar: "bg-warning-25",
              tone: "text-warning-50",
            },
            {
              label: "Still to place",
              count: entries.length,
              icon: "crop-square",
              bar: "bg-gray-40",
              tone: "text-gray-80",
            },
          ]}
        />
      </div>

      <div className="flex w-full flex-col gap-2">
        <span className="flex items-center gap-1 text-body-md font-semibold text-foreground">
          <Icon name="outlined-flag" size={16} className="text-gray-100" />
          Milestones
        </span>
        <Meter
          total={DEGREE.milestones}
          shares={[
            {
              label: "Complete",
              count: DEGREE.milestonesDone,
              icon: "check",
              bar: "bg-success-50",
              tone: "text-success-50",
            },
            {
              label: "Still ahead",
              count: DEGREE.milestones - DEGREE.milestonesDone,
              icon: "crop-square",
              bar: "bg-gray-40",
              tone: "text-gray-80",
            },
          ]}
        />
      </div>

      <div className="flex w-full items-center justify-between gap-2">
        <h3 className="min-w-0 text-body-md font-semibold text-gray-100">
          {entries.length} Remaining Requirement{entries.length === 1 ? "" : "s"}
        </h3>
        <a
          href="#"
          className="shrink-0 text-body-md text-primary-50 underline [text-underline-position:from-font]"
        >
          view in Progress
        </a>
      </div>

      {entries.length === 0 && (
        <p className="text-body-md text-gray-80">
          Every requirement has a term. There is nothing left to place.
        </p>
      )}

      {groups.map((group) => (
        <div key={group.name} className="flex w-full flex-col gap-2">
          <div className="flex w-full items-baseline justify-between gap-2 text-body-md text-gray-80">
            <span className="min-w-0 truncate">{group.name}</span>
            <span className="shrink-0">{group.entries.length} remaining</span>
          </div>
          {group.entries.map(({ entry, index }) => (
            <RequirementRow
              key={`${entry.code}-${index}`}
              id={`${REQUIREMENT_ID}${index}`}
              entry={entry}
              onOpen={onOpenCourse && (() => onOpenCourse(index))}
            />
          ))}
        </div>
      ))}
    </aside>
  )
}
