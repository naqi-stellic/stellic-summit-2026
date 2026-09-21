import { cn } from "cn"
import { useState } from "react"

import { Icon } from "@/components/icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentAvatar } from "@/components/stellic/student-avatar"
import { EngageBolts } from "@/components/stellic/student-profile"
import { AUDIT_STUDENT } from "@/data/audit"
import {
  AppliedFilters,
  DemographicsFilter,
  RemainingFilter,
} from "@/components/stellic/student-filters"
import {
  APPLIED,
  FILTERS,
  ROSTER,
  ROSTER_TOTAL,
  ROSTER_VIEWS,
  QUERY,
  SAVED_REPORTS,
  matches,
  type Applied,
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

function Filters({
  applied,
  onApply,
  onClear,
}: {
  applied: Applied
  onApply: (which: keyof Applied) => void
  onClear: () => void
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <p className="text-caption-md font-medium text-gray-100">Filters</p>
      <div className="flex flex-wrap gap-2">
        {/* First, and set apart by the rule after it: the way in when you
            cannot name the filter you want, rather than one of the twenty
            that name themselves. */}
        <Button size="sm">
          <Icon name="filter-list" size={14} />
          Advanced
        </Button>
        <span className="mx-1 h-8 w-px shrink-0 self-center bg-gray-40" />
        {FILTERS.map((filter) =>
          /* Eighteen are named and inert. These two ask the question the
             compliance screen leaves you with. */
          filter === "Demographics" ? (
            <DemographicsFilter
              key={filter}
              on={!!applied.entryYear}
              onApply={() => onApply("entryYear")}
              onClear={onClear}
            />
          ) : filter === "Remaining" ? (
            <RemainingFilter
              key={filter}
              on={!!applied.requirement}
              onApply={() => onApply("requirement")}
              onClear={onClear}
            />
          ) : (
            <Button key={filter} size="sm">
              {filter}
            </Button>
          )
        )}
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
    <div className="flex items-center gap-3 border-t border-gray-40 py-3.5 pr-4 pl-6">
      <button
        type="button"
        onClick={() => setChips([])}
        className="shrink-0 cursor-pointer text-body-md text-gray-100 underline [text-underline-position:from-font]"
      >
        Clear All
      </button>
      {/* The chips run off the end rather than wrapping: the row is one line
          whatever is applied to it, and the arrow is how you reach the rest. */}
      <div className="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto">
        {chips.map((chip) => (
          <span
            key={chip.username}
            className="flex shrink-0 items-center gap-2 rounded-full bg-gray-0 px-3.5 py-1.5 text-body-md text-gray-100"
          >
            <Icon name="history" size={14} className="shrink-0 text-gray-80" />
            {chip.name}
            <span className="text-gray-60">•</span>
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
      </div>
      <button
        type="button"
        aria-label="More applied filters"
        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-input bg-card text-gray-80 hover:bg-gray-5"
      >
        <Icon name="chevron-right" size={14} />
      </button>
    </div>
  )
}

export function SearchPanel({
  applied,
  onApply,
  onClear,
  onSave,
}: {
  applied: Applied
  onApply: (which: keyof Applied) => void
  onClear: () => void
  onSave: () => void
}) {
  const [keywords, setKeywords] = useState("")
  const filtering = !!applied.requirement || !!applied.entryYear

  return (
    <div className={CARD}>
      <div className="flex flex-wrap gap-8 p-6">
        <div className="flex w-[300px] shrink-0 flex-col gap-3 max-md:w-full">
          <label htmlFor="keywords" className="text-caption-md font-medium text-gray-100">
            Keywords
          </label>
          <div className="relative flex items-center">
            <Icon
              name="s-search"
              size={14}
              className="pointer-events-none absolute left-3 text-gray-60"
            />
            <Input
              id="keywords"
              value={keywords}
              onChange={(event) => setKeywords(event.target.value)}
              placeholder="Student name, username..."
              className="pl-9 text-body-md"
            />
          </div>
          <button
            type="button"
            className="cursor-pointer self-start text-body-md text-gray-100 underline [text-underline-position:from-font]"
          >
            search by usernames
          </button>
        </div>
        <Filters applied={applied} onApply={onApply} onClear={onClear} />
      </div>
      {/* Applied filters take the row the recent students had: what is
          narrowing the list is one question at a time, not two. */}
      {filtering ? (
        <AppliedFilters applied={applied} onReset={onClear} onSave={onSave} />
      ) : (
        <Applied />
      )}
    </div>
  )
}

/* ---------------------------------------------------------------- saved */

function ReportCard({ report }: { report: SavedReport }) {
  return (
    <div className={cn(CARD, "flex min-h-[148px] flex-col gap-2 p-4")}>
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

export function SavedReports({ saved }: { saved?: boolean }) {
  const [open, setOpen] = useState(true)

  /* A saved query joins the cards it was saved into. That is the loop the
     screen is built on: the reports are somebody's questions, kept. */
  const reports = saved
    ? [
        ...SAVED_REPORTS,
        {
          name: `Remaining ${QUERY.requirement}`,
          count: "6 students",
          tracked: true,
        },
      ]
    : SAVED_REPORTS

  return (
    <div className="flex flex-col gap-4">
      <Button
        className="w-fit"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {reports.length - 1} Saved Reports
        <Icon name="expand-more" size={12} className={cn(!open && "-rotate-90")} />
      </Button>

      {/* Four across, filling the width the two panels around them fill. The
          way to make a fifth starts the next row rather than joining theirs:
          it is not a report. */}
      {open && (
        <div className="grid grid-cols-1 gap-4 @2xl:grid-cols-2 @5xl:grid-cols-4">
          {reports.map((report) => (
            <ReportCard key={report.name} report={report} />
          ))}
          <button
            type="button"
            className="flex min-h-[148px] cursor-pointer items-center justify-center rounded-md border border-dashed border-gray-40 text-body-md text-gray-80 hover:bg-gray-0"
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
  { key: "done", colour: "bg-success-50", dot: "bg-success-50" },
  { key: "inProgress", colour: "bg-warning-25", dot: "bg-warning-25" },
  /* The bar's last share is the ground it sits on, so the dot naming it has to
     be darker than the bar or there is nothing to see. */
  { key: "remaining", colour: "bg-gray-40", dot: "bg-gray-60" },
] as const

/** Three shares of one line, and the legend under it. A share of nothing is
 *  left off rather than written as a zero — it is not news. */
function Bar({ meter }: { meter: Meter }) {
  const total = meter.done + meter.inProgress + meter.remaining || 1

  return (
    <div className="flex flex-col gap-2">
      <span className="flex h-1.5 w-full overflow-hidden rounded-full bg-gray-40">
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
            <span className={cn("size-1.5 shrink-0 rounded-full", share.dot)} />
            <span className="text-label-md text-gray-80">{meter[share.key]}</span>
          </span>
        ))}
      </span>
    </div>
  )
}

function Portrait({ student }: { student: Student }) {
  const [failed, setFailed] = useState(false)

  /* A drawn face rather than two letters if the photograph does not arrive:
     eight initials read as eight labels, which is the opposite of what the row
     is trying to say. */
  if (failed) {
    return <StudentAvatar seed={student.username} size={44} className="shrink-0 rounded-full" />
  }

  return (
    <img
      src={student.photo}
      alt=""
      onError={() => setFailed(true)}
      className="size-11 shrink-0 rounded-full object-cover"
    />
  )
}

function Row({ student, onOpen }: { student: Student; onOpen?: () => void }) {
  return (
    <div className="flex items-start gap-6 border-b border-gray-40 p-6 transition-colors last:border-b-0 hover:bg-gray-0">
      <Checkbox aria-label={`Select ${student.name}`} className="mt-1 shrink-0" />
      <Portrait student={student} />

      <div className="flex w-[212px] shrink-0 flex-col gap-1 max-lg:w-[160px]">
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
        <EngageBolts lit={student.engage} of={AUDIT_STUDENT.engage.bolts} />
      </div>

      {/* Every column holds its width down the whole list. A row is read
          against the rows above it, and a column that moves cannot be. */}
      <div className="flex w-[280px] shrink-0 flex-col gap-2 max-lg:w-[200px]">
        {student.programs.map((program) => (
          <p key={program.name} className="flex flex-wrap items-center gap-2 text-body-md text-gray-80">
            {program.name}
            {program.declared === false && <Badge variant="secondary">Not Declared</Badge>}
          </p>
        ))}
      </div>

      <div className="w-[120px] shrink-0">
        <Badge variant="outline" className="font-normal">
          CGPA {student.cgpa}
        </Badge>
      </div>

      <div className="flex min-w-[240px] flex-1 flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-body-md font-semibold text-foreground">Courses</p>
          <Bar meter={student.courses} />
          {/* Nothing under the meter. A list of eight rows each flagging
              something of its own is a list nobody reads, and restating the
              query on every row that matched it is the same noise wearing a
              calmer voice — the pills above already say what was asked.
              `alert` and `yearTwo` stay on the record, unrendered. */}
        </div>
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-1.5 text-body-md font-semibold text-foreground">
            <Icon name="outlined-flag" size={14} />
            Milestones/Other
          </p>
          <Bar meter={student.milestones} />
        </div>
      </div>
    </div>
  )
}

export function Roster({
  applied,
  running,
  onOpen,
}: {
  applied: Applied
  /** The query is being applied. The list it is about to replace is the old
   *  answer, and showing an old answer while a new one is on its way is worse
   *  than showing none. */
  running?: boolean
  onOpen?: (student: Student) => void
}) {
  const [view, setView] = useState(ROSTER_VIEWS[0])
  const [grid, setGrid] = useState(false)

  const found = ROSTER.filter((student) => matches(student, applied))
  const filtering = !!applied.requirement || !!applied.entryYear
  /* Unfiltered, the list is a sample of an institution and says so. Filtered,
     it is the whole answer, and the number is the point. */
  const total = filtering ? found.length : ROSTER_TOTAL

  return (
    <div className={CARD}>
      <div className="flex flex-wrap items-center gap-4 border-b border-gray-40 p-6">
        <Checkbox aria-label="Select every student" className="shrink-0" />
        <p className="text-h300 font-semibold text-gray-100">
          {/* Nothing has been found yet, so nothing is the count. */}
          {running ? "0" : `0 / ${total}`} students
        </p>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          {/* Nothing is selected, so there is nothing to act on yet. */}
          <Button disabled>Actions</Button>
          <span className="h-6 w-px shrink-0 bg-gray-40" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-[220px] justify-between">
                {view}
                <Icon name="expand-more" size={12} className="text-gray-80" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[220px]">
              {ROSTER_VIEWS.map((option) => (
                <DropdownMenuItem key={option} onSelect={() => setView(option)}>
                  <span className={cn("flex-1", option === view && "font-semibold")}>{option}</span>
                  {option === view && (
                    <Icon name="check" size={14} className="text-primary-50" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="icon" aria-label="Sort">
            <Icon name="swap-vert" size={16} />
          </Button>

          {/* One control, two states: the segmented group the rest of the
              product uses, rather than a pair of buttons in a box. */}
          <Tabs value={grid ? "grid" : "list"} onValueChange={(next) => setGrid(next === "grid")}>
            <TabsList>
              <TabsTrigger value="list" aria-label="List" className="px-2.5">
                <Icon name="list" size={16} />
              </TabsTrigger>
              <TabsTrigger value="grid" aria-label="Grid" className="px-2.5">
                <Icon name="grid-view" size={16} />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {running ? (
        <div className="flex items-center justify-center py-24">
          <Spinner />
        </div>
      ) : (
      <div className="overflow-x-auto">
        {found.map((student) => (
          <Row
            key={student.username}
            student={student}
            onOpen={() => onOpen?.(student)}
          />
        ))}
      </div>
      )}
    </div>
  )
}
