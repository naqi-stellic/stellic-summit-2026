import { AppShell } from "@/components/layout/app-shell"
import { Roster, SavedReports, SearchPanel } from "@/components/stellic/student-search"
import { AUDIT_STUDENT } from "@/data/audit"

/* Students — the screen before every other staff screen.
 *
 * Proactive Compliance, Explain Progress and the rest all open on one student
 * already chosen. This is where they are chosen from, and it is the one screen
 * that says what the product is actually for: eighteen hundred people, narrowed
 * by whatever question is being asked this morning.
 *
 * Built from a screenshot of the product rather than a frame, so what is drawn
 * is what exists — including the twenty filters, which are named and do not
 * open. How many ways in there are is the information; what is behind any one
 * of them is a different screen. */

export function Students() {
  return (
    <AppShell section="staff" navCurrent="Students" title="Students" assistant={false}>
      <main className="@container min-w-0 flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
          <SearchPanel />
          <SavedReports />
          {/* A name is a way through to the record. Scott's is the one this
              prototype has a record for; the rest are the cohort he is in. */}
          <Roster
            onOpen={(student) => {
              if (student.username === AUDIT_STUDENT.username) {
                window.location.href = "/compliance.html"
              }
            }}
          />
        </div>
      </main>
    </AppShell>
  )
}
