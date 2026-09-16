import { cn } from "cn"
import type { ReactNode } from "react"

import { Icon, type IconName } from "@/components/icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { AuditCourse, AuditEntry, AuditGroup, AuditMark } from "@/data/audit"

/* The degree audit, drawn as a tree. Every row is the same three parts: the
 * trail that says where it sits, the mark that says how it stands, and the row
 * itself. What differs between a requirement and a course is the ground under
 * it, not the shape. */

/* ============================================================ AuditMarkIcon
   The 24px square at the head of a row. Each state is a ground and a glyph,
   which is the whole of it — a course, a requirement and a whole program all
   read their state off the same six squares. */

const MARK: Record<AuditMark, { ground: string; icon?: IconName; glyph?: number }> = {
  taken: { ground: "bg-success-50 text-white", icon: "check", glyph: 14 },
  "in-progress": { ground: "bg-success-50 text-white", icon: "watch-later", glyph: 16 },
  registered: { ground: "bg-warning-50 text-white", icon: "event-available", glyph: 16 },
  planned: { ground: "border border-warning-50 bg-warning-5 text-warning-50", icon: "check", glyph: 14 },
  /* Nothing placed against it yet, and something has to be: an empty box in
     the colour of the count it is adding to. */
  remaining: { ground: "border border-alert-50" },
  /* Nothing placed against it and nothing needs to be. A rule, not a box to
     fill, so it is struck through rather than left open. */
  optional: { ground: "border border-gray-80" },
}

export function AuditMarkIcon({ mark, milestone }: { mark: AuditMark; milestone?: boolean }) {
  const { ground, icon, glyph } = MARK[mark]

  return (
    <span
      className={cn(
        "flex h-6 min-w-6 shrink-0 items-center justify-center gap-0.5 rounded-md p-0.5",
        ground
      )}
    >
      {milestone && <Icon name="outlined-flag" size={16} />}
      {icon && glyph && <Icon name={icon} size={glyph} />}
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
   The four shares of a line's credits: taken, under way, planned, and what is
   left. Fixed at the design's width — it is a glance, not a measure, and the
   rows it sits on are different widths. */

function AuditBar({
  bar,
}: {
  bar: { taken: number; inProgress: number; claimed: number; total: number }
}) {
  const share = (n: number) => `${(n / bar.total) * 100}%`

  return (
    <span className="flex h-2 w-[101.5px] shrink-0 overflow-hidden rounded-full">
      <span className="bg-success-50" style={{ width: share(bar.taken) }} />
      <span className="bg-warning-75" style={{ width: share(bar.inProgress) }} />
      <span className="bg-warning-25" style={{ width: share(bar.claimed) }} />
      <span className="flex-1 bg-gray-40" />
    </span>
  )
}

/* ============================================================ Trail
   Where a row sits in the tree, one 40px cell per level above it. The line
   runs down the middle of its cell and overruns the row by the gap between
   rows, so it reads as one line behind the tree rather than a dash per row.
   The last cell turns right into the row, stopping 4px short — which is the
   gap the row itself leaves. */

function Trail({ cells }: { cells: { line: boolean; elbow?: boolean; last?: boolean }[] }) {
  if (cells.length === 0) return null

  return (
    <span className="flex shrink-0 gap-0.5 self-stretch" aria-hidden="true">
      {cells.map((cell, i) => (
        <span key={i} className="relative w-10 shrink-0">
          {/* The elbow is a bordered box, not two lines meeting: that is what
              gives the frame's rounded corner, and it keeps the two strokes on
              the same pixel grid. It reaches 4px short of the cell's right
              edge, which is the gap the row leaves in front of itself. */}
          {cell.elbow && (
            <span className="absolute -top-2 bottom-1/2 right-1 left-5 rounded-bl-lg border-b border-l border-divider" />
          )}
          {/* The line above, and — unless the branch ends here — below. It
              overruns the row by the gap between rows, so the tree reads as
              one line running behind it rather than a dash beside each row. */}
          {cell.line && !cell.elbow && (
            <span className="absolute -top-2 -bottom-2 left-5 w-px bg-divider" />
          )}
          {cell.elbow && !cell.last && (
            <span className="absolute top-1/2 -bottom-2 left-5 w-px bg-divider" />
          )}
        </span>
      ))}
    </span>
  )
}

/* ============================================================ rows */

function TreeElement({
  trail,
  indent,
  children,
}: {
  trail: { line: boolean; elbow?: boolean; last?: boolean }[]
  /** 20px on the degree, which has no trail to stand off; 12px under it. */
  indent: 12 | 20
  children: ReactNode
}) {
  return (
    <div className="flex items-stretch gap-1 bg-card" style={{ paddingLeft: indent }}>
      <Trail cells={trail} />
      {children}
    </div>
  )
}

/** The tags after a requirement's name. The degree and its programs carry the
 *  smaller Badge/Tag; everything under them carries the shadcn badge. */
function Tags({ tags, small }: { tags?: string[]; small?: boolean }) {
  if (!tags?.length) return null

  return (
    <>
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="outline"
          className={cn("font-normal", small && "text-label-sm")}
        >
          {tag}
        </Badge>
      ))}
    </>
  )
}

