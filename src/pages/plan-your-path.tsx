import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { useEffect, useRef, useState } from "react"

import { Icon, type IconName } from "@/components/icon"
import { AppShell } from "@/components/layout/app-shell"
import { DraftBar, DraftOutline } from "@/components/stellic/draft-frame"
import { GeneratePlanPanel } from "@/components/stellic/generate-plan-panel"
import {
  AuditRow,
  NoActionsAlert,
  STREAM_CAP,
  STREAM_MS,
  TimelineRail,
  YearSection,
} from "@/components/stellic/planner"
import { AddSlot } from "@/components/stellic/primitives"
import {
  Alert,
  AlertBody,
  AlertDescription,
  AlertHeader,
  AlertTitle,
} from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { CatalogEntry } from "@/data/catalog"
import {
  acceptDraft,
  addCourse,
  addableCourses,
  draftLength,
  draftTally,
  explainTerm,
  generateDraft,
  moveInDraft,
  planOptions,
  removeInDraft,
  summariseDraft,
  type Draft,
  type DraftOption,
} from "@/data/draft"
import {
  COMPLETED,
  INITIAL_YEARS,
  expectedGraduation,
  findCourse,
  moveCourse,
  nextYearNumber,
  planCampuses,
  planStanding,
  removeCourse,
  selectableTerms,
  type Term,
  type Year,
} from "@/data/plan"

type YearTab = { label: string; icon?: IconName; tone?: string; selected?: boolean }

const PHASE_TAB = {
  complete: { icon: "check-circle", tone: "text-success-100" },
  active: { icon: "timelapse", tone: "text-warning-50" },
  future: {},
} as const

/* One tab per year the plan actually covers, completed year included, so the
   filter can never omit a year that is on screen. */
function yearTabs(years: Year[]): YearTab[] {
  return [
    { label: "All Years", icon: "grid-view", selected: true },
    { label: COMPLETED.label, ...PHASE_TAB.complete },
    ...years.map((year) => ({ label: year.label, ...PHASE_TAB[year.phase] })),
  ]
}

/* Long enough for the last staggered card to finish settling (14 × 35ms of
   stagger plus a 420ms vanish), then the frame follows it out. */
const SETTLE_MS = 1100

/** The option that collects the student's own changes. */
const CUSTOM_ID = "custom"

type PlanAction = { label: string; icon: IconName; toggles?: boolean }

const PLAN_ACTIONS: PlanAction[] = [
  { label: "Request review", icon: "assignment" },
  { label: "Generate plan", icon: "design-services", toggles: true },
  { label: "Plan details", icon: "remove-red-eye" },
]

function RegistrationAlert({ closes }: { closes: string }) {
  /* 92px is the design's height; a minimum rather than a fixed value so the
     banner can grow when the closing date wraps to a second line. */
  return (
    <Alert className="min-h-[92px]">
      <AlertBody>
        <AlertHeader>
          <AlertTitle>
            <Icon name="shopping-cart" size={16} className="mt-0.5 shrink-0 text-primary-100" />
            Registration is now open!
          </AlertTitle>
          {/* The date stays on one line while there is room for it; in a term
              sharing its row with two others there is not. */}
          <AlertDescription className="@max-[400px]/term:whitespace-normal">
            Closes: {closes}
          </AlertDescription>
        </AlertHeader>
        <Button variant="primary" size="sm">
          Register Now
        </Button>
      </AlertBody>
    </Alert>
  )
}

function PlanFacet({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-2">
      <span className="text-body-md font-semibold text-foreground">{label}</span>
      <Badge variant="secondary" className="max-w-full">
        <span className="min-w-0 truncate">{value}</span>
        <Icon name="close" size={12} className="shrink-0" />
      </Badge>
      <a
        href="#"
        className="text-body-md text-gray-80 underline [text-underline-position:from-font]"
      >
        + add another
      </a>
    </div>
  )
}

/** A term's banner: the registration deadline when it has one, and — while a
 *  draft is on the canvas — the reassurance that it needs nothing otherwise. */
