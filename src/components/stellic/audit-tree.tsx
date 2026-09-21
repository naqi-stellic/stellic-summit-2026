import { cn } from "cn"
import * as React from "react"
import { useState } from "react"

import { Icon, type IconName } from "@/components/icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type {
  AuditCourse,
  AuditEntry,
  AuditGroup,
  AuditMark,
  AuditMilestone,
} from "@/data/audit"
import { outstanding } from "@/data/audit"
import type { AuditBarShares } from "@/data/audit"
import type { Gpa } from "@/data/gpa"

/** What a row offers beyond reading: the way to ask why it says what it says.
 *  Absent on the prototypes that do not explain anything. */
export type Explain = {
  onExplain: (group: AuditGroup) => void
  /** Whether the row's own rules can be opened underneath it. */
  constraints?: (group: AuditGroup) => React.ReactNode
  /** How many rules there are, for the chip that opens them. The tree does not
   *  know how a requirement's constraints are worked out, so it asks. */
  count?: (group: AuditGroup) => number
  /** The average this row computes, where it computes one — the programme
   *  always does, and a requirement does only if somebody has put a "Compute
   *  GPA for this requirement" constraint on it. Given, the row wears it and
   *  pressing it opens the working. */
  gpa?: (group: AuditGroup) => Gpa | undefined
  onGpa?: (group: AuditGroup) => void
}

/* The degree audit, drawn as a tree. Every row is the same three parts: the
 * trail that says where it sits, the mark that says how it stands, and the row
 * itself. What differs between a requirement and a course is the ground under
 * it, not the shape. */

/* ============================================================ AuditMarkIcon
   The 24px square at the head of a row. Each state is a ground and a glyph,
   which is the whole of it — a course, a requirement and a whole program all
   read their state off the same six squares. */

/** The UI Kit ships two in-progress marks and lets the institution pick:
 *  Option A is the green clock, Option B the orange one. Most partners do not
 *  read green as "not finished yet", so this is Option B — and it is one
 *  constant rather than a colour buried in the map below, because it is a
 *  choice somebody makes rather than a fact about the design. */
const IN_PROGRESS = "bg-warning-50 text-white"

const MARK: Record<AuditMark, { ground: string; icon?: IconName; glyph?: number }> = {
  taken: { ground: "bg-success-50 text-white", icon: "check", glyph: 14 },
  "in-progress": { ground: IN_PROGRESS, icon: "watch-later", glyph: 16 },
  registered: { ground: "bg-warning-50 text-white", icon: "event-available", glyph: 16 },
  planned: { ground: "border border-warning-50 bg-warning-5 text-warning-50", icon: "check", glyph: 14 },
  /* Nothing placed against it yet, and something has to be: an empty box in
     the colour of the count it is adding to. */
  remaining: { ground: "border border-alert-50 text-alert-50" },
  /* Nothing placed against it and nothing needs to be. A rule, not a box to
     fill, so it is struck through rather than left open. */
  optional: { ground: "border border-gray-80 text-gray-80" },
}

export function AuditMarkIcon({
  mark,
  milestone,
  count,
  size = 24,
}: {
  mark: AuditMark
  /** A flag beside the mark: this one is a checkpoint rather than a course. */
  milestone?: boolean
  /** How many items are still needed, on a requirement that is holding some.
   *  A course is one item and carries no number; a requirement is a box of
   *  them, and the number is the count — which is the whole difference
   *  between the blank remaining mark and the numbered one. */
  count?: number
  size?: 16 | 24
}) {
  const { ground, icon, glyph } = MARK[mark]
  /* The mapping list runs at 16, where a 14px tick inside a 16px box leaves no
     box. Everything scales off the box rather than being a second set. */
  const scale = size / 24

  /* Only the remaining mark is numbered. The kit ships the count as a variant
     of that one and of no other, and it reads right: a requirement under way
     says it is under way, and a requirement waiting says how much for. */
  const numbered = mark === "remaining" && count !== undefined && count > 0

  return (
    <span
      style={{
        height: size,
        ...(milestone || numbered ? { minWidth: size } : { width: size }),
      }}
      className={cn(
        "flex shrink-0 items-center justify-center gap-0.5 rounded-md p-0.5",
        ground
      )}
    >
      {milestone && <Icon name="outlined-flag" size={Math.round(16 * scale)} />}
      {numbered ? (
        <span
          className="min-w-4 text-center font-semibold"
          style={{ fontSize: Math.round(14 * scale) }}
        >
          {count}
        </span>
      ) : (
        icon && glyph && <Icon name={icon} size={Math.round(glyph * scale)} />
      )}
      {mark === "optional" && <span className="h-px w-2.5 rounded-full bg-gray-80" />}
    </span>
  )
}