function CourseRow({ course, bare }: { course: AuditCourse; bare?: boolean }) {
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
        <p className="whitespace-nowrap">{course.credits} Credits</p>
        {course.result && <p className="whitespace-nowrap">{course.result}</p>}
        {course.grade && <p className="min-w-4 text-right">{course.grade}</p>}
      </div>
    </div>
  )
}

function GroupRow({ group }: { group: AuditGroup }) {
  if (group.level === "degree") {
    return (
      <div className="flex min-w-0 flex-1 items-center justify-between gap-4 rounded-md py-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {group.counts && (
            <>
              <CountMark count={group.counts.requirements} />
              <CountMark count={group.counts.milestones} milestone />
            </>
          )}
          <p className="text-caption-lg font-semibold">{group.name}</p>
          <Icon name="expand-more" size={10} className="shrink-0" />
          <Icon name="more-horiz" size={14} className="shrink-0" />
          <Tags tags={group.tags} small />
        </div>
        {group.bar && <AuditBar bar={group.bar} />}
      </div>
    )
  }

  if (group.level === "program") {
    return (
      <div className="flex min-w-0 flex-1 items-center justify-between gap-4 rounded-md pl-2">
        {/* The marks stand beside the whole block, so the line under the name
            starts where the name does rather than under them. */}
        <div className="flex min-w-0 items-center gap-2">
          {group.mark && <AuditMarkIcon mark={group.mark} />}
          {group.milestoneMark && <AuditMarkIcon mark={group.milestoneMark} milestone />}
          <div className="flex min-w-0 flex-col justify-center gap-[3px]">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <p className="text-body-md font-semibold">{group.name}</p>
              <Icon name="expand-more" size={10} className="shrink-0" />
              <Icon name="more-horiz" size={14} className="shrink-0" />
              <Tags tags={group.tags} small />
            </div>
            {group.subtitle && (
              <p className="truncate text-body-md text-gray-80">{group.subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {group.bar && <AuditBar bar={group.bar} />}
          {group.pgpa && (
            <Badge variant="outline" className="text-label-sm font-normal text-gray-80">
              {group.pgpa}
            </Badge>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 rounded-md border border-gray-40 bg-gray-5 p-[7px]">
      {group.mark && <AuditMarkIcon mark={group.mark} />}
      <p className="text-body-md font-semibold">{group.name}</p>
      <Icon name="chevron-right" size={14} className="shrink-0" />
      <Tags tags={group.tags} />
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
}: {
  entry: AuditEntry
  /** One per level above this row: does that level's line continue past it? */
  stem: boolean[]
  last: boolean
}) {
  const trail = [...stem.map((line) => ({ line })), { line: true, elbow: true, last }]

  const row = (
    <TreeElement trail={trail} indent={12}>
      {entry.kind === "course" ? <CourseRow course={entry} /> : <GroupRow group={entry} />}
    </TreeElement>
  )

  if (entry.kind === "course" || entry.children.length === 0) return row

  return (
    <>
      {row}
      {entry.children.map((child, i) => (
        <EntryRows
          key={child.id}
          entry={child}
          stem={[...stem, !last]}
          last={i === entry.children.length - 1}
        />
      ))}
    </>
  )
}

export function AuditTree({ audit }: { audit: AuditGroup }) {
  return (
    <div className="flex flex-col gap-2">
      {/* The degree heads the tree rather than hanging off it, so it is the one
          row with no trail beside it. */}
      <TreeElement trail={[]} indent={20}>
        <GroupRow group={audit} />
      </TreeElement>
      {audit.children.map((child, i) => (
        <EntryRows
          key={child.id}
          entry={child}
          stem={[]}
          last={i === audit.children.length - 1}
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
    <div className="flex flex-col gap-2 pl-4">
      <div className="flex items-start justify-between gap-4 py-2 pl-5">
        <div className="flex min-w-0 items-start gap-2">
          <span className="mt-2.5 flex size-6 shrink-0 items-center justify-center rounded-md border border-alert-50 text-body-md font-semibold text-alert-50">
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
        <div key={course.id} className="flex items-stretch gap-1 pl-3">
          <Trail cells={[{ line: true, elbow: true, last: i === courses.length - 1 }]} />
          <CourseRow course={course} bare />
        </div>
      ))}
    </div>
  )
}
