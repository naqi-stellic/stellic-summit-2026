import { useState } from "react"

import { AppShell } from "@/components/layout/app-shell"
import { ComplianceTree } from "@/components/stellic/compliance-tree"
import {
  AuditControls,
  NetworkRow,
  ProfileCard,
  TermStrip,
} from "@/components/stellic/student-profile"
import { AUDIT_STUDENT, AUDIT_VIEWS } from "@/data/audit"
import { COMPLIANCE_TABS, LAST_COMPUTED, RULESET, SHORTFALL } from "@/data/compliance"

/* Proactive Compliance — the same student record read against an eligibility
 * ruleset instead of against their degree.
 *
 * It is a staff screen, which is the first thing the page says: the nav is the
 * institution's list of everything rather than one student's path through a
 * degree. The rest is the Progress screen exactly — same profile, same cards,
 * same tab strip with one more tab on it — because it is the same page, and
 * the tab is the only thing that changed.
 *
 * Why it deserves a screen: the degree audit next door looks healthy. Ten
 * courses taken, five under way, nothing overdue. It is only when the same
 * transcript is read against the ruleset's clock that the problem appears —
 * six credits short of what the third year wants, and no way to see that from
 * the requirements. */

export function Compliance() {
  const [tab, setTab] = useState("compliance")
  const [view, setView] = useState("official")

  return (
    <AppShell title="Student Progress" section="staff" assistant={false}>
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
            onSelectTab={setTab}
            views={AUDIT_VIEWS}
            view={view}
            onSelectView={setView}
            lastComputed={LAST_COMPUTED}
          />

          {tab === "compliance" ? (
            <section className="flex flex-col gap-10 overflow-x-auto rounded-md bg-card p-6 shadow-card">
              <ComplianceTree ruleset={RULESET} />
              {/* The one thing on the page worth acting on, said once, where
                  the eye lands after the tree rather than before it. */}
              <p className="text-body-md text-gray-80">
                {SHORTFALL} credits short of what the third year asks for. Nothing on Progress
                would say so — the degree is on track.
              </p>
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
