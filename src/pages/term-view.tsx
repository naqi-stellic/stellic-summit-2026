import { useState } from "react"

import { Icon } from "@/components/icon"
import { PlanHeader, type PlanAction, type YearTab } from "@/components/stellic/plan-header"
import { TermCalendar } from "@/components/stellic/term-calendar"
import { TermList } from "@/components/stellic/term-list"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  METADATA_FIELDS,
  courseStatus,
  missingLine,
  termActions,
  type MetadataField,
  type Term,
} from "@/data/plan"

/* One term on its own. Everything a term can show depends on whether its class
 * schedule is published: until it is, there are no times to put on a calendar,
 * so the list is all there is. */

function RegistrationAlert({ term }: { term: Term }) {
  const ready = term.courses.filter((c) => courseStatus(c) === "ready").length

  return (
    <Alert className="border-gray-40 px-[23px] py-[15px]">
      <Icon name="shopping-cart" size={16} className="shrink-0 text-gray-100" />
      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2">
        <span className="font-semibold">Registration is now open!</span>
        <span className="whitespace-nowrap">Closes: {term.alert?.closes}</span>
      </span>
      <Button variant="primary" size="sm" className="shrink-0">
        {/* Nothing is ready to register until a section is chosen, so the
            button asks you to start rather than counting to zero. */}
        {ready > 0 ? `Register ${ready} course${ready === 1 ? "" : "s"}` : "Register courses"}
      </Button>
    </Alert>
  )
}

function ActionsAlert({ term }: { term: Term }) {
  const actions = termActions(term)

  return (
    <Alert variant="warning" className="flex-col items-start gap-2 p-[15px]">
      <p className="text-body-md font-semibold text-gray-100">
        {actions.length} action{actions.length === 1 ? "" : "s"} required
      </p>
      {actions.map((course) => {
        const missing = missingLine(course)
        return (
          <p key={course.id} className="flex w-full flex-wrap items-center gap-2 text-body-md">
            <Icon name="warning" size={16} className="shrink-0 text-warning-50" />
            <span className="font-semibold">{course.name}</span>
            <span>{missing.says}</span>
            <button
              type="button"
              className="cursor-pointer underline [text-underline-position:from-font]"
            >
              {missing.action}
            </button>
          </p>
        )
      })}
    </Alert>
  )
}

export function TermView({
  term,
  tabs,
  metadata,
  onToggleField,
}: {
  term: Term
  /** The year filter, with the term's own year marked. It is also the way out:
   *  any other year, or All Years, goes back to the whole plan. */
  tabs: YearTab[]
  /** Which details the cards are showing. The menu is the same one the whole
   *  plan uses, so a change made here holds when you go back out to it. */
  metadata: MetadataField[]
  onToggleField: (id: string) => void
}) {
  /* A published schedule is what the calendar is for, so a term that has one
   * opens on it — empty, if no section has been chosen yet, which is itself
   * the thing to do next. */
  const [mode, setMode] = useState(term.scheduled ? "calendar" : "list")
  const actions = termActions(term)

  const plannerActions: PlanAction[] = [
    { label: "Request review", icon: "assignment" },
    {
      label: term.scheduled ? "Generate Schedule" : "Generate Term",
      icon: "design-services",
    },
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
      <PlanHeader actions={plannerActions} tabs={tabs} onToggleField={onToggleField} />

      {term.scheduled && term.alert ? (
        <RegistrationAlert term={term} />
      ) : actions.length > 0 ? (
        <ActionsAlert term={term} />
      ) : null}

      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <h3 className="min-w-0 truncate text-h300 font-semibold text-gray-100">{term.name}</h3>

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
        <TermCalendar term={term} />
      ) : (
        <TermList term={term} />
      )}
    </main>
  )
}