function termBanner(term: Term, drafting: boolean) {
  if (term.alert) return <RegistrationAlert closes={term.alert.closes} />
  return drafting && !term.locked ? <NoActionsAlert /> : null
}

export function PlanYourPath() {
  const [years, setYears] = useState(INITIAL_YEARS)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [generateOpen, setGenerateOpen] = useState(false)

  /* One draft per option, generated together so the panel can show what each
   * one costs before the student commits to looking at it. */
  const [drafts, setDrafts] = useState<{ options: DraftOption[]; made: Draft[] } | null>(null)
  /* Everything the student changes by hand collects in one option of its own,
   * so the generated three stay as they were generated. */
  const [custom, setCustom] = useState<{ option: DraftOption; draft: Draft } | null>(null)
  const [optionId, setOptionId] = useState("steady")
  const [explained, setExplained] = useState<string | null>(null)
  /* Accepting is not instant: the marks come off and the struck cards leave
   * before the plan underneath becomes the real one. */
  const [accepting, setAccepting] = useState(false)
  /* The playground frames itself while the run is on its last step, so the plan
   * arrives into something rather than appearing with it. */
  const [framing, setFraming] = useState(false)
  /* Bumped whenever a draft should land afresh — generated, or a different
   * option chosen. A change made by hand is not a new arrival, so it leaves
   * this alone and the plan on screen stays put. */
  const [streamId, setStreamId] = useState(0)
  /* How much of the landing draft has arrived. Infinity once it all has, which
   * is also the resting state for a draft that is just sitting there. */
  const [revealed, setRevealed] = useState(Infinity)

  const draft =
    (optionId === CUSTOM_ID ? custom?.draft : drafts?.made.find((d) => d.optionId === optionId)) ??
    null
  const option =
    (optionId === CUSTOM_ID ? custom?.option : drafts?.options.find((o) => o.id === optionId)) ??
    null
  /* The draft is a proposal laid over the plan; the plan itself is untouched
   * underneath until it is accepted. */
  const shown = draft ? draft.years : years

  const sensors = useSensors(
    /* A few pixels of travel before a drag starts, so rows stay clickable. */
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const dragging = draggingId ? findCourse(shown, draggingId) : null
  /* Offered by every term's "+ Add to Term", so the same requirement is never
   * offered twice over. */
  const addable = addableCourses(shown)
  /* What the bar says while a draft is arriving. */
  const landedTally = draft ? draftTally(draft.years, revealed) : { added: 0, removed: 0 }
  const standing = planStanding(years)

  const optionSummaries = [
    ...(drafts?.made ?? []).map((d) => ({
      meta: drafts!.options.find((o) => o.id === d.optionId)!,
      draft: d,
    })),
    ...(custom ? [{ meta: custom.option, draft: custom.draft }] : []),
  ].map(({ meta, draft: d }) => ({
    id: meta.id,
    label: meta.label,
    blurb: meta.blurb,
    graduation: d.graduation,
    added: d.added,
    removed: d.removed,
  }))

  const placeholders = draft
    ? draft.years.reduce(
        (sum, year) =>
          sum +
          year.terms.reduce(
            (n, term) => n + term.courses.filter((c) => c.placeholder && c.draft).length,
            0
          ),
        0
      )
    : 0

  /* The options are built around the pace the student asked for, so the answer
   * from step 2 decides what the three of them look like. */
  /* The cards land on CSS delays; this walks the same interval so the tallies
   * climb with them rather than standing at the total from the first frame. */
  const landing = draft?.years
  useEffect(() => {
    if (!landing) return
    const last = Math.min(draftLength(landing), STREAM_CAP)
    setRevealed(0)
    let at = 0
    const tick = window.setInterval(() => {
      at += 1
      setRevealed(at > last ? Infinity : at)
      if (at > last) window.clearInterval(tick)
    }, STREAM_MS)
    return () => window.clearInterval(tick)
    /* Keyed on the arrival, not on the draft: editing one by hand must not set
       the whole plan landing again. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamId])

  /* The first change is usually below the fold, and a plan you never saw
   * arrive may as well have been there all along. */
  const hadDraft = useRef(false)
  useEffect(() => {
    const has = draft != null
    if (has && !hadDraft.current) {
      requestAnimationFrame(() => {
        const first = document.querySelector("[data-term] [data-draft-mark]")
        first?.closest("[data-term]")?.scrollIntoView({ behavior: "smooth", block: "center" })
      })
    }
    hadDraft.current = has
  }, [draft])

  function startDraft(coursesPerTerm: number) {
    setFraming(false)
    setStreamId((n) => n + 1)
    const options = planOptions(coursesPerTerm)
    setDrafts({ options, made: options.map((o) => generateDraft(years, o)) })
    setCustom(null)
    setOptionId(options[0].id)
    setExplained(null)
  }

  function dropDraft() {
    setFraming(false)
    setRevealed(Infinity)
    setDrafts(null)
    setCustom(null)
    setExplained(null)
  }

  /* A change made by hand forks whichever option is on screen into the custom
   * one, which then becomes the selected plan. */
  function editDraft(change: (years: Year[]) => Year[]) {
    if (!draft || !option || accepting) return
    const next = change(draft.years)
    if (next === draft.years) return

    setCustom({
      option:
        option.id === CUSTOM_ID
          ? option
          : /* No blurb: the card names itself rather than describing a strategy
               it is no longer following. */
            { ...option, id: CUSTOM_ID, label: "Custom Plan", blurb: "" },
      draft: summariseDraft(next, CUSTOM_ID),
    })
    setOptionId(CUSTOM_ID)
  }

  function keepDraft() {
    if (!draft || accepting) return
    setAccepting(true)
    window.setTimeout(() => {
      setYears(acceptDraft(draft.years))
      setAccepting(false)
      dropDraft()
      setGenerateOpen(false)
    }, SETTLE_MS)
  }

  function handleDragStart(event: DragStartEvent) {
    setDraggingId(String(event.active.id))
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setDraggingId(null)
    if (!over) return

    const courseId = String(active.id)
    /* Dropping onto a row inserts at its position; onto a card, appends. */
    const overCourse = findCourse(shown, String(over.id))
    const toTerm = overCourse ? overCourse.term.id : String(over.id)
    const toIndex = overCourse ? overCourse.index : undefined

    if (draft) editDraft((current) => moveInDraft(current, courseId, toTerm, toIndex))
    else setYears((current) => moveCourse(current, courseId, toTerm, toIndex))
  }

  function handleRemoveCourse(courseId: string) {
    if (draft) editDraft((current) => removeInDraft(current, courseId))
    else setYears((current) => removeCourse(current, courseId))
  }

  function handleAddCourse(termId: string, entry: CatalogEntry) {
    if (draft) editDraft((current) => addCourse(current, termId, entry, true))
    else setYears((current) => addCourse(current, termId, entry, false))
  }

  return (
    <AppShell
      title="Plan Your Path"
      assistLabel={draft ? "Make changes to Generated plan" : "Generate with Assistant"}
      panel={
        generateOpen && (
          <GeneratePlanPanel
            standing={standing}
            graduation={expectedGraduation(years)}
            terms={selectableTerms(years)}
            campus={planCampuses(years)}
            options={optionSummaries}
            selectedOption={optionId}
            placeholders={placeholders}
            onSelectOption={(id) => {
              setOptionId(id)
              setExplained(null)
              /* A different option is a different plan: it lands like one. */
              setStreamId((n) => n + 1)
            }}
            onFraming={() => setFraming(true)}
            onGenerated={startDraft}
            onDiscardDraft={dropDraft}
            onClose={() => {
              dropDraft()
              setGenerateOpen(false)
            }}
          />
        )
      }
    >
      <DndContext
        sensors={sensors}
        /* pointerWithin only reports droppables the cursor is actually inside,
         * so releasing over a locked term (or empty canvas) resolves to no
         * target and the course snaps back instead of landing somewhere near. */
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setDraggingId(null)}
      >
        {/* relative so the draft's ring can be drawn over the canvas without
            moving anything that is already on it. */}
        <div className="relative flex min-w-0 flex-1 flex-col">
          {draft && (
            <DraftBar
              added={landedTally.added}
              removed={landedTally.removed}
              showRemoved={draft.removed > 0}
              leaving={accepting}
              onExit={() => {
                dropDraft()
                setGenerateOpen(false)
              }}
              onAccept={keepDraft}
            />
          )}

          {/* @container so the planner reflows to its own width — the panel
              opening matters as much as the viewport shrinking. */}
          <main className="@container flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
          {/* ---------------------------------- Plan header */}
          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <h2 className="flex items-center gap-1 text-h400 font-semibold text-gray-100">
                Primary Plan
                <Icon name="expand-more" size={16} />
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                {PLAN_ACTIONS.map((action) => (
                  <Button
                    key={action.label}
                    aria-pressed={action.toggles ? generateOpen : undefined}
                    onClick={action.toggles ? () => setGenerateOpen((open) => !open) : undefined}
                  >
                    <Icon name={action.icon} size={16} />
                    {action.label}
                  </Button>
                ))}
                <Button size="icon" aria-label="Toggle sidebar">
                  <Icon name="view-sidebar" size={16} />
                </Button>
                <Button size="icon" aria-label="More options">
                  <Icon name="more-horiz" size={16} />
                </Button>
              </div>
            </div>

            <PlanFacet
              label="Programs:"
              value="BSc in Business Administration (concentration: Finance)"
            />
            <PlanFacet label="Pathway:" value="Business Administration: Fall Start 2026 [BSc]" />

            <div className="flex flex-wrap items-center gap-2 pt-2">
              {yearTabs(shown).map((tab) => (
                <Button key={tab.label} size="sm" selected={tab.selected}>
                  {tab.icon && <Icon name={tab.icon} size={16} className={tab.tone} />}
                  {tab.label}
                </Button>
              ))}
            </div>
          </section>

          {/* ---------------------------------- 2026-2027, collapsed */}
          <section className="flex items-start gap-4">
            <TimelineRail phase="complete" nodes={1} />
            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-4 gap-y-1 pb-4">
              <h3 className="flex items-center gap-1 text-h300 font-semibold text-gray-100">
                {COMPLETED.label}
                <Icon name="unfold-more" size={16} />
              </h3>
              <p className="text-label-md text-gray-100">
                {COMPLETED.courses} courses, {COMPLETED.credits} credits earned
              </p>
            </div>
          </section>

          {/* Keyed on the option so switching one replays the entrances rather
              than swapping the cards in place. */}
          <div key={draft ? `draft-${streamId}` : "plan"} className="contents">
            {shown.map((year) => (
              <YearSection
                key={year.label}
                year={year}
                settling={accepting}
                revealed={revealed}
                addable={addable}
                renderAlert={(term) => (
                  <>
                    {termBanner(term, draft != null)}
                    {explained === term.id && option && (
                      <p className="animate-rise w-full rounded-md border border-gray-40 bg-gray-0 p-[11px] text-label-md text-gray-100">
                        {explainTerm(term, option)}
                      </p>
                    )}
                  </>
                )}
                onRemoveCourse={handleRemoveCourse}
                onAddCourse={handleAddCourse}
                onExplain={
                  option
                    ? (term) => setExplained((current) => (current === term.id ? null : term.id))
                    : undefined
                }
              />
            ))}
          </div>

          {/* ---------------------------------- Add year */}
          <section className="flex items-start gap-4">
            <div className="flex w-6 shrink-0 flex-col items-center justify-center self-stretch">
              <Icon name="fiber-manual-record" size={24} className="text-gray-40" />
            </div>
            <AddSlot tone="year">+ Add Year {nextYearNumber(shown)}</AddSlot>
          </section>
          </main>

          {(draft || framing) && <DraftOutline leaving={accepting} pending={draft == null} />}
        </div>

        <DragOverlay>
          {dragging && <AuditRow course={dragging.course} overlay />}
        </DragOverlay>
      </DndContext>
    </AppShell>
  )
}
