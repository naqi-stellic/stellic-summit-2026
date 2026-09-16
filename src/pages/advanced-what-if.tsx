import { useState } from "react"

import { AppShell } from "@/components/layout/app-shell"
import { AuditTree, UnmatchedSection } from "@/components/stellic/audit-tree"
import { DiscoverPanel } from "@/components/stellic/discover-panel"
import { DiscoverPrograms } from "@/components/stellic/discover-programs"
import {
  AuditControls,
  NetworkRow,
  ProfileCard,
  TermStrip,
} from "@/components/stellic/student-profile"
import {
  auditProgram,
  countedBy,
  markDoubleCounting,
  type Program,
} from "@/data/programs"
import {
  AUDIT,
  AUDIT_STUDENT,
  AUDIT_SCOPES,
  AUDIT_TABS,
  AUDIT_VIEWS,
  LAST_COMPUTED,
  UNMATCHED,
} from "@/data/audit"

/* Advanced What-If — the first screen: a student's progress against the degree
 * they are on. Nothing is hypothetical yet. This is the audit as it stands, and
 * it is here first because a what-if is only legible against it: every question
 * the prototype goes on to ask is "what would this tree look like instead".
 *
 * The page is a column of cards on grey rather than the planner's two resizable
 * panes — there is no second thing to look at, and the audit wants the width. */

export function AdvancedWhatIf() {
  const [tab, setTab] = useState("progress")
  const [view, setView] = useState("planned")
  /* The what-if opens beside the audit rather than over it: the question is
     "what would this tree look like instead", so the tree has to stay in
     sight while it is being asked. */
  const [discovering, setDiscovering] = useState(false)
  /* What the what-if did to the record. `add` puts a second program under the
     degree; `change` puts one in place of it. Nothing is saved anywhere — this
     is the prototype's whole memory of the run. */
  const [applied, setApplied] = useState<{ program: Program; mode: "add" | "change" } | null>(null)

  const second = applied?.mode === "add" ? auditProgram(applied.program, true) : null
  const primary =
    applied?.mode === "change"
      ? auditProgram(applied.program, false)
      : /* Double counting is a fact about a course rather than about one tree,
           so the degree's own copies say so too. */
        second
        ? markDoubleCounting(AUDIT, countedBy(applied!.program))
        : AUDIT

  /* The profile says what the student is on, so it has to say this as well. */
  const programs =
    applied?.mode === "change"
      ? [`${applied.program.name}`]
      : applied
        ? [AUDIT_STUDENT.program, `${applied.program.name} (${applied.program.kind})`]
        : [AUDIT_STUDENT.program]

  return (
    <AppShell
      title="Student Progress"
      section="progress"
      assistant={false}
      panel={
        discovering ? (
          <DiscoverPanel
            onApply={(program, mode) => setApplied({ program, mode })}
            onClose={() => setDiscovering(false)}
          />
        ) : undefined
      }
    >
      {/* The pane scrolls, not the shell. `@container` so the cards reflow
          against the width they actually have rather than the window's. */}
      <main className="@container min-w-0 flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto flex w-full max-w-[1518px] flex-col gap-4">
          <ProfileCard programs={programs} />
          <NetworkRow />
          <TermStrip />

          <AuditControls
            tabs={AUDIT_TABS}
            active={tab}
            onSelectTab={setTab}
            views={AUDIT_VIEWS}
            view={view}
            onSelectView={setView}
            scopes={AUDIT_SCOPES}
            scope={AUDIT_SCOPES[0]}
            lastComputed={LAST_COMPUTED}
          />

          {/* Only Progress has a design; the other four tabs are named and
              nothing more, which is what the frame shows of them. */}
          {tab === "progress" ? (
            <section /* 40 between the tree, the unmatched list and the banner: three
                     separate things in one card, and at 24 they read as one
                     list that changes its mind twice. */
                  className="flex flex-col gap-10 overflow-x-auto rounded-md bg-card p-6 shadow-card">
              <AuditTree audit={primary} />
              {/* A second program sits under the degree and above the courses
                  nothing has claimed, which is where it would fall on the
                  record: another thing the transcript is being read against. */}
              {second && <AuditTree audit={second} />}
              <UnmatchedSection
                count={UNMATCHED.count}
                blurb={UNMATCHED.blurb}
                courses={UNMATCHED.courses}
              />
              {/* The foot of the audit, and the way into the what-if. It
                  stands on the card's own padding, as the tree and the
                  unmatched list do — one edge down each side, whatever is
                  against it. */}
              <DiscoverPrograms onOpen={() => setDiscovering(true)} />
            </section>
          ) : (
            <section className="rounded-md bg-card p-6 text-body-md text-gray-80 shadow-card">
              Nothing is designed behind this tab yet.
            </section>
          )}
        </div>
      </main>
    </AppShell>
  )
}
