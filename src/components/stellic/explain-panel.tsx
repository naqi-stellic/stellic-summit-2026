import { cn } from "cn"
import { useState } from "react"

import { Icon } from "@/components/icon"
import { AuditMarkIcon } from "@/components/stellic/audit-tree"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { AuditGroup } from "@/data/audit"
import {
  constraintStatus,
  constraintsFor,
  courseMappings,
  explainStanding,
  type Constraint,
  type ConstraintStatus,
  type MappingVerdict,
} from "@/data/explain"

/* Why this requirement stands where it does.
 *
 * The audit is a verdict; this is the working. It opens beside the tree rather
 * than over it, because the answer only means anything against the row it is
 * about — and it is the plan generator's panel, at the plan generator's width,
 * for the same reason every other panel here is. */

const STATUS: Record<ConstraintStatus, { icon: "check-circle" | "error-outline"; tone: string }> = {
  /* Nothing to satisfy: a rule about what may count, not a bar to clear. */
  rule: { icon: "check-circle", tone: "text-gray-60" },
  ok: { icon: "check-circle", tone: "text-success-50" },
  unmet: { icon: "error-outline", tone: "text-alert-100" },
}

function CodeChips({ codes, shown = 4 }: { codes: string[]; shown?: number }) {
  const rest = codes.length - shown

  return (
    <div className="flex flex-wrap items-center gap-1">
      {codes.slice(0, shown).map((code) => (
        <Badge key={code} variant="outline" className="font-normal text-gray-80">
          {code}
        </Badge>
      ))}
      {rest > 0 && <span className="text-body-md text-gray-80">+ {rest} more</span>}
    </div>
  )
}

function ConstraintRow({ constraint, last }: { constraint: Constraint; last: boolean }) {
  const status = constraintStatus(constraint)
  const { icon, tone } = STATUS[status]
  const count = constraint.progress ?? constraint.limit

  return (
    <div
      className={cn(
        "flex flex-col gap-2 pb-2",
        !last && "border-b border-gray-5"
      )}
    >
      <div className="flex items-start gap-2">
        <Icon name={icon} size={16} className={cn("mt-0.5 shrink-0", tone)} />
        <p className="min-w-0 flex-1 text-body-md text-foreground">{constraint.text}</p>
        {count && (
          <span className="shrink-0 rounded-md bg-gray-5 px-2 py-0.5 text-label-md text-foreground">
            {"met" in count ? count.met : count.used}/
            {"total" in count ? count.total : count.cap}
          </span>
        )}
      </div>
      {constraint.notes?.map((note, i) => (
        <div key={i} className="flex flex-col gap-1 pl-6">
          {note.text && (
            <p className="text-body-md text-foreground">
              {note.text}
              {note.truncated && (
                <>
                  {"\u2026 "}
                  <a
                    href="#"
                    className="text-gray-80 underline [text-underline-position:from-font]"
                  >
                    Show more
                  </a>
                </>
              )}
            </p>
          )}
          {note.codes && <CodeChips codes={note.codes} />}
        </div>
      ))}
    </div>
  )
}

const VERDICT: Record<MappingVerdict, string> = {
  counting: "bg-success-5 text-success-100",
  "not counting": "bg-alert-5 text-alert-100",
  "not considered": "bg-gray-5 text-foreground",
}

