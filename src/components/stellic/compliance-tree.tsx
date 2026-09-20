import { cn } from "cn"
import { useState } from "react"

import { Icon } from "@/components/icon"
import { CourseRow, TreeElement } from "@/components/stellic/audit-tree"
import { Badge } from "@/components/ui/badge"
import { ConstraintsCard } from "@/components/stellic/explain-panel"
import {
  EXPLAINABLE,
  constraintCount,
  constraintsForCheck,
  type CheckState,
  type ComplianceCheck,
  type ComplianceEntry,
} from "@/data/compliance"

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

/** The audit's own hover tools, in the audit's own words. They arrive on the
 *  row the pointer is on rather than on all of them at once, and always on a
 *  touch screen, where there is no pointer to travel. */
function CheckTools({ name, onExplain }: { name: string; onExplain?: () => void }) {
  if (!onExplain) return null

  const shown =
    "shrink-0 cursor-pointer rounded-md border border-gray-40 bg-card text-label-md " +
    "text-foreground transition-opacity hover:bg-gray-5 group-hover:opacity-100 " +
    "group-focus-within:opacity-100 max-md:opacity-100 md:opacity-0"

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onExplain()
        }}
        className={cn(shown, "px-[7px] py-px")}
      >
        explain
      </button>
      <button
        type="button"
        aria-label={`Search within ${name}`}
        onClick={(event) => event.stopPropagation()}
        className={cn(shown, "flex size-5 items-center justify-center")}
      >
        <Icon name="s-search" size={12} />
      </button>
    </>
  )
}

function CheckRow({
  check,
  open,
  onToggle,
  onExplain,
  rules,
  onToggleRules,
}: {
  check: ComplianceCheck
  open: boolean
  onToggle: () => void
  /** Offered on the checks that have working to show. */
  onExplain?: () => void
  /** Whether the rules are open underneath this row. */
  rules?: boolean
  onToggleRules?: () => void
}) {
  const hasChildren = check.children.length > 0

  return (
    /* The audit's own requirement ground. It had been grey, which made the
       same row read as two different things on two tabs. */
    /* The row is the control. A chevron the width of a chevron is a small
       target for the commonest thing anyone does here, so the name, the mark
       and the space around them all open it — and the badges inside keep their
       own press, because they do something else. */
    <div
      onClick={hasChildren ? onToggle : undefined}
      className={cn(
        "group flex min-w-0 flex-1 items-center justify-between gap-4 rounded-md border border-gray-40 bg-card p-[7px] transition-colors",
        hasChildren && "cursor-pointer hover:bg-gray-0"
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <CheckMark check={check} />
        <p className="text-body-md font-semibold">{check.name}</p>
        {hasChildren ? (
          <button
            type="button"
            /* The row toggles too, so this has to keep its press to itself —
               otherwise the chevron folds it and the row unfolds it again. */
            onClick={(event) => {
              event.stopPropagation()
              onToggle()
            }}
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
        {/* The badge is already the name of the thing; a second control beside
            it saying "rules" would be naming it twice. */}
        {onToggleRules ? (
          <Badge variant="outline" asChild className="font-normal">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onToggleRules()
              }}
              aria-expanded={rules}
              className="cursor-pointer hover:bg-gray-5"
            >
              {constraintCount(check)} constraints
            </button>
          </Badge>
        ) : (
          <Badge variant="outline" className="font-normal">
            {constraintCount(check)} constraints
          </Badge>
        )}
        <CheckTools name={check.name} onExplain={onExplain} />
      </div>
      {/* Credits banked, not credits wanted — the other way round from a
          requirement, and the reason it sits where the progress bar does. */}
      <Badge variant="outline" className="shrink-0 font-normal">
        {check.credits} credits
      </Badge>
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
  rules,
  onToggleRules,
}: {
  entry: ComplianceEntry
  stem: boolean[]
  last: boolean
  folded: Set<string>
  onToggle: (id: string) => void
  onExplain?: (id: string) => void
  /** Which rows have their rules open underneath them. */
  rules: Set<string>
  onToggleRules: (id: string) => void
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
        rules={rules.has(entry.id)}
        onToggleRules={
          constraintsForCheck(entry).length ? () => onToggleRules(entry.id) : undefined
        }
      />
    </TreeElement>
  )

  /* The rules open as a row of their own, indented one level past the row they
     belong to — they are about it, not beside it. The comment above said
     "indented with its children" and the trail did not do it: the card was
     drawn at the check's own depth with an elbow into it, which is the shape
     of a sibling check rather than of something inside one. Same trail as the
     audit tree, which is the tree this one borrows every other part from. */
  const carriesOn = open && entry.children.length > 0
  const card = rules.has(entry.id) && (
    <TreeElement trail={[...stem.map((line) => ({ line })), { line: !last }, { line: carriesOn }]}>
      <ConstraintsCard
        constraints={constraintsForCheck(entry)}
        onExplain={onExplain && EXPLAINABLE.has(entry.id) ? () => onExplain(entry.id) : undefined}
      />
    </TreeElement>
  )

  if (entry.children.length === 0 || !open)
    return (
      <>
        {row}
        {card}
      </>
    )

  return (
    <>
      {row}
      {card}
      {entry.children.map((child, i) => (
        <EntryRows
          key={childId(child)}
          entry={child}
          stem={[...stem, !last]}
          last={i === entry.children.length - 1}
          folded={folded}
          onToggle={onToggle}
          onExplain={onExplain}
          rules={rules}
          onToggleRules={onToggleRules}
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
  /* Which rows are showing their rules. Held here so the whole ruleset shares
     one answer, as the folding does. */
  const [rules, setRules] = useState(() => new Set<string>())

  const toggleRules = (id: string) =>
    setRules((current) => {
      const next = new Set(current)
      if (!next.delete(id)) next.add(id)
      return next
    })

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
            rules={rules}
            onToggleRules={toggleRules}
          />
        ))}
    </div>
  )
}
