import { useEffect, useState } from "react"

import { Icon } from "@/components/icon"
import { PlanHeader, type PlanAction, type YearTab } from "@/components/stellic/plan-header"
import { TermCalendar } from "@/components/stellic/term-calendar"
import { TermList } from "@/components/stellic/term-list"
import { ActionLines } from "@/components/stellic/term-actions"
import { StatusPill } from "@/components/stellic/primitives"
import { usePendingReview } from "@/components/stellic/review-state"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { CatalogEntry } from "@/data/catalog"
import {
  METADATA_FIELDS,
  registrableCourses,
  termActions,
  type MetadataField,
  type Term,
} from "@/data/plan"

/* One term on its own. Everything a term can show depends on whether its class
 * schedule is published: until it is, there are no times to put on a calendar,
 * so the list is all there is. */

function RegistrationAlert({ term, onRegister }: { term: Term; onRegister?: () => void }) {
  /* A draft is a proposal. Nothing in it can be put through registration until
     it has been applied, so the invitation is there but not open. */
  const drafting = term.courses.some((c) => c.draft)
  const ready = registrableCourses(term).length

  return (
    <Alert className="border-gray-40 px-[23px] py-[15px]">
      <Icon name="shopping-cart" size={16} className="shrink-0 text-gray-100" />
      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2">
        <span className="font-semibold">Registration is now open!</span>
        <span className="whitespace-nowrap">Closes: {term.alert?.closes}</span>
      </span>
      {/* It counts what would go through, and there is nothing to press when
          that is none of them — whether because no class has been chosen yet
          or because everything with one has already been registered. */}
      <Button
        variant="primary"
        size="sm"
        className="shrink-0"
        disabled={drafting || ready === 0}
        onClick={onRegister}
      >
        Register {ready} course{ready === 1 ? "" : "s"}
      </Button>
    </Alert>
  )
}

function ActionsAlert({
  term,
  onPickSection,
}: {
  term: Term
  onPickSection?: (termId: string, courseId: string) => void
  /** Opens the panel that fills this term to a credit target. */
  onGenerateTerm?: () => void
  /** Asks for a review of this term alone — the plan-wide first step is
   *  already answered, so the dialog opens on its second. */
  onRequestReview?: () => void
  /** Whether this prototype offers to generate the term or its schedule. */
  generators?: boolean
  /** The requirements panel the header's sidebar button opens. */
  sidebar?: { open: boolean; onToggle: () => void }
  /** What can be planned into this term, and what to do when one is. */
  addable?: CatalogEntry[]
  onAddCourse?: (entry: CatalogEntry) => void
  /** While a draft is up: show what the term already held alongside what is
   *  proposed, rather than the proposal on its own. */
  compare?: boolean
}) {
  const actions = termActions(term)

  return (
    <Alert variant="warning" className="flex-col items-start gap-2 p-[15px]">
      <p className="text-body-md font-semibold text-gray-100">
        {actions.length} action{actions.length === 1 ? "" : "s"} required
      </p>
      <ActionLines term={term} onPickSection={onPickSection} />
    </Alert>
  )
}

