import { cn } from "cn"
import { useState } from "react"

import { Icon } from "@/components/icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  APPLIED,
  FILTERS,
  ROSTER,
  ROSTER_TOTAL,
  ROSTER_VIEWS,
  SAVED_REPORTS,
  initials,
  type Meter,
  type SavedReport,
  type Student,
} from "@/data/students"

/* The student search, built from the product's own screen.
 *
 * Three bands, and the order is the argument. What you can ask comes first —
 * keywords beside twenty named filters, because the point of the screen is how
 * many ways in there are. What somebody already asked comes second, as saved
 * reports. The cohort comes last, and each row answers the question the view
 * above it is set to: not "who is this" but "how is this one going". */

const CARD = "rounded-md border border-gray-40 bg-card shadow-xs"

/* ---------------------------------------------------------------- asking */

function Filters() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <p className="flex items-center gap-1.5 text-body-md text-gray-100">
        <Icon name="filter-list" size={14} className="text-gray-80" />
        Filters
      </p>
      <div className="flex flex-wrap gap-2">
        {/* The assistant is a filter like the rest, and first because it is the
            one you reach for when you cannot name the filter you want. */}
        <Button size="sm">
          <Icon name="auto-awesome" size={14} />
          Filter Assistant
        </Button>
        {FILTERS.map((filter) => (
          <Button key={filter} size="sm">
            {filter}
          </Button>
        ))}
      </div>
    </div>
  )
}

/** What is narrowing the list, under the controls that narrowed it. The clock
 *  is what each chip came from: a name typed into the box. */
function Applied() {
  const [chips, setChips] = useState(APPLIED)

  if (!chips.length) return null

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-gray-40 px-6 py-3.5">
      <button
        type="button"
        onClick={() => setChips([])}
        className="shrink-0 cursor-pointer text-body-md text-gray-100 underline [text-underline-position:from-font]"
      >
        Clear All
      </button>
      {chips.map((chip) => (
        <span
          key={chip.username}
          className="flex items-center gap-2 rounded-md bg-gray-5 px-3 py-1.5 text-body-md text-gray-100"
        >
          <Icon name="watch-later" size={14} className="shrink-0 text-gray-80" />
          {chip.name}
          <span className="text-gray-60">·</span>
          <span className="text-gray-80">{chip.username}</span>
          <button
            type="button"
            aria-label={`Remove ${chip.name}`}
            onClick={() => setChips((all) => all.filter((other) => other !== chip))}
            className="cursor-pointer text-gray-80 hover:text-gray-100"
          >
            <Icon name="close" size={12} />
          </button>
        </span>
      ))}
      <button
        type="button"
        aria-label="More applied filters"
        className="ml-auto flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-input bg-card text-gray-80 hover:bg-gray-5"
      >
        <Icon name="chevron-right" size={14} />
      </button>
    </div>
  )
}

export function SearchPanel() {
  const [keywords, setKeywords] = useState("")

  return (
    <div className={CARD}>
      <div className="flex flex-wrap gap-8 p-6">
        <div className="flex w-[300px] shrink-0 flex-col gap-3 max-md:w-full">
          <label htmlFor="keywords" className="text-body-md text-gray-100">
            Keywords
          </label>
          <div className="relative flex h-9 items-center rounded-md border border-input bg-card">
            <Icon name="s-search" size={14} className="absolute left-3 text-gray-60" />
            <input
              id="keywords"
              value={keywords}
              onChange={(event) => setKeywords(event.target.value)}
              placeholder="Student name, username..."
              className="h-full w-full min-w-0 bg-transparent pr-3 pl-9 text-body-md text-foreground placeholder:text-gray-60 focus:outline-none"
            />
          </div>
          <button
            type="button"
            className="cursor-pointer self-start text-body-md text-gray-100 underline [text-underline-position:from-font]"
          >
            search by usernames
          </button>
        </div>
        <Filters />
      </div>
      <Applied />
    </div>
  )
}

