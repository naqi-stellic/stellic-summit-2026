import { useState } from "react"

import { Icon } from "@/components/icon"
import { FilterBar, FilterChips, activeFields, matches } from "@/components/stellic/filter-bar"
import { ProgramDetail } from "@/components/stellic/program-detail"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  CATALOG,
  PROGRAM_FILTERS,
  matchesKeywords,
  published,
  unpublished,
  valueOf,
  type CatalogProgram,
} from "@/data/program-instruction"
import { programNoun } from "@/data/programs"

/* The programs list, built from the product's own screen.
 *
 * Two bands, and the order is the same argument the student search makes: what
 * you can ask comes first, what it left comes second. What differs is the
 * subject. A student list is people, and every row has to say how one of them
 * is going; this is a catalogue, and every card has to say what state one entry
 * is in — how many versions of its audit are live, and whether somebody is
 * partway through the next one. */

const CARD = "rounded-md border border-gray-40 bg-card shadow-xs"

/* ---------------------------------------------------------------- asking */

export function ProgramSearch({
  keywords,
  onKeywords,
  filters,
  onFilters,
}: {
  keywords: string
  onKeywords: (next: string) => void
  filters: Record<string, string[]>
  onFilters: (next: Record<string, string[]>) => void
}) {
  const active = activeFields(PROGRAM_FILTERS, filters)

  return (
    <div className={CARD}>
      <div className="flex flex-wrap gap-8 p-6">
        <div className="flex w-[380px] shrink-0 flex-col gap-3 max-md:w-full">
          <label htmlFor="program-keywords" className="text-caption-md font-medium text-gray-100">
            Keywords
          </label>
          <div className="relative flex items-center">
            <Icon
              name="s-search"
              size={14}
              className="pointer-events-none absolute left-3 text-gray-60"
            />
            <Input
              id="program-keywords"
              value={keywords}
              onChange={(event) => onKeywords(event.target.value)}
              /* What it actually searches. The product offers "created by"
                 here; this catalogue has no record of who wrote an entry, and
                 a box that offers a search it cannot run is worse than one
                 that offers less. */
              placeholder="Program name, department, school..."
              className="pl-9 text-body-md"
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <p className="flex items-center gap-1.5 text-caption-md font-medium text-gray-100">
            <Icon name="filter-alt" size={14} />
            Filters
          </p>
          {/* The chips go in the band below rather than under the buttons —
              the rule between them is what makes "what you can ask" and "what
              you asked" two things instead of one long row. */}
          <FilterBar
            groups={PROGRAM_FILTERS}
            filters={filters}
            onChange={onFilters}
            chips={false}
          />
        </div>
      </div>

      <div className="flex min-h-[52px] items-center border-t border-gray-40 px-6 py-3.5">
        {active.length > 0 ? (
          <FilterChips groups={PROGRAM_FILTERS} filters={filters} onChange={onFilters} />
        ) : (
          /* Said rather than left blank. An empty band under four filter
             buttons reads as something that failed to load. */
          <p className="text-body-md text-gray-80">No Selected Filter</p>
        )}
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------- cards */

/** The sub-plans a program is read at, and their names behind the mark. The
 *  count is the fact — how many ways there are to take this degree — and the
 *  names are what you came to the mark for. */
function Subplans({ entry }: { entry: CatalogProgram }) {
  if (!entry.subplans) return null

  return (
    <Tooltip>
      {/* A span, not the trigger's own button: the whole card is a button now,
          and a button inside a button is not valid markup. */}
      <TooltipTrigger asChild>
        <span className="flex cursor-default items-center gap-1.5 text-body-md text-gray-80">
          {entry.subplans.label}: {entry.subplans.names.length}
          <Icon name="info" size={14} className="shrink-0" />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-[240px]">{entry.subplans.names.join(", ")}</TooltipContent>
    </Tooltip>
  )
}

/** One catalogue entry. What it is, what it is called, and then the two counts
 *  the page exists for — live versions in green, open drafts in red — with the
 *  department and the institution at the foot, where they identify the entry
 *  rather than describe it. */
function ProgramCard({ entry, onOpen }: { entry: CatalogProgram; onOpen: () => void }) {
  const live = published(entry)
  const drafts = unpublished(entry)

  return (
    /* The whole card is the way in, so there is nothing on it to hit
       separately — which is also why the hover is the card's own ground
       rather than a colour on the name. */
    <button
      type="button"
      onClick={onOpen}
      className="flex min-h-[224px] cursor-pointer flex-col items-start gap-2 rounded-md border border-gray-40 bg-card p-4 text-left transition-colors hover:bg-gray-0">
      <p className="text-body-md text-gray-80">{entry.kind}</p>
      {/* The catalogue's own name, as Advanced What-If writes it and as the
          plan header says it. One name for a program across the suite. */}
      <p className="text-h300 font-semibold text-gray-100">{entry.name}</p>
      <Subplans entry={entry} />

      {/* Stacked rather than side by side: they are two different facts about
          the entry, and a row of them reads as one fact in two halves. */}
      <div className="mt-1 flex flex-col items-start gap-2">
        <Badge variant="success">
          {live.length} Published Version{live.length === 1 ? "" : "s"}
        </Badge>
        {drafts.length > 0 && <Badge variant="danger">{drafts.length} Unpublished</Badge>}
      </div>

      {/* The department, and nothing under it. Every entry on this page belongs
          to the same institution, so naming it on all twenty-eight cards is a
          line that never varies and never says anything. */}
      <p className="mt-auto pt-6 text-body-md text-gray-80">{entry.department}</p>
    </button>
  )
}

/* ------------------------------------------------------------------ list */

export function ProgramGrid({
  shown,
  onOpen,
}: {
  shown: CatalogProgram[]
  onOpen: (entry: CatalogProgram) => void
}) {
  return (
    <div className={CARD}>
      <div className="flex flex-wrap items-center gap-4 border-b border-gray-40 p-6">
        {/* The count is what the two bands above it add up to, and it names
            what it counted: ten majors filtered out of the catalogue are
            majors, not programs. */}
        <p className="text-h300 font-semibold text-gray-100">
          {shown.length} {programNoun(shown)}
        </p>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <Button>Create New</Button>
          <Button size="icon" aria-label="Sort">
            <Icon name="sort" size={16} />
          </Button>
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="p-6 text-body-md text-gray-80">Nothing in the catalogue answers all of that.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 p-6 @2xl:grid-cols-2 @5xl:grid-cols-4">
          {shown.map((entry) => (
            <ProgramCard key={entry.id} entry={entry} onOpen={() => onOpen(entry)} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ page */

export function ProgramCatalog() {
  const [keywords, setKeywords] = useState("")
  const [filters, setFilters] = useState<Record<string, string[]>>({})
  /* Which entry is open, or none. Programs in the nav is the way back — it
     points at this page, so it reopens the list. */
  const [open, setOpen] = useState<CatalogProgram | null>(null)

  const shown = CATALOG.filter(
    (entry) =>
      matchesKeywords(entry, keywords) && matches(filters, (field) => valueOf(entry, field))
  )

  if (open) return <ProgramDetail entry={open} />

  return (
    <>
      <ProgramSearch
        keywords={keywords}
        onKeywords={setKeywords}
        filters={filters}
        onFilters={setFilters}
      />
      <ProgramGrid shown={shown} onOpen={setOpen} />
    </>
  )
}