/** The red tallies on the degree row: how many requirements are outstanding,
 *  and how many milestones. Same box as a mark, sized to its number. */
function CountMark({ count, milestone }: { count: number; milestone?: boolean }) {
  return (
    <span className="flex h-6 min-w-6 shrink-0 items-center justify-center gap-0.5 rounded-md border border-alert-50 p-0.5 text-alert-50">
      {milestone && <Icon name="outlined-flag" size={16} />}
      <span className="min-w-4 text-center text-body-md font-semibold">{count}</span>
    </span>
  )
}

/* ============================================================ ProgressBar
   Fixed at the design's width — it is a glance, not a measure, and the rows it
   sits on are different widths.

   Three colours, as the UI Kit draws one: what is done, what is claimed but
   not earned, and what nothing has been placed against. Two filled bands and
   no more — the kit gives in-progress and registered the same amber and tells
   them apart by glyph, so a bar seven pixels tall cannot do better. */
function AuditBar({ bar }: { bar: AuditBarShares }) {
  const share = (n: number) => `${(n / bar.total) * 100}%`

  return (
    <span className="flex h-2 w-[101.5px] shrink-0 overflow-hidden rounded-full">
      <span className="bg-success-50" style={{ width: share(bar.done) }} />
      <span className="bg-warning-25" style={{ width: share(bar.claimed) }} />
      <span className="flex-1 bg-gray-40" />
    </span>
  )
}

/* ============================================================ Trail
   Where a row sits in the tree, one 40px cell per level above it. The line
   runs down the middle of its cell and overruns the row by the gap between
   rows, so it reads as one line behind the tree rather than a dash per row.

   A branch that carries on meets its row square — it is a T, and the line
   goes past. A branch that ends turns into its row on an 8px radius and stops
   there, which is the only corner in the tree and the whole of how you see,
   at a glance down the left edge, where a group finishes. Both stop 4px short
   of the cell, which is the gap the row leaves in front of itself. */

export function Trail({ cells }: { cells: { line: boolean; elbow?: boolean; last?: boolean }[] }) {
  if (cells.length === 0) return null

  return (
    <span className="flex shrink-0 gap-0.5 self-stretch" aria-hidden="true">
      {cells.map((cell, i) => {
        const ends = cell.elbow && cell.last

        return (
          <span key={i} className="relative w-10 shrink-0">
            {cell.line && !ends && (
              <span className="absolute -top-2 -bottom-2 left-5 w-px bg-divider" />
            )}
            {cell.elbow &&
              (ends ? (
                <span className="absolute -top-2 bottom-1/2 right-1 left-5 rounded-bl-lg border-b border-l border-divider" />
              ) : (
                <span className="absolute top-1/2 right-1 left-5 h-px bg-divider" />
              ))}
          </span>
        )
      })}
    </span>
  )
}

/* ============================================================ rows */

export function TreeElement({
  trail,
  className,
  children,
  ...props
}: {
  trail: { line: boolean; elbow?: boolean; last?: boolean }[]
} & React.ComponentProps<"div">) {
  return (
    <div className={cn("group flex items-stretch gap-1 bg-card", className)} {...props}>
      <Trail cells={trail} />
      {children}
    </div>
  )
}

/** The tags after a requirement's name. The degree and its programs carry the
 *  smaller Badge/Tag; everything under them carries the shadcn badge. */
