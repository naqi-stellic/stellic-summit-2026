import { useState } from "react"

import { AppShell } from "@/components/layout/app-shell"
import { AuditTree, UnmatchedSection } from "@/components/stellic/audit-tree"
import { ComplianceTree } from "@/components/stellic/compliance-tree"
import { cameFrom } from "@/components/stellic/plan-header"
import { ExplainPanel } from "@/components/stellic/explain-panel"
import {
  AuditControls,
  NetworkRow,
  ProfileCard,
  TermStrip,
} from "@/components/stellic/student-profile"
import {
  AUDIT,
  AUDIT_STUDENT,
  AUDIT_VIEWS,
  UNMATCHED_BLURB,
  unmatchedAgainst,
} from "@/data/audit"
import {
  AID,
  COMPLIANCE_TABS,
  EXPLAIN,
  LAST_COMPUTED,
  PLANNED_AID,
  PLANNED_RULESET,
  RULESET,
  mappingsForCheck,
} from "@/data/compliance"

/* Proactive Compliance — the same student record read against an eligibility
 * ruleset instead of against their degree.
 *
 * It is a staff screen, which is the first thing the page says: the nav is the
 * institution's list of everything rather than one student's path through a
 * degree. The rest is the Progress screen exactly — same profile, same cards,
 * same tab strip with one more tab on it — because it is the same page, and
 * the tab is the only thing that changed.
 *
 * Both tabs are live, and that is the argument. Progress shows a degree in
 * good order: ten courses taken, five under way, nothing overdue. Compliance
 * reads the same transcript against two clocks it knows nothing about, and
 * finds a problem under each of them. Nobody standing on the first tab would
 * have any reason to open the second, which is exactly why the second has to
 * exist. */

export function Compliance() {
  /* Straight to the URL, and Compliance is what was asked for. Through a name
     on the Students roster, and it is a record being opened — which opens
     where every other record does. */
  const [tab, setTab] = useState(cameFrom() === "students" ? "progress" : "compliance")
  const [view, setView] = useState("official")
  /* Which check is being explained, beside it rather than over it: the answer
     only means anything against the row it is about. Held as the row's id
     rather than as a flag, because seven of them have working to show and the
     panel has to know which one it was asked about. */
  const [explaining, setExplaining] = useState<string | null>(null)

  const planned = view === "planned"
  const unmatched = unmatchedAgainst([AUDIT])
  const explained = explaining ? EXPLAIN[explaining] : undefined

  return (
    <AppShell
      section="staff"
      /* The assistant is offered, but there is nothing here to generate — a
         compliance screen is read, not drafted — so it keeps its own button
         and the pill beside it stays away. */
      assistLabel={null}
      panel={
        explained ? (
          <ExplainPanel
            title={explained.title}
            lede={explained.lede}
            constraints={explained.constraints}
            mappings={mappingsForCheck(explaining!)}
            onClose={() => setExplaining(null)}
          />
        ) : undefined
      }
    >
      <main className="@container min-w-0 flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto flex w-full max-w-[1518px] flex-col gap-4">
          {/* A staff member is looking at a student's record, so the record
              says what a staff member can do with it. */}
          <ProfileCard
            programs={[AUDIT_STUDENT.program]}
            progressLabel="Planned Progress"
            actions={["Request to Review Plan", "Mark Changes as Reviewed", "Actions"]}
          />
          <NetworkRow />
          <TermStrip />

          <AuditControls
            tabs={COMPLIANCE_TABS}
            active={tab}
            live={["progress", "plans", "compliance"]}
            onSelectTab={(id) => {
              /* Plans is a different surface, not a different tab: it is the
                 planner, and it knows how to come back here. */
              if (id === "plans") window.location.href = "/planner.html?from=compliance"
              else setTab(id)
            }}
            views={AUDIT_VIEWS}
            view={view}
            onSelectView={setView}
            lastComputed={LAST_COMPUTED}
          />

          {tab === "progress" ? (
            <section className="flex flex-col gap-10 overflow-x-auto rounded-md bg-card p-6 shadow-card">
              <AuditTree audit={AUDIT} />
              <UnmatchedSection
                count={unmatched.length}
                blurb={UNMATCHED_BLURB}
                courses={unmatched}
              />
            </section>
          ) : (
            <section className="flex flex-col gap-10 overflow-x-auto rounded-md bg-card p-6 shadow-card">
              <ComplianceTree
                ruleset={planned ? PLANNED_RULESET : RULESET}
                onExplain={setExplaining}
              />
              {/* A second ruleset, under the first rather than instead of it:
                  two clocks on one transcript, and neither can see the other.
                  Its checks explain themselves the same way — an aid standard
                  is coded out of the same constraints a degree is, which is
                  the argument for it being on this screen at all. */}
              <ComplianceTree
                ruleset={planned ? PLANNED_AID : AID}
                onExplain={setExplaining}
              />
            </section>
          )}
        </div>
      </main>
    </AppShell>
  )
}