/* ---------------------------------------------------------------- saved */

function ReportCard({ report }: { report: SavedReport }) {
  return (
    <div className={cn(CARD, "flex min-h-[148px] w-[248px] shrink-0 flex-col gap-2 p-4")}>
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-body-md font-semibold text-foreground">{report.name}</p>
        {/* The default report is the product's, not somebody's, so there is
            nothing to do to it. */}
        {report.count && (
          <button type="button" aria-label={`More for ${report.name}`} className="shrink-0 cursor-pointer text-gray-60">
            <Icon name="more-horiz" size={16} />
          </button>
        )}
      </div>
      {report.count && <p className="text-body-md text-gray-80">{report.count}</p>}
      {report.tracked && (
        <p className="mt-auto flex items-center gap-2 text-body-md text-gray-80">
          <Icon name="s-notification" size={14} />
          Tracked
        </p>
      )}
    </div>
  )
}

export function SavedReports() {
  const [open, setOpen] = useState(true)

  return (
    <div className="flex flex-col gap-4">
      <Button
        className="w-fit"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {SAVED_REPORTS.length - 1} Saved Reports
        <Icon name="expand-more" size={12} className={cn(!open && "-rotate-90")} />
      </Button>

      {open && (
        <div className="flex flex-wrap gap-4">
          {SAVED_REPORTS.map((report) => (
            <ReportCard key={report.name} report={report} />
          ))}
          <button
            type="button"
            className="flex min-h-[148px] w-[248px] shrink-0 cursor-pointer items-center justify-center rounded-md border border-dashed border-gray-40 text-body-md text-gray-80 hover:bg-gray-0"
          >
            + Add New Manual Report
          </button>
        </div>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------- roster */

const SHARES = [
  { key: "done", colour: "bg-success-50" },
  { key: "inProgress", colour: "bg-warning-25" },
  { key: "remaining", colour: "bg-gray-40" },
] as const

/** Three shares of one line, and the legend under it. A share of nothing is
 *  left off rather than written as a zero — it is not news. */
function Bar({ meter }: { meter: Meter }) {
  const total = meter.done + meter.inProgress + meter.remaining || 1

  return (
    <div className="flex flex-col gap-2">
      <span className="flex h-1.5 w-[168px] overflow-hidden rounded-full bg-gray-40">
        {SHARES.map((share) => (
          <span
            key={share.key}
            className={share.colour}
            style={{ width: `${(meter[share.key] / total) * 100}%` }}
          />
        ))}
      </span>
      <span className="flex flex-wrap items-center gap-x-3">
        {SHARES.filter((share) => meter[share.key] > 0).map((share) => (
          <span key={share.key} className="flex items-center gap-1.5">
            <span className={cn("size-1.5 shrink-0 rounded-full", share.colour)} />
            <span className="text-label-md text-gray-80">{meter[share.key]}</span>
          </span>
        ))}
      </span>
    </div>
  )
}

/** Five bolts, and the ones this student has earned. Stellic Engage says how
 *  much of the product they are actually using, which is not a grade. */
function Engage({ lit }: { lit: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Icon
          key={i}
          name="bolt"
          size={14}
          className={i < lit ? "text-accent-amber" : "text-gray-40"}
        />
      ))}
    </span>
  )
}

function Portrait({ student }: { student: Student }) {
  if (student.photo) {
    return (
      <img
        src={student.photo}
        alt=""
        className="size-11 shrink-0 rounded-full object-cover"
      />
    )
  }

  return (
    <span
      style={{ background: student.colour }}
      className="flex size-11 shrink-0 items-center justify-center rounded-full text-body-md font-semibold text-white"
    >
      {initials(student.name)}
    </span>
  )
}

function Row({ student, onOpen }: { student: Student; onOpen?: () => void }) {
  return (
    <div className="flex items-start gap-4 border-b border-gray-40 p-6 transition-colors last:border-b-0 hover:bg-gray-0">
      <Checkbox aria-label={`Select ${student.name}`} className="mt-1 shrink-0" />
      <Portrait student={student} />

      <div className="flex w-[220px] shrink-0 flex-col gap-1 max-lg:w-[170px]">
        <button
          type="button"
          onClick={onOpen}
          className="cursor-pointer text-left text-h300 font-semibold text-gray-100 hover:underline [text-underline-position:from-font]"
        >
          {student.name}
        </button>
        <p className="text-body-md text-gray-80">
          {student.username} <span className="px-0.5">/</span> {student.standing}
        </p>
        <Engage lit={student.engage} />
      </div>

      {/* What they are on. A programme nobody has declared yet says so, because
          it is the difference between a plan and a record. */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {student.programs.map((program) => (
          <p key={program.name} className="flex flex-wrap items-center gap-2 text-body-md text-gray-80">
            {program.name}
            {program.declared === false && <Badge variant="secondary">Not Declared</Badge>}
          </p>
        ))}
      </div>

      <Badge variant="outline" className="mt-0.5 shrink-0 font-normal">
        CGPA {student.cgpa}
      </Badge>

      <div className="flex w-[200px] shrink-0 flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-body-md font-semibold text-foreground">Courses</p>
          <Bar meter={student.courses} />
          {student.alert && (
            <p className="flex items-start gap-1.5 text-body-md text-warning-50">
              <Icon name="error-outline" size={14} className="mt-0.5 shrink-0" />
              {student.alert}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-1.5 text-body-md font-semibold text-foreground">
            <Icon name="outlined-flag" size={14} className="text-gray-80" />
            Milestones/Other
          </p>
          <Bar meter={student.milestones} />
        </div>
      </div>
    </div>
  )
}

export function Roster({ onOpen }: { onOpen?: (student: Student) => void }) {
  const [view, setView] = useState(ROSTER_VIEWS[0])
  const [grid, setGrid] = useState(false)

  const toggle = "flex size-8 items-center justify-center rounded-md transition-colors"

  return (
    <div className={CARD}>
      <div className="flex flex-wrap items-center gap-4 border-b border-gray-40 p-6">
        <Checkbox aria-label="Select every student" className="shrink-0" />
        <p className="text-h300 font-semibold text-gray-100">
          0 / {ROSTER_TOTAL} students
        </p>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          {/* Nothing is selected, so there is nothing to act on yet. */}
          <Button disabled>Actions</Button>
          <span className="h-6 w-px shrink-0 bg-gray-40" />
          <select
            value={view}
            onChange={(event) => setView(event.target.value)}
            aria-label="How to read the list"
            className="h-9 cursor-pointer rounded-md border border-input bg-card px-3 text-body-md text-foreground"
          >
            {ROSTER_VIEWS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <Button size="icon" aria-label="Sort">
            <Icon name="swap-vert" size={16} />
          </Button>
          {/* One control, two states, so they sit in one box. */}
          <span className="flex items-center gap-1 rounded-md border border-input bg-card p-1">
            <button
              type="button"
              onClick={() => setGrid(false)}
              aria-pressed={!grid}
              aria-label="List"
              className={cn(toggle, !grid ? "bg-gray-100 text-white" : "cursor-pointer text-gray-80")}
            >
              <Icon name="list" size={16} />
            </button>
            <button
              type="button"
              onClick={() => setGrid(true)}
              aria-pressed={grid}
              aria-label="Grid"
              className={cn(toggle, grid ? "bg-gray-100 text-white" : "cursor-pointer text-gray-80")}
            >
              <Icon name="grid-view" size={16} />
            </button>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        {ROSTER.map((student) => (
          <Row key={student.username} student={student} onOpen={() => onOpen?.(student)} />
        ))}
      </div>
    </div>
  )
}