function Tags({
  tags,
  small,
  onToggle,
  open,
  count,
}: {
  tags?: string[]
  small?: boolean
  /** Given, the first tag is the way into the rules it is the headline of. A
   *  second control beside it saying "rules" would be naming it twice. */
  onToggle?: () => void
  open?: boolean
  /** How many rules are behind the chip. "fulfill all" names one of them and
   *  says nothing about the other five, so where there are several the chip
   *  counts them instead. Where there is genuinely only one, its own name is
   *  the more useful label and it keeps it. */
  count?: number
}) {
  if (!tags?.length) return null

  return (
    <>
      {tags.map((tag, i) => {
        const className = cn("font-normal", small && "text-label-sm")

        if (i === 0 && onToggle) {
          const label = count && count > 1 ? `${count} constraints` : tag
          return (
            <Badge key={tag} variant="outline" asChild className={className}>
              <button type="button" onClick={onToggle} aria-expanded={open} className="cursor-pointer hover:bg-gray-5">
                {label}
              </button>
            </Badge>
          )
        }

        return (
          <Badge key={tag} variant="outline" className={className}>
            {tag}
          </Badge>
        )
      })}
    </>
  )
}

/** A milestone, drawn as a course row is but with nothing to say about credits
 *  or grades — only that it is asked for, and whether it has been done. The
 *  flag beside the mark is what tells it apart from the courses around it. */
export function MilestoneRow({ milestone }: { milestone: AuditMilestone }) {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-between gap-4 rounded-md border border-gray-40 bg-card p-[7px]">
      <div className="flex min-w-0 items-center gap-2">
        <AuditMarkIcon mark={milestone.mark} milestone />
        <p className="min-w-0 max-w-[400px] truncate text-body-md">{milestone.name}</p>
      </div>
      {milestone.result && (
        <p className="shrink-0 text-overline font-medium whitespace-nowrap text-gray-80 uppercase">
          {milestone.result}
        </p>
      )}
    </div>
  )
}

export function CourseRow({ course, bare }: { course: AuditCourse; bare?: boolean }) {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-between gap-4 rounded-md border border-gray-40 bg-card p-[7px]">
      <div className="flex min-w-0 items-center gap-2">
        {/* An unmatched course has no mark, because no requirement is holding
            it to one. */}
        {!bare && <AuditMarkIcon mark={course.mark} />}
        <p className="min-w-[100px] shrink-0 text-body-md">{course.code}</p>
        <p className="min-w-0 max-w-[400px] truncate text-body-md">{course.name}</p>
      </div>
      {/* Credits, then where it was taken, then what it earned — right to left
          is the order they stop being certain in, so they are read that way. */}
      <div className="flex shrink-0 items-center gap-4 text-overline font-medium text-gray-80 uppercase">
        {/* Counting in two programs at once. It leads the result group because
            it qualifies everything after it: these credits are being spent
            twice. */}
        {course.doubleCounts && (
          <span title="Counting toward more than one program" className="flex">
            <Icon name="double-counting" size={24} className="text-gray-100" />
          </span>
        )}
        <p className="whitespace-nowrap">{course.credits} Credits</p>
        {course.result && <p className="whitespace-nowrap">{course.result}</p>}
        {course.grade && <p className="min-w-4 text-right">{course.grade}</p>}
      </div>
    </div>
  )
}

/** What a row offers once the prototype explains itself. Hidden until the row
 *  is pointed at — they hold their space, so nothing moves as the pointer
 *  travels down the tree — and always out on a touch screen, where there is no
 *  pointer to travel. */
function RowTools({
  group,
  onExplain,
}: {
  group: AuditGroup
  onExplain?: (group: AuditGroup) => void
}) {
  if (!onExplain) return null

  /* Pointed at, or reached by keyboard. It had been `focus-within`, which
     kept the tools out on any row holding a focused control — clicking the
     constraints chip left focus in the row, so General Education wore its
     explain button permanently. `focus-visible` is the keyboard's focus and
     not the mouse's, which is the distinction that was wanted. */
  const shown =
    "shrink-0 cursor-pointer rounded-md border border-gray-40 bg-card text-label-md " +
    "text-foreground transition-opacity hover:bg-gray-5 group-hover:opacity-100 " +
    "group-has-[:focus-visible]:opacity-100 max-md:opacity-100 md:opacity-0"

  return (
    <>
      <button type="button" onClick={() => onExplain(group)} className={cn(shown, "px-[7px] py-px")}>
        explain
      </button>
      <button
        type="button"
        aria-label={`Search within ${group.name}`}
        className={cn(shown, "flex size-5 items-center justify-center")}
      >
        <Icon name="s-search" size={12} />
      </button>
    </>
  )
}

/** What a row's average badge should do, if it has one. An average with no
 *  panel behind it is still worth showing — it is only not worth pressing. */
