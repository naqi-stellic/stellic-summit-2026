import { cn } from "cn"
import { useState } from "react"

import { Icon, type IconName } from "@/components/icon"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  EmptyState,
  MenuButton,
  Panel,
  SearchField,
  Section,
  TabBar,
  type Tab,
} from "@/components/stellic/staff-chrome"
import { useToast } from "@/components/stellic/staff-toast"
import type { Persona } from "@/data/staff-home"
import {
  ARTICULATIONS,
  INSIGHT_PROGRAMS,
  INSIGHT_SORTS,
  INSIGHT_TAB_LABELS,
  TIERS,
  matchArticulations,
  matchPrograms,
  type Articulation,
  type InsightItem,
  type InsightProgram,
  type InsightQuery,
  type InsightSort,
  type InsightTab,
  type Severity,
  type Tier,
} from "@/data/staff-insights"

/* Insights: what Stellic found on its own.
 *
 * The tabs are the Open Items tabs — same topics, same order, no "All" — so the
 * two panels read as one page and a person learns the page once. What differs
 * is that nothing here was sent to anyone: these are findings, and the only
 * thing you can do with one other than fix it is put it away. */

const LAST_UPDATED = "Last updated 2:00am"

const REFRESH_NOTE =
  "Insights update on a schedule. Publishing an audit refreshes its findings right away, and everything else on this page is live."

/* ---------------------------------------------------------------- severity
   Different shapes as well as different colours. An octagon stops you and a
   triangle warns you, so the list still sorts itself for a reader who cannot
   tell the red from the amber. */

const SEVERITY: Record<Severity, { icon: IconName; tone: string; one: string; many: string }> = {
  crit: {
    icon: "report",
    tone: "bg-alert-5 text-alert-100",
    one: "critical issue",
    many: "critical issues",
  },
  warn: {
    icon: "warning",
    tone: "bg-warning-5 text-warning-50",
    one: "warning",
    many: "warnings",
  },
  opp: {
    icon: "lightbulb",
    tone: "bg-primary-0 text-primary-100",
    one: "opportunity",
    many: "opportunities",
  },
}

const ORDER: Severity[] = ["crit", "warn", "opp"]

function Pill({ severity, count }: { severity: Severity; count?: number }) {
  const { icon, tone, one, many } = SEVERITY[severity]
  const label = count === undefined ? one[0].toUpperCase() + one.slice(1) : `${count} ${count === 1 ? one : many}`

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-0.5 text-label-md font-semibold whitespace-nowrap",
        tone
      )}
    >
      <Icon name={icon} size={11} />
      {label}
    </span>
  )
}

/** Put it away. Never a delete: the insight is still there, still true, and
 *  still on everyone else's list. */
function Hide({ onHide, note }: { onHide: () => void; note: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="Hide this insight"
          onClick={(event) => {
            event.stopPropagation()
            onHide()
          }}
          className="flex size-[26px] shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-60 transition-colors hover:bg-gray-5 hover:text-gray-100"
        >
          <Icon name="close" size={13} />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-[250px]">{note}</TooltipContent>
    </Tooltip>
  )
}

/* The columns every insight row keeps, bundled or not. */
const COL_SUBJECT = "w-[252px] shrink-0 max-lg:w-[180px]"
const COL_TAGS = "flex w-[150px] shrink-0 flex-col items-start gap-1.5 pt-px max-lg:w-[110px]"
const COL_ACTIONS = "flex shrink-0 items-center justify-end gap-1"

function Finding({ item }: { item: InsightItem }) {
  return (
    <>
      <p className="text-label-md text-foreground">
        {item.count && <span className="font-semibold">{item.count} </span>}
        {item.message}
      </p>
      <p className="mt-1 text-label-md text-gray-80">
        {item.requirement}
        {item.impact && (
          <>
            <span className="mx-[7px] text-gray-40">|</span>
            <span className="font-semibold text-gray-100">{item.impact}</span>
          </>
        )}
      </p>
      <p className="mt-1 text-label-md text-gray-80">
        Suggested: <span className="text-gray-100">{item.fix}</span>
      </p>
    </>
  )
}

type Shown = InsightProgram & { shown: InsightItem[] }