export function TermView({
  term,
  tabs,
  metadata,
  onToggleField,
  onRegister,
  onPickSection,
  onGenerateTerm,
  onRequestReview,
  generators = true,
  sidebar,
  addable,
  onAddCourse,
  compare = true,
}: {
  term: Term
  /** The year filter, with the term's own year marked. It is also the way out:
   *  any other year, or All Years, goes back to the whole plan. */
  tabs: YearTab[]
  /** Which details the cards are showing. The menu is the same one the whole
   *  plan uses, so a change made here holds when you go back out to it. */
  metadata: MetadataField[]
  onToggleField: (id: string) => void
  onRegister?: () => void
  onPickSection?: (termId: string, courseId: string) => void
  /** Opens the panel that fills this term to a credit target. */
  onGenerateTerm?: () => void
  /** Asks for a review of this term alone — the plan-wide first step is
   *  already answered, so the dialog opens on its second. */
  onRequestReview?: () => void
  /** Whether this prototype offers to generate the term or its schedule. */
  generators?: boolean
  /** The requirements panel the header's sidebar button opens. */
  sidebar?: { open: boolean; onToggle: () => void }
  /** What can be planned into this term, and what to do when one is. */
  addable?: CatalogEntry[]
  onAddCourse?: (entry: CatalogEntry) => void
  /** While a draft is up: show what the term already held alongside what is
   *  proposed, rather than the proposal on its own. */
  compare?: boolean
}) {
  /* A term under way or already taken opens on its calendar: the week is
   * settled and the week is the thing to look at. A term still being planned
   * opens on its list, even once its schedule is published — what is being
   * done there is choosing courses, and half of them may have no class yet. */
  const [mode, setMode] = useState(
    term.scheduled && term.state !== "planned" ? "calendar" : "list"
  )

  /* Unless a generated week arrives, which is a week to be read against the
   * one it replaces — so the term turns to its calendar to show it. */
  const proposing = term.scheduled === true && term.courses.some((c) => c.draft != null)
  useEffect(() => {
    if (proposing) setMode("calendar")
  }, [proposing])
  const actions = termActions(term)
  const pending = usePendingReview(term.id)

  const plannerActions: PlanAction[] = [
    { label: "Request review", icon: "assignment" },
    ...(generators
      ? [
          {
            label: term.scheduled ? "Generate Schedule" : "Generate Term",
            icon: "design-services" as const,
            toggles: true,
          },
        ]
      : /* A prototype without the generators still has the scheduler, which is
           already a product — but only where there is a schedule to generate
           against, so it is there for a term whose week is out, in either view,
           and absent from one whose calendar is still disabled. It opens
           nothing here. */
        term.scheduled
        ? [{ label: "Generate Schedule", icon: "design-services" as const }]
        : []),
    {
      label: "Plan details",
      icon: "remove-red-eye",
      fields: METADATA_FIELDS.map((field) => ({
        ...field,
        shown: metadata.includes(field.id),
      })),
    },
  ]

  return (
    <main className="@container flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
      <PlanHeader
        actions={plannerActions}
        tabs={tabs}
        sidebar={sidebar}
        onToggleField={onToggleField}
        onAction={(action) => {
          if (action.toggles) onGenerateTerm?.()
          else if (action.label === "Request review") onRequestReview?.()
        }}
      />

      {/* These are not alternatives. A term can have registration open and still
          have courses that cannot go through it yet, which is exactly where
          Spring 2028 stands: the window is open, and neither course has a
          section to register. The warning sits under the invitation. */}
      {term.scheduled && term.alert && (
        <RegistrationAlert term={term} onRegister={onRegister} />
      )}
      {actions.length > 0 && <ActionsAlert term={term} onPickSection={onPickSection} />}

      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="min-w-0 truncate text-h300 font-semibold text-gray-100">{term.name}</h3>
          {/* Out for review: said beside the term's name, where the planner
              says it on the term's card. */}
          {pending && <StatusPill status="pending review">Pending Review</StatusPill>}
        </div>

        <Tabs value={mode} onValueChange={setMode}>
          <TabsList>
            <TabsTrigger value="list">
              <Icon name="list" size={16} />
              List
            </TabsTrigger>
            {/* Nothing to draw until the schedule is out. */}
            <TabsTrigger value="calendar" disabled={!term.scheduled}>
              <Icon name="calendar-month" size={16} />
              Calendar
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {mode === "calendar" && term.scheduled ? (
        <TermCalendar
          term={term}
          compare={compare}
          addable={addable}
          onAddCourse={onAddCourse}
        />
      ) : (
        <TermList term={term} addable={addable} onAddCourse={onAddCourse} />
      )}
    </main>
  )
}