function gpaOn(group: AuditGroup, explain?: Explain) {
  const gpa = explain?.gpa?.(group)
  if (!gpa || !explain?.onGpa) return undefined
  const onGpa = explain.onGpa
  return { value: gpa.value, onOpen: () => onGpa(group) }
}

/** The average a row amounts to, worn at the end of it. Pressable wherever
 *  there is a panel to open, and the same badge either way: a number that can
 *  be explained and one that cannot should not be two different things on
 *  screen when only one of them happens to have somewhere to go. */
function GpaBadge({
  label,
  value,
  name,
  onOpen,
}: {
  label: string
  value: string
  /** Whose average it is, for the label a screen reader hears. */
  name: string
  onOpen?: () => void
}) {
  const text = `${label} ${value}`

  if (!onOpen) {
    return (
      <Badge variant="outline" className="text-label-sm font-normal">
        {text}
      </Badge>
    )
  }

  return (
    <Badge variant="outline" asChild className="text-label-sm font-normal">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`How the ${name} GPA of ${value} is calculated`}
        className="cursor-pointer hover:bg-gray-5"
      >
        {text}
      </button>
    </Badge>
  )
}

function GroupRow({
  group,
  open = true,
  onToggle,
  tools,
  rules,
  gpa,
}: {
  group: AuditGroup
  open?: boolean
  onToggle?: () => void
  tools?: React.ReactNode
  /** Whether the row's own rules can be opened from its first tag, and are. */
  rules?: { open: boolean; onToggle: () => void; count?: number }
  /** The average the row carries, and the way into the working behind it. The
   *  programme states its own on the group; a requirement is told. */
  gpa?: { value: string; onOpen: () => void }
}) {
  /* The degree heads the tree rather than hanging off it, so it is drawn on
     nothing: no ground, no border, and the counts in place of a mark. What it
     is for — which catalogue it is being read against, and what it has earned
     so far — sits under the name and beside the bar. */
  if (group.level === "degree") {
    return (
      <div className="flex min-w-0 flex-1 items-center justify-between gap-4 rounded-md py-2">
        <div className="flex min-w-0 items-center gap-2">
          {group.counts && (
            <>
              <CountMark count={group.counts.requirements} />
              {/* Only where there are milestones in the tree to point at. */}
              {group.counts.milestones !== undefined && (
                <CountMark count={group.counts.milestones} milestone />
              )}
            </>
          )}
          <div className="flex min-w-0 flex-col justify-center gap-[3px]">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <p className="text-caption-lg font-semibold">{group.name}</p>
              <Icon name="expand-more" size={10} className="shrink-0" />
              <Icon name="more-horiz" size={14} className="shrink-0" />
              <Tags
                tags={group.tags}
                small
                onToggle={rules?.onToggle}
                open={rules?.open}
                count={rules?.count}
              />
              {tools}
            </div>
            {group.subtitle && (
              <p className="truncate text-body-md text-gray-80">{group.subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {group.bar && <AuditBar bar={group.bar} />}
          {group.pgpa && (
            <GpaBadge
              label="PGPA"
              value={group.pgpa.value}
              name={group.name}
              onOpen={gpa?.onOpen}
            />
          )}
        </div>
      </div>
    )
  }

  /* The program under the credential: what is being studied, against which
     catalogue, and how it is going. It hangs off the credential rather than
     heading the tree, so it takes a trail and no ground. */
  if (group.level === "program") {
    return (
      <div className="flex min-w-0 flex-1 items-center justify-between gap-4 rounded-md pl-2">
        {/* The marks stand beside the whole block, so the line under the name
            starts where the name does rather than under them. */}
        <div className="flex min-w-0 items-center gap-2">
          {/* A programme is a requirement like any other, so its mark counts
              what is outstanding under it. The docs are explicit: a remaining
              requirement displays as a count, and a programme that shows only
              a box is a programme not saying how much. */}
          {group.mark && <AuditMarkIcon mark={group.mark} count={outstanding(group).courses} />}
          {group.mark === "remaining" && outstanding(group).milestones > 0 && (
            <AuditMarkIcon mark="remaining" milestone count={outstanding(group).milestones} />
          )}
          <div className="flex min-w-0 flex-col justify-center gap-[3px]">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <p className="text-body-md font-semibold">{group.name}</p>
              <Icon name="expand-more" size={10} className="shrink-0" />
              <Icon name="more-horiz" size={14} className="shrink-0" />
              <Tags tags={group.tags} small />
              {/* This row had been the one level that took the tools and drew
                  none of them, which left the programme — the row the rules
                  actually belong to — with no way to ask about itself. */}
              {tools}
            </div>
            {group.subtitle && (
              <p className="truncate text-body-md text-gray-80">{group.subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {group.pgpa && (
            <GpaBadge
              label="PGPA"
              value={group.pgpa.value}
              name={group.name}
              onOpen={gpa?.onOpen}
            />
          )}
        </div>
      </div>
    )
  }

  /* What is still needed, which the mark carries as a number — coursework in
     the box and milestones in a flagged one beside it, and the flag only where
     there are any. */
  const short = outstanding(group)

  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 rounded-md border border-gray-40 bg-gray-5 p-[7px]">
      {group.mark && <AuditMarkIcon mark={group.mark} count={short.courses} />}
      {group.mark === "remaining" && short.milestones > 0 && (
        <AuditMarkIcon mark="remaining" milestone count={short.milestones} />
      )}
      <p className="text-body-md font-semibold">{group.name}</p>
      {/* The chevron is the fold. A requirement with nothing under it has
          nothing to fold, so it keeps the mark and not the control. */}
      {group.children.length > 0 ? (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-label={`${open ? "Collapse" : "Expand"} ${group.name}`}
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
      <Tags tags={group.tags} onToggle={rules?.onToggle} open={rules?.open} count={rules?.count} />
      {tools}
      {/* The average sits at the far end of the row, where the credits badge
          does on a check — it is what the requirement amounts to rather than
          something it is asking for, so it reads after the name and not with
          the tags. */}
      {gpa && (
        <div className="ml-auto">
          <GpaBadge label="GPA" value={gpa.value} name={group.name} onOpen={gpa.onOpen} />
        </div>
      )}
    </div>
  )
}

/* ============================================================ the tree
   A row, then its children. Each level passes down whether its own line
   carries on below this row, which is the whole of what the trail draws: a
   line through the levels that still have siblings coming, an elbow into this
   one, and nothing where a branch has already ended. */

function EntryRows({
  entry,
  stem,
  last,
  folded,
  onToggle,
  explain,
  landmark,
}: {
  entry: AuditEntry
  /** One per level above this row: does that level's line continue past it? */
  stem: boolean[]
  last: boolean
  folded: Set<string>
  onToggle: (id: string) => void
  explain?: Explain
  landmark?: Landmark
}) {
  const trail = [...stem.map((line) => ({ line })), { line: true, elbow: true, last }]
  const open = entry.kind === "group" && !folded.has(entry.id)
  const rulesId = `${entry.id}-rules`
  const rulesOpen = !folded.has(rulesId)

  const marked = landmark?.id === entry.id
  const row = (
    <TreeElement
      trail={trail}
      {...(marked ? { "data-landmark": "" } : {})}
      className={cn(
        marked && "scroll-mt-6 rounded-md ring-primary-50 transition-shadow duration-500",
        marked && landmark?.ring && "ring-2"
      )}
    >
      {entry.kind === "milestone" ? (
        <MilestoneRow milestone={entry} />
      ) : entry.kind === "course" ? (
        <CourseRow course={entry} />
      ) : (
        <GroupRow
          group={entry}
          open={open}
          onToggle={() => onToggle(entry.id)}
          tools={<RowTools group={entry} onExplain={explain?.onExplain} />}
          rules={
            explain?.constraints
              ? {
                  open: rulesOpen,
                  onToggle: () => onToggle(rulesId),
                  count: explain.count?.(entry),
                }
              : undefined
          }
          gpa={gpaOn(entry, explain)}
        />
      )}
    </TreeElement>
  )

  /* The rules open as a row of their own, indented one level past the row they
     belong to — they are about it, not beside it. The line at that level runs
     on where courses follow below: the card sits inside the group's run rather
     than breaking it. */
  const carriesOn = entry.kind === "group" && open && entry.children.length > 0
  const rules =
    entry.kind === "group" && explain?.constraints && rulesOpen ? (
      <TreeElement trail={[...stem.map((line) => ({ line })), { line: !last }, { line: carriesOn }]}>
        {explain.constraints(entry)}
      </TreeElement>
    ) : null

  if (entry.kind === "course" || entry.kind === "milestone" || entry.children.length === 0 || !open) {
    return (
      <>
        {row}
        {rules}
      </>
    )
  }

  return (
    <>
      {row}
      {rules}
      {entry.children.map((child, i) => (
        <EntryRows
          key={child.id}
          entry={child}
          stem={[...stem, !last]}
          last={i === entry.children.length - 1}
          folded={folded}
          onToggle={onToggle}
          explain={explain}
          landmark={landmark}
        />
      ))}
    </>
  )
}

/** Every group the tree opens folded. Read once, since after that the fold is
 *  the reader's rather than the data's. */
function initialFold(audit: AuditGroup): Set<string> {
  const folded = new Set<string>()

  const walk = (entry: AuditEntry) => {
    if (entry.kind === "course" || entry.kind === "milestone") return
    if (entry.collapsed) folded.add(entry.id)
    /* A row's rules are shut until someone asks, which is the opposite default
       from the row itself. */
    folded.add(`${entry.id}-rules`)
    entry.children.forEach(walk)
  }
  walk(audit)
  folded.add(`${audit.id}-rules`)

  return folded
}

/** One card in the audit's stack.
 *
 *  A degree, a second programme, a minor, and the courses nothing claimed are
 *  four things the transcript is being read against, not four parts of one
 *  thing — so each stands on its own card rather than all of them running
 *  together down a single sheet. Adding a programme adds a card. */
export function AuditCard({
  className,
  children,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "flex flex-col gap-10 overflow-x-auto rounded-md border border-gray-40 bg-card p-6 shadow-xs",
        className
      )}
      {...props}
    >
      {children}
    </section>
  )
}

/** A row worth landing on. An answer forty rows down a tree is an answer you
 *  have to go looking for, so the thing that changed says where it is — and
 *  wears a ring for a moment when it arrives. */
export type Landmark = { id: string; ring?: boolean }

export function AuditTree({
  audit,
  explain,
  landmark,
}: {
  audit: AuditGroup
  explain?: Explain
  landmark?: Landmark
}) {
  const [folded, setFolded] = useState(() => initialFold(audit))

  const toggle = (id: string) =>
    setFolded((current) => {
      const next = new Set(current)
      if (!next.delete(id)) next.add(id)
      return next
    })

  return (
    <div className="flex flex-col gap-2">
      {/* The degree heads the tree rather than hanging off it, so it is the one
          row with no trail beside it. */}
      <TreeElement trail={[]}>
        <GroupRow
          group={audit}
          tools={<RowTools group={audit} onExplain={explain?.onExplain} />}
        />
      </TreeElement>
      {audit.children.map((child, i) => (
        <EntryRows
          key={child.id}
          entry={child}
          stem={[]}
          last={i === audit.children.length - 1}
          folded={folded}
          onToggle={toggle}
          explain={explain}
          landmark={landmark}
        />
      ))}
    </div>
  )
}

/* ============================================================ Unmatched
   What the plan holds that the audit has nowhere to put. It is the one section
   with a heading of its own, because it is the one section the degree did not
   ask for. */

export function UnmatchedSection({
  count,
  blurb,
  courses,
}: {
  count: number
  blurb: string
  courses: AuditCourse[]
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-4 pb-2">
        <div className="flex min-w-0 items-start gap-2">
          {/* A count, not a warning: these courses are fine, they are simply
              spoken for by nothing. */}
          <span className="mt-2.5 flex size-6 shrink-0 items-center justify-center rounded-md border border-gray-100 text-body-md font-semibold text-gray-100">
            {count}
          </span>
          <div className="flex min-w-0 flex-col">
            <div className="flex flex-wrap items-center gap-2 text-body-md">
              <p className="font-semibold">Unmatched courses</p>
              <a href="#" className="text-gray-80 underline [text-underline-position:from-font]">
                Learn more
              </a>
            </div>
            <p className="text-body-md text-gray-80">{blurb}</p>
          </div>
        </div>
        <Button size="icon" aria-label="Filter unmatched courses">
          <Icon name="filter-list" size={16} />
        </Button>
      </div>
      {courses.map((course, i) => (
        <div key={course.id} className="flex items-stretch gap-1">
          <Trail cells={[{ line: true, elbow: true, last: i === courses.length - 1 }]} />
          <CourseRow course={course} bare />
        </div>
      ))}
    </div>
  )
}
