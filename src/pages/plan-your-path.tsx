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
import { useState } from "react"

import { Icon, type IconName } from "@/components/icon"
import { AppShell } from "@/components/layout/app-shell"
import { GeneratePlanPanel } from "@/components/stellic/generate-plan-panel"
import { AuditRow, TimelineRail, YearSection } from "@/components/stellic/planner"
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
import {
  COMPLETED,
  INITIAL_YEARS,
  expectedGraduation,
  findCourse,
  moveCourse,
  nextYearNumber,
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
            <Icon name="shopping-cart" size={16} className="mt-0.5 text-primary-100" />
            Registration is now open!
          </AlertTitle>
          <AlertDescription>Closes: {closes}</AlertDescription>
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
    <div className="flex items-center gap-1">
      <span className="text-body-md font-semibold text-foreground">{label}</span>
      <Badge variant="secondary">
        {value}
        <Icon name="close" size={12} />
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

function renderAlert(term: Term) {
  return term.alert ? <RegistrationAlert closes={term.alert.closes} /> : null
}

export function PlanYourPath() {
  const [years, setYears] = useState(INITIAL_YEARS)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [generateOpen, setGenerateOpen] = useState(false)

  const sensors = useSensors(
    /* A few pixels of travel before a drag starts, so rows stay clickable. */
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const dragging = draggingId ? findCourse(years, draggingId) : null
  const standing = planStanding(years)

  function handleDragStart(event: DragStartEvent) {
    setDraggingId(String(event.active.id))
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setDraggingId(null)
    if (!over) return

    const courseId = String(active.id)
    /* Dropping onto a row inserts at its position; onto a card, appends. */
    const overCourse = findCourse(years, String(over.id))
    setYears((current) =>
      overCourse
        ? moveCourse(current, courseId, overCourse.term.id, overCourse.index)
        : moveCourse(current, courseId, String(over.id))
    )
  }

  function handleRemoveCourse(courseId: string) {
    setYears((current) => removeCourse(current, courseId))
  }

  return (
    <AppShell
      title="Plan Your Path"
      panel={
        generateOpen && (
          <GeneratePlanPanel
            standing={standing}
            graduation={expectedGraduation(years)}
            terms={selectableTerms(years)}
            onClose={() => setGenerateOpen(false)}
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
              {yearTabs(years).map((tab) => (
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

          {years.map((year) => (
            <YearSection
              key={year.label}
              year={year}
              renderAlert={renderAlert}
              onRemoveCourse={handleRemoveCourse}
            />
          ))}

          {/* ---------------------------------- Add year */}
          <section className="flex items-start gap-4">
            <div className="flex w-6 shrink-0 flex-col items-center justify-center self-stretch">
              <Icon name="fiber-manual-record" size={24} className="text-gray-40" />
            </div>
            <AddSlot tone="year">+ Add Year {nextYearNumber(years)}</AddSlot>
          </section>
        </main>

        <DragOverlay>
          {dragging && <AuditRow course={dragging.course} overlay />}
        </DragOverlay>
      </DndContext>
    </AppShell>
  )
}
