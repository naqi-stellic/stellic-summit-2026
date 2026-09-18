import { cn } from "cn"
import { useState } from "react"

import { Icon } from "@/components/icon"
import { CourseRow, TreeElement } from "@/components/stellic/audit-tree"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EXPLAINABLE, type CheckState, type ComplianceCheck, type ComplianceEntry } from "@/data/compliance"

/* The eligibility ruleset, drawn with the degree audit's own tree. Every part
 * of it is that tree's — the trail, the course rows, the folding — because a
 * student looking at this has already learned to read the other one, and two
 * kinds of tree would be two things to learn.
 *
 * What changes is the row in the middle. A check is not a requirement: it does
 * not fill up, it passes or it does not, and it carries the credits it has
 * banked rather than the ones it still wants. So its mark is a flag — the
 * thing is a checkpoint — with the state beside it, and its badges count
 * constraints rather than courses. */

const STATE: Record<CheckState, string> = {
  met: "bg-success-50 text-white",
  /* Under way and not yet failed. Warning rather than alert: there is still
     time to fix it, which is the entire premise of a proactive screen. */
  pending: "bg-warning-50 text-white",
  /* The audit's own planned mark: outlined rather than filled, because a plan
     is a statement of intent and the record has not seen it. */
  planned: "border border-warning-50 bg-warning-5 text-warning-50",
  outstanding: "border border-alert-100 text-alert-100",
}

function CheckMark({ check }: { check: ComplianceCheck }) {
  return (
    <span
      className={cn(
        "flex h-6 min-w-6 shrink-0 items-center justify-center gap-0.5 rounded-md p-0.5",
        STATE[check.state]
      )}
    >
      <Icon name="outlined-flag" size={16} />
      {check.state === "met" && <Icon name="check" size={14} />}
      {check.state === "pending" && <Icon name="watch-later" size={16} />}
      {check.state === "planned" && <Icon name="check" size={14} />}
      {check.state === "outstanding" && (
        <span className="min-w-4 text-center text-body-md font-semibold">
          {check.outstanding ?? 0}
        </span>
      )}
    </span>
  )
}

function CheckRow({
  check,
  open,
  onToggle,
  onExplain,
}: {
  check: ComplianceCheck
  open: boolean
  onToggle: () => void
  /** Offered on the checks that have working to show. */
  onExplain?: () => void
}) {
  const hasChildren = check.children.length > 0

  return (
    /* The audit's own requirement ground. It had been grey, which made the
       same row read as two different things on two tabs. */
    <div className="flex min-w-0 flex-1 items-center justify-between gap-4 rounded-md border border-gray-40 bg-card p-[7px]">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <CheckMark check={check} />
        <p className="text-body-md font-semibold">{check.name}</p>
        {hasChildren ? (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-label={`${open ? "Collapse" : "Expand"} ${check.name}`}
            className="shrink-0 cursor-pointer"
          >
            <Icon
              name="chevron-right"
              size={14}
              className={cn("transition-transform", open && "rotate-90")}
            />
          </button>
        ) : (
          <Icon name="chevron-right" size={14} className="shrink-0" />
        )}
        <Badge variant="outline" className="font-normal">
          {check.constraints} constraints
        </Badge>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {/* The verdict is on the row; the working is behind this. */}
        {onExplain && (
          <Button size="sm" onClick={onExplain}>
            Explain
          </Button>
        )}
        {/* Credits banked, not credits wanted — the other way round from a
            requirement, and the reason it sits where the progress bar does. */}
        <Badge variant="outline" className="font-normal">
          {check.credits} credits
        </Badge>
      </div>
    </div>
  )
}

function EntryRows({
  entry,
  stem,
  last,
  folded,
  onToggle,
  onExplain,
}: {
  entry: ComplianceEntry
  stem: boolean[]
  last: boolean
  folded: Set<string>
  onToggle: (id: string) => void
  onExplain?: (id: string) => void
}) {
  const trail = [...stem.map((line) => ({ line })), { line: true, elbow: true, last }]

  if (entry.kind === "course") {
    return (
      <TreeElement trail={trail}>
        <CourseRow course={entry} />
      </TreeElement>
    )
  }

  const open = !folded.has(entry.id)
  const row = (
    <TreeElement trail={trail}>
      <CheckRow
        check={entry}
        open={open}
        onToggle={() => onToggle(entry.id)}
        onExplain={
          onExplain && EXPLAINABLE.has(entry.id) ? () => onExplain(entry.id) : undefined
        }
      />
    </TreeElement>
  )

  if (entry.children.length === 0 || !open) return row

  return (
    <>
      {row}
      {entry.children.map((child, i) => (
        <EntryRows
          key={childId(child)}
          entry={child}
          stem={[...stem, !last]}
          last={i === entry.children.length - 1}
          folded={folded}
          onToggle={onToggle}
          onExplain={onExplain}
        />
      ))}
    </>
  )
}

function childId(entry: ComplianceEntry): string {
  return entry.id
}

/** Everything that opens folded: every check but the year under way and the
 *  one thing inside it that is going wrong. A ruleset five years long would
 *  otherwise open as four hundred rows of things that have not happened. */
function initialFold(root: ComplianceCheck): Set<string> {
  const folded = new Set<string>()

  const walk = (entry: ComplianceEntry) => {
    if (entry.kind === "course") return
    if (entry.kind === "check" && !entry.open) folded.add(entry.id)
    entry.children.forEach(walk)
  }
  walk(root)

  return folded
}

export function ComplianceTree({
  ruleset,
  onExplain,
}: {
  ruleset: ComplianceCheck
  onExplain?: (id: string) => void
}) {
  const [folded, setFolded] = useState(() => initialFold(ruleset))

  const toggle = (id: string) =>
    setFolded((current) => {
      const next = new Set(current)
      if (!next.delete(id)) next.add(id)
      return next
    })

  const open = !folded.has(ruleset.id)

  return (
    <div className="flex flex-col gap-2">
      {/* The ruleset heads the tree rather than hanging off it, so it has no
          trail and no ground — the same place the degree takes on Progress. */}
      <div className="flex items-center gap-2 py-2">
        <button
          type="button"
          onClick={() => toggle(ruleset.id)}
          aria-expanded={open}
          className="flex cursor-pointer items-center gap-2"
        >
          <span className="text-caption-lg font-semibold">{ruleset.name}</span>
          <Icon
            name="expand-more"
            size={14}
            className={cn("transition-transform", !open && "-rotate-90")}
          />
        </button>
        <Badge variant="outline" className="font-normal">
          {ruleset.constraints} constraints
        </Badge>
      </div>

      {open &&
        ruleset.children.map((child, i) => (
          <EntryRows
            key={childId(child)}
            entry={child}
            stem={[]}
            last={i === ruleset.children.length - 1}
            onExplain={onExplain}
            folded={folded}
            onToggle={toggle}
          />
        ))}
    </div>
  )
}
