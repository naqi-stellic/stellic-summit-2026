import { useState } from "react"

import { Icon } from "@/components/icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ELECTIVE_COURSES, ALL_ELECTIVES } from "@/data/catalog"
import {
  CREDIT_GROUP_LABEL,
  DEGREE,
  creditGroup,
  type PlannedCourse,
  type Term,
} from "@/data/plan"

/* A seat opened on its own: what it is holding a place for, which term it is
 * in, and the way to fill it. "Find eligible courses" turns the same panel
 * into the search, which comes back to this. */

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex w-full flex-col gap-1">
      <span className="text-body-md font-semibold text-foreground">{label}</span>
      {children}
    </div>
  )
}

/* A course as the search lists it: the handle it would be dragged by, its code
   and its name. The name wraps rather than truncating — the frame's rows grow
   to two lines and several of them do. */
function CourseRow({ code, name }: { code: string; name: string }) {
  return (
    <div className="flex w-full cursor-grab items-center gap-2 rounded-md border border-gray-40 bg-card p-[7px]">
      <Icon name="drag-indicator" size={16} className="shrink-0 text-gray-100" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-body-md text-gray-80">{code}</span>
        <span className="text-body-md font-semibold text-foreground">{name}</span>
      </span>
    </div>
  )
}

export function PlaceholderPanel({
  course,
  term,
  initialView = "detail",
  onClose,
}: {
  course: PlannedCourse
  /** The term the seat is held in. */
  term: Term
  /** Opened from the card's search button, it starts on the courses. */
  initialView?: "detail" | "search"
  onClose: () => void
}) {
  const [searching, setSearching] = useState(initialView === "search")

  /* A finance seat lists finance courses; a general one lists general ones.
     Anything else falls back to every elective there is. */
  const eligible = ELECTIVE_COURSES[course.code] ?? ALL_ELECTIVES

  if (searching) {
    return (
      /* The same grey ground the seat's own panel stands on, with the search
         and its results as two cards on it. */
      <aside className="flex h-full w-full flex-col gap-4 overflow-x-clip overflow-y-auto bg-background p-6 pb-28">
        {/* Where this came from, and the way out of it. */}
        <div className="flex w-full shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setSearching(false)}
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-body-md text-gray-80"
          >
            <Icon name="chevron-left" size={14} className="shrink-0" />
            <span className="min-w-0 truncate text-left">Back to {course.name}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close course search"
            className="shrink-0 cursor-pointer rounded-md text-gray-100"
          >
            <Icon name="close" size={24} />
          </button>
        </div>

        {/* The search that produced this. In a working planner the count is the
            filters it was run with and the chevron folds them open; here it is
            what it says it is. */}
        <div className="flex w-full shrink-0 items-center gap-2 rounded-md bg-card p-6 shadow-sm">
          <h2 className="text-caption-lg font-semibold text-foreground">Course Search</h2>
          <Badge variant="secondary">3</Badge>
          <Icon name="expand-less" size={16} className="text-gray-100" />
        </div>

        <div className="flex w-full flex-col gap-2 rounded-md bg-card p-6 shadow-sm">
          <div className="flex h-9 w-full items-center justify-between gap-2">
            <h3 className="min-w-0 truncate text-h300 font-semibold text-gray-100">
              {eligible.length} Course{eligible.length === 1 ? "" : "s"}
            </h3>
            <span className="flex shrink-0 items-center gap-2">
              <Button size="icon" aria-label="Sort">
                <Icon name="unfold-more" size={16} />
              </Button>
              {/* Cards or a plain list, the way the term view switches between
                  its own two. Only the one is drawn. */}
              <Tabs value="cards">
                <TabsList>
                  <TabsTrigger value="cards" aria-label="Cards">
                    <Icon name="grid-view" size={16} />
                  </TabsTrigger>
                  <TabsTrigger value="list" aria-label="List">
                    <Icon name="list" size={16} />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </span>
          </div>

          {eligible.map((entry) => (
            <CourseRow key={entry.code} code={entry.code} name={entry.name} />
          ))}
        </div>
      </aside>
    )
  }

  return (
    <aside className="flex h-full w-full flex-col gap-4 overflow-x-clip overflow-y-auto bg-background p-6 pb-28">
      <div className="flex w-full justify-end">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close placeholder"
          className="cursor-pointer rounded-md text-gray-100"
        >
          <Icon name="close" size={24} />
        </button>
      </div>

      <div className="flex w-full flex-col rounded-md bg-card shadow-sm">
        <div className="flex w-full flex-col gap-1 p-6">
          <h2 className="flex flex-wrap items-baseline gap-2 text-h300 font-semibold text-gray-100">
            {course.name}
            <a
              href="#"
              className="text-body-md font-normal text-gray-80 underline [text-underline-position:from-font]"
            >
              (edit)
            </a>
          </h2>
          <p className="text-body-md text-gray-80">Course Placeholder</p>
        </div>
      </div>

      <div className="flex w-full flex-col rounded-md bg-card shadow-sm">
        {/* Which term is holding it, and what can be done to it there. */}
        <div className="flex w-full items-center gap-2 rounded-t-md bg-primary-0 px-6 py-3">
          <span className="text-body-md font-semibold text-foreground">{term.name}</span>
          <Badge variant="warning">{CREDIT_GROUP_LABEL[creditGroup(term)]}</Badge>
          <span className="ml-auto flex items-center gap-1">
            <Button size="sm">Actions</Button>
            <Icon name="unfold-more" size={16} className="text-gray-80" />
          </span>
        </div>

        <div className="flex w-full flex-col gap-4 p-6">
          <Section label="Requirement">
            <p className="text-body-md text-gray-80">
              Satisfies "{course.name}" in{" "}
              <a href="#" className="underline [text-underline-position:from-font]">
                BSc in {DEGREE.program.replace(", B.S.", "")}
              </a>
            </p>
          </Section>

          <Section label="Note">
            <a
              href="#"
              className="w-fit text-body-md text-gray-80 underline [text-underline-position:from-font]"
            >
              + Add note
            </a>
          </Section>

          <Section label="Credits placeholder">
            <Input defaultValue={String(course.credits)} className="text-body-md" />
          </Section>
        </div>
      </div>

      <Button variant="primary" className="w-full" onClick={() => setSearching(true)}>
        <Icon name="s-search" size={16} />
        Find eligible courses
      </Button>
    </aside>
  )
}