export function ExplainPanel({ group, onClose }: { group: AuditGroup; onClose: () => void }) {
  const [mappings, setMappings] = useState(false)
  const [find, setFind] = useState("")

  const constraints = constraintsFor(group)
  const standing = explainStanding(group)
  const all = courseMappings(group)
  const shown = find
    ? all.filter((mapping) =>
        `${mapping.course.code} ${mapping.course.name}`.toLowerCase().includes(find.toLowerCase())
      )
    : all

  return (
    <aside className="@container flex h-full w-full flex-col overflow-x-clip overflow-y-auto bg-card">
      <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-2 border-b border-gray-40 bg-card px-6 py-3">
        <h2 className="text-caption-lg font-semibold text-foreground">Explain Progress</h2>
        <Button variant="ghost" size="icon" aria-label="Close Explain Progress" onClick={onClose}>
          <Icon name="s-close" size={16} />
        </Button>
      </header>

      <div className="flex flex-1 flex-col gap-8 p-6 pb-28">
        <div className="flex flex-col gap-2">
          <h3 className="text-h300 font-semibold text-foreground">{group.name}</h3>
          {/* The standing in one sentence, before any of the rules. Whatever
              else the panel says, this is the thing that was asked. */}
          <p className="text-body-md text-gray-80">
            You've earned{" "}
            <span className="font-semibold text-foreground">
              {standing.earned} of the {standing.needed} credits
            </span>{" "}
            this requirement needs. {standing.toGo} to go
          </p>
        </div>

        <section className="flex flex-col gap-2">
          <p className="pb-2 text-body-md font-semibold text-foreground">Constraints</p>
          {constraints.map((constraint, i) => (
            <ConstraintRow
              key={constraint.id}
              constraint={constraint}
              last={i === constraints.length - 1}
            />
          ))}
        </section>

        <section className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setMappings(!mappings)}
            aria-expanded={mappings}
            className="flex cursor-pointer items-center gap-2 pb-2 text-left"
          >
            <span className="text-body-md font-semibold text-foreground">Course mappings</span>
            <Icon
              name="chevron-right"
              size={14}
              className={cn("transition-transform", mappings && "rotate-90")}
            />
          </button>

          {mappings && (
            <div className="flex flex-col gap-4">
              <label className="flex h-9 items-center gap-2 rounded-md border border-input bg-card px-[11px]">
                <Icon name="s-search" size={16} className="shrink-0 text-gray-80" />
                <input
                  type="search"
                  value={find}
                  onChange={(event) => setFind(event.target.value)}
                  placeholder="Find a course"
                  className="min-w-0 flex-1 bg-transparent text-body-md text-foreground placeholder:text-gray-80 focus:outline-none"
                />
              </label>

              <div className="flex flex-col gap-3.5">
                {shown.map((mapping) => (
                  <div key={mapping.course.id} className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <AuditMarkIcon mark={mapping.course.mark} size={16} />
                      <span className="w-[72px] shrink-0 text-body-md font-semibold">
                        {mapping.course.code}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-body-md">
                        {mapping.course.name}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded-md px-2 py-0.5 text-label-md whitespace-nowrap",
                          VERDICT[mapping.verdict]
                        )}
                      >
                        {mapping.verdict[0].toUpperCase() + mapping.verdict.slice(1)}
                      </span>
                    </div>
                    {/* Only a refusal owes an explanation. "Not considered" is
                        not one — the requirement was never offered the course. */}
                    {mapping.reason && (
                      <p className="pl-6 text-label-md text-gray-80">{mapping.reason}</p>
                    )}
                  </div>
                ))}
                {shown.length === 0 && (
                  <p className="text-body-md text-gray-80">Nothing on the record matches that.</p>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </aside>
  )
}

/* ============================================================ ConstraintsCard
   The same rules, opened where the requirement is rather than beside it. It is
   the catalogue's own wording, so it reads as a list rather than as a verdict:
   no marks, no fractions — those belong to the panel, which is measuring the
   student against them. */

export function ConstraintsCard({
  group,
  onExplain,
}: {
  group: AuditGroup
  onExplain?: (group: AuditGroup) => void
}) {
  const constraints = constraintsFor(group)

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1 rounded-md border border-gray-40 bg-card p-[15px]">
      <div className="flex items-center justify-between gap-2 pb-2">
        <p className="text-body-md font-semibold text-foreground">Constraints</p>
        {/* The rules are printed here; the panel is where they are measured
            against the student. Offering it from the card means you do not
            have to go back to the row to ask. */}
        <div className="flex shrink-0 items-center gap-2">
          {onExplain && (
            <button
              type="button"
              onClick={() => onExplain(group)}
              className="cursor-pointer rounded-md border border-gray-40 bg-card px-[7px] py-px text-label-md text-foreground transition-colors hover:bg-gray-5"
            >
              explain
            </button>
          )}
          <Button size="icon" aria-label="Search constraints" className="size-5">
            <Icon name="s-search" size={14} />
          </Button>
        </div>
      </div>
      <ul className="flex list-disc flex-col gap-1 pl-5 text-body-md text-gray-80">
        {constraints.map((constraint) => (
          <li key={constraint.id}>
            {constraint.text}
            {constraint.notes && (
              <ul className="mt-1 flex list-disc flex-col gap-1 pl-5">
                {constraint.notes.map((note, i) => (
                  <li key={i} className={cn(!note.text && "list-none")}>
                    {note.text}
                    {note.truncated && (
                      <>
                        {"\u2026 "}
                        <a
                          href="#"
                          className="underline [text-underline-position:from-font]"
                        >
                          Show more
                        </a>
                      </>
                    )}
                    {note.codes && (
                      <div className="mt-1">
                        <CodeChips codes={note.codes} shown={6} />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
