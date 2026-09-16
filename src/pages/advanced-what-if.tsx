import { useState } from "react"

import { AppShell } from "@/components/layout/app-shell"
import { AuditTree, UnmatchedSection } from "@/components/stellic/audit-tree"
import { DiscoverPrograms } from "@/components/stellic/discover-programs"
import {
  AuditControls,
  NetworkRow,
  ProfileCard,
  TermStrip,
} from "@/components/stellic/student-profile"
import {
  AUDIT,
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

  return (
    <AppShell title="Student Progress" section="progress" assistant={false}>
      {/* The pane scrolls, not the shell. `@container` so the cards reflow
          against the width they actually have rather than the window's. */}
      <main className="@container min-w-0 flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto flex w-full max-w-[1518px] flex-col gap-4">
          <ProfileCard />
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
            <section className="flex flex-col gap-6 overflow-x-auto rounded-md bg-card px-6 py-6 shadow-card">
              <AuditTree audit={AUDIT} />
              <UnmatchedSection
                count={UNMATCHED.count}
                blurb={UNMATCHED.blurb}
                courses={UNMATCHED.courses}
              />
              {/* The foot of the audit, and the way into the what-if. It
                  stands on the card's own padding, as the tree and the
                  unmatched list do — one edge down each side, whatever is
                  against it. */}
              <DiscoverPrograms />
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