function ProgramRow({
  program,
  hidden,
  onHideItem,
  onHideProgram,
  onOpen,
}: {
  program: Shown
  /** In the drawer, where there is nothing left to put away. */
  hidden: boolean
  onHideItem: (item: InsightItem) => void
  onHideProgram: () => void
  onOpen: () => void
}) {
  const [open, setOpen] = useState(false)
  /* One finding has nothing to unfold — the row simply says it. Several are a
     count first and a list second, which is what the chevron is for. */
  const single = program.shown.length === 1

  const subject = (
    <div className={COL_SUBJECT}>
      <p className="text-body-md font-semibold text-foreground">
        {program.program} <span className="font-normal text-gray-80">[{program.code}]</span>
      </p>
      <p className="mt-0.5 text-label-md text-gray-80">
        Version: <span className="font-semibold text-gray-100">{program.version}</span>
      </p>
    </div>
  )

  const editor = (
    <Button
      size="sm"
      onClick={(event) => {
        event.stopPropagation()
        onOpen()
      }}
    >
      Open in editor
    </Button>
  )

  if (single) {
    const item = program.shown[0]

    return (
      <div className="flex items-start gap-3.5 border-b border-divider p-4 transition-colors last:border-b-0 hover:bg-gray-0">
        <span className="w-[13px] shrink-0" />
        {subject}
        <div className={COL_TAGS}>
          <Pill severity={item.severity} />
        </div>
        <div className="min-w-0 flex-1">
          <Finding item={item} />
        </div>
        <div className={COL_ACTIONS}>
          {editor}
          {!hidden && (
            <Hide
              onHide={() => onHideItem(item)}
              note="Move this to hidden insights. Other staff still see it"
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="border-b border-divider last:border-b-0">
      <div
        onClick={() => setOpen(!open)}
        className="flex cursor-pointer items-start gap-3.5 p-4 transition-colors hover:bg-gray-0"
      >
        <button
          type="button"
          aria-expanded={open}
          aria-label={`${open ? "Hide" : "Show"} findings for ${program.program}`}
          onClick={(event) => {
            event.stopPropagation()
            setOpen(!open)
          }}
          className="mt-1 shrink-0 cursor-pointer text-gray-60"
        >
          <Icon
            name="chevron-right"
            size={13}
            className={cn("transition-transform", open && "rotate-90")}
          />
        </button>
        {subject}
        <div className={COL_TAGS}>
          {ORDER.map((severity) => {
            const count = program.shown.filter((item) => item.severity === severity).length
            return count ? <Pill key={severity} severity={severity} count={count} /> : null
          })}
        </div>
        <div className="min-w-0 flex-1" />
        <div className={COL_ACTIONS}>
          {editor}
          {!hidden && (
            <Hide
              onHide={onHideProgram}
              note="Move this program's insights to hidden. Other staff still see them"
            />
          )}
        </div>
      </div>

      {open && (
        <div className="border-t border-divider bg-gray-0 py-3.5 pr-5 pl-[43px]">
          {program.shown.map((item) => (
            <div key={item.id} className="flex items-start gap-3 py-2.5">
              <span className="w-[104px] shrink-0 pt-px">
                <Pill severity={item.severity} />
              </span>
              <div className="min-w-0 flex-1">
                <Finding item={item} />
              </div>
              {hidden ? (
                <span className="size-[26px] shrink-0" />
              ) : (
                <Hide
                  onHide={() => onHideItem(item)}
                  note="Move this to hidden insights. Other staff still see it"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** A catalogue-level finding: the row is the incoming course that wants a rule,
 *  so it leads with that and the institution it comes from, and the body leads
 *  with the size of the pile the rule would clear.
 *
 *  The second line is the only thing on the page Stellic is guessing at — it has
 *  matched an incoming course to a home one — so it is the only line that
 *  carries the assistant's mark and the only one that says "Suggestion" rather
 *  than "Suggested". A finding elsewhere on this page is a fact with a fix;
 *  this is a proposal. */
function ArticulationRow({
  row,
  hidden,
  onHide,
  onRule,
}: {
  row: Articulation
  hidden: boolean
  onHide: () => void
  onRule: () => void
}) {
  return (
    <div className="flex items-start gap-3.5 border-b border-divider p-4 transition-colors last:border-b-0 hover:bg-gray-0">
      <span className="w-[13px] shrink-0" />
      <div className={COL_SUBJECT}>
        <p className="text-body-md font-semibold text-foreground">{row.from}</p>
        <p className="mt-0.5 text-label-md text-gray-80">{row.institution}</p>
      </div>
      <div className={COL_TAGS}>
        <Pill severity="opp" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-body-md font-semibold text-foreground">{row.impact}</p>
        <p className="mt-2 flex items-start gap-2 text-label-md text-gray-80">
          <Icon name="auto-awesome" size={14} className="mt-px shrink-0" />
          Suggestion: <span className="min-w-0 text-gray-100">{row.suggestion}</span>
        </p>
      </div>
      <div className={COL_ACTIONS}>
        <Button size="sm" onClick={onRule}>
          Create rule
        </Button>
        {!hidden && (
          <Hide onHide={onHide} note="Move this to hidden insights. Other staff still see it" />
        )}
      </div>
    </div>
  )
}

/* ============================================================ the panel */

export function Insights({
  persona,
  jobs,
  hidden,
  onHide,
  onRestore,
  onCleared,
}: {
  persona: Persona
  jobs: Record<string, boolean>
  /** This person's own hidden set. Dismissal is per-user, so it is held per
   *  persona and never leaves anyone else's list. */
  hidden: Set<string>
  onHide: (ids: string[]) => void
  onRestore: (ids: string[]) => void
  onCleared: (n: number) => void
}) {
  const toast = useToast()
  const [tab, setTab] = useState<InsightTab>("audit")
  const [tier, setTier] = useState<Tier>("all")
  const [sort, setSort] = useState<InsightSort>("urgency")
  const [query, setQuery] = useState("")
  const [drawer, setDrawer] = useState(false)

  const perms = persona.perms
  const canEdit = perms.auditEdit || perms.auditPublish

  /* Only the sources this person can see anything in. A tab that would always
     be empty is worse than no tab. */
  const sources: InsightTab[] = [
    ...(canEdit && jobs.audits ? (["audit"] as const) : []),
    ...(canEdit && jobs.exc ? (["exceptions"] as const) : []),
    ...(perms.articulations && jobs.transfer ? (["transfer"] as const) : []),
  ]

  if (!sources.length) return null

  const here = sources.includes(tab) ? tab : sources[0]

  const programs = canEdit ? INSIGHT_PROGRAMS.filter((p) => p.vis.includes(persona.key)) : []
  const articulations = perms.articulations
    ? ARTICULATIONS.filter((row) => row.vis.includes(persona.key))
    : []

  const ask = (over: Partial<InsightQuery> = {}): InsightQuery => ({
    tab: here,
    tier,
    sort,
    query: query.trim().toLowerCase(),
    hidden,
    ...over,
  })

  const live = { programs: matchPrograms(programs, ask()), rows: matchArticulations(articulations, ask()) }
  const put = ask({ showHidden: true })
  const away = { programs: matchPrograms(programs, put), rows: matchArticulations(articulations, put) }

  const total = (bundle: typeof live) =>
    bundle.programs.reduce((sum, program) => sum + program.shown.length, 0) + bundle.rows.length

  const countIn = (source: InsightTab) => {
    const q = ask({ tab: source })
    return (
      matchPrograms(programs, q).reduce((sum, program) => sum + program.shown.length, 0) +
      matchArticulations(articulations, q).length
    )
  }

  const tabs: Tab[] = sources.map((source) => ({
    id: source,
    label: INSIGHT_TAB_LABELS[source],
    count: countIn(source),
  }))

  const hideThese = (ids: string[], said: string) => {
    onHide(ids)
    onCleared(ids.length)
    toast(said, { action: { label: "Undo", onAct: () => onRestore(ids) } })
  }

  const elsewhere = (what: string) => toast(`${what} (Exists in the real app)`)

  const editor = (program: InsightProgram) =>
    elsewhere(`Opens the audit editor: ${program.code} ${program.version}.`)

  const liveTotal = total(live)
  const awayTotal = total(away)

  const list = (bundle: typeof live, isHidden: boolean) => (
    <>
      {bundle.programs.map((program) => (
        <ProgramRow
          key={(isHidden ? "h-" : "") + program.id}
          program={program}
          hidden={isHidden}
          onOpen={() => editor(program)}
          onHideItem={(item) =>
            hideThese([item.id], "Moved to hidden insights. Other staff still see it.")
          }
          onHideProgram={() => {
            const ids = program.shown.map((item) => item.id)
            hideThese(
              ids,
              `${ids.length} insight${ids.length > 1 ? "s" : ""} on ${program.code} moved to hidden. Other staff still see them.`
            )
          }}
        />
      ))}
      {bundle.rows.map((row) => (
        <ArticulationRow
          key={(isHidden ? "h-" : "") + row.id}
          row={row}
          hidden={isHidden}
          onRule={() => elsewhere(`Launches the create rule sidebar for ${row.from}.`)}
          onHide={() => hideThese([row.id], "Moved to hidden insights. Other staff still see it.")}
        />
      ))}
    </>
  )

  return (
    <Section
      title="Insights"
      controls={
        <>
          <SearchField value={query} onChange={setQuery} placeholder="Search insights" />
          <MenuButton
            icon="filter-list"
            label="Filter insights"
            heading="Show"
            options={TIERS}
            value={tier}
            onSelect={setTier}
            marked={tier !== "all"}
          />
          <MenuButton
            icon="swap-vert"
            label="Sort insights"
            heading="Sort by"
            options={INSIGHT_SORTS}
            value={sort}
            onSelect={setSort}
          />
        </>
      }
    >
      <Panel>
        <TabBar tabs={tabs} active={here} onSelect={(id) => setTab(id as InsightTab)} />

        <div className="flex flex-wrap items-center gap-2.5 p-4">
          <Tooltip>
            <TooltipTrigger className="cursor-default text-label-md text-gray-60">
              {LAST_UPDATED}
            </TooltipTrigger>
            <TooltipContent className="max-w-[260px]">{REFRESH_NOTE}</TooltipContent>
          </Tooltip>
          <span className="flex-1" />
          {liveTotal > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  onClick={() => {
                    const ids = [
                      ...live.programs.flatMap((program) => program.shown.map((item) => item.id)),
                      ...live.rows.map((row) => row.id),
                    ]
                    hideThese(
                      ids,
                      `${ids.length} insight${ids.length > 1 ? "s" : ""} moved to hidden. Other staff still see them.`
                    )
                  }}
                >
                  Hide all
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-[250px]">
                Moves every insight below into hidden insights. Other staff still see them
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="border-t border-divider">
          {liveTotal ? (
            list(live, false)
          ) : query.trim() ? (
            <EmptyState
              title={`No matches for “${query.trim()}”`}
              detail="Try a different program or course."
              icon="auto-awesome"
            />
          ) : awayTotal ? (
            <EmptyState
              title="Nothing left to review."
              detail="Everything is in hidden insights below. Anything new shows up after tonight's refresh."
              icon="auto-awesome"
            />
          ) : (
            <EmptyState
              title="No insights right now."
              detail="Anything new shows up after tonight's refresh."
              icon="auto-awesome"
            />
          )}
        </div>

        {/* The ones this person has put away, parked at the foot of the same
            panel as the same rows. There is no Restore in here: an insight
            leaves the list by being fixed, not by being put back. */}
        {awayTotal > 0 && (
          <>
            <button
              type="button"
              onClick={() => setDrawer(!drawer)}
              aria-expanded={drawer}
              className={cn(
                "flex w-full cursor-pointer items-center gap-2.5 border-t border-divider bg-gray-0 px-4 py-3 text-left transition-colors hover:bg-gray-5",
                !drawer && "rounded-b-lg"
              )}
            >
              <Icon
                name="chevron-right"
                size={13}
                className={cn("text-gray-60 transition-transform", drawer && "rotate-90")}
              />
              <span className="text-label-md font-semibold text-gray-100">
                {awayTotal} hidden insight{awayTotal > 1 ? "s" : ""}
              </span>
            </button>
            {drawer && (
              <div className="overflow-hidden rounded-b-lg border-t border-divider bg-gray-0">
                {list(away, true)}
              </div>
            )}
          </>
        )}
      </Panel>
    </Section>
  )
}
