import { useState } from "react"

import { Icon } from "@/components/icon"
import { Checkbox } from "@/components/ui/checkbox"
import { termCredits, type Term, type Year } from "@/data/plan"

/* Shown when the answer to "keep everything already planned?" is no: the terms
 * still ahead of you, everything ticked, so what you actually do here is untick
 * the few the generator may move. Terms under way and terms already finished
 * are not on offer — nothing can be done about them either way. */

/** Terms the generator could rearrange: ahead of you, and holding something. */
export function releasableTerms(years: Year[]): Term[] {
  const terms: Term[] = []
  for (const year of years) {
    for (const term of year.terms) {
      if (!term.locked && term.courses.length > 0) terms.push(term)
    }
  }
  return terms
}

function TermRow({
  term,
  released,
  expanded,
  onToggleTerm,
  onToggleExpand,
  onToggleCourse,
}: {
  term: Term
  released: string[]
  expanded: boolean
  onToggleTerm: (keep: boolean) => void
  onToggleExpand: () => void
  onToggleCourse: (courseId: string, keep: boolean) => void
}) {
  const kept = term.courses.filter((c) => !released.includes(c.id))
  const state = kept.length === 0 ? false : kept.length === term.courses.length ? true : "indeterminate"
  const credits = termCredits(term)

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full items-center gap-2 py-1.5">
        <label className="flex cursor-pointer items-center gap-2">
          <Checkbox
            checked={state}
            onCheckedChange={(next) => onToggleTerm(next === true)}
            aria-label={`Keep everything in ${term.name}`}
          />
          <span className="text-body-md font-semibold text-gray-100">{term.name}</span>
        </label>
        <button
          type="button"
          onClick={onToggleExpand}
          aria-expanded={expanded}
          aria-label={`${expanded ? "Hide" : "Show"} the courses in ${term.name}`}
          className="flex cursor-pointer items-center text-gray-100"
        >
          <Icon name={expanded ? "expand-less" : "expand-more"} size={16} />
        </button>
        <span className="min-w-0 flex-1 text-right text-body-md text-gray-80">
          {term.courses.length} course{term.courses.length === 1 ? "" : "s"} · {credits} credits
        </span>
      </div>

      {expanded &&
        term.courses.map((course) => (
          <label
            key={course.id}
            className="flex w-full cursor-pointer items-center gap-2 rounded-md border border-gray-40 bg-card p-[7px]"
          >
            <Checkbox
              checked={!released.includes(course.id)}
              onCheckedChange={(next) => onToggleCourse(course.id, next === true)}
              aria-label={`Keep ${course.name}`}
            />
            <span className="flex min-w-0 flex-1 flex-col justify-center gap-2">
              <span>
                <span className="block text-body-md text-gray-80">{course.code}</span>
                <span className="block text-body-md font-semibold text-foreground">
                  {course.name}
                </span>
              </span>
              {course.section && (
                <span className="flex items-center gap-1 text-body-md text-foreground">
                  <Icon name="calendar-today" size={14} />
                  {course.section}
                </span>
              )}
            </span>
          </label>
        ))}
    </div>
  )
}

export function KeepPicker({
  terms,
  released,
  onChange,
}: {
  terms: Term[]
  /** Courses the student has unticked. Empty means everything stays. */
  released: string[]
  onChange: (next: string[]) => void
}) {
  /* Collapsed to begin with: the list is there to be scanned, and opened only
   * where something needs changing. */
  const [open, setOpen] = useState<string[]>([])

  if (terms.length === 0) {
    return (
      <p className="w-full text-body-md text-gray-80">
        Nothing is planned ahead yet, so there is nothing to choose between.
      </p>
    )
  }

  const set = (ids: string[], keep: boolean) =>
    onChange(keep ? released.filter((id) => !ids.includes(id)) : [...new Set([...released, ...ids])])

  return (
    <div className="flex w-full flex-col gap-2">
      {terms.map((term) => (
        <TermRow
          key={term.id}
          term={term}
          released={released}
          expanded={open.includes(term.id)}
          onToggleTerm={(keep) => set(term.courses.map((c) => c.id), keep)}
          onToggleExpand={() =>
            setOpen((current) =>
              current.includes(term.id)
                ? current.filter((id) => id !== term.id)
                : [...current, term.id]
            )
          }
          onToggleCourse={(courseId, keep) => set([courseId], keep)}
        />
      ))}
    </div>
  )
}
