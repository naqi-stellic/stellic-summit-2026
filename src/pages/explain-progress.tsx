import { useState } from "react"

import { AppShell } from "@/components/layout/app-shell"
import { AuditTree, UnmatchedSection } from "@/components/stellic/audit-tree"
import { ConstraintsCard, ExplainPanel } from "@/components/stellic/explain-panel"
import { GpaPanel } from "@/components/stellic/gpa-panel"
import {
  EXPLAIN_AUDIT,
  EXPLAIN_CGPA,
  EXPLAIN_VIEWS,
  EXPLAIN_RECORD,
  GENERAL_EDUCATION_GPA,
} from "@/data/explain-audit"
import { computesGpa, constraintsFor } from "@/data/explain"
import type { Gpa } from "@/data/gpa"
import {
  AuditControls,
  NetworkRow,
  ProfileCard,
  TermStrip,
} from "@/components/stellic/student-profile"
import {
  AUDIT_SCOPES,
  AUDIT_STUDENT,
  AUDIT_TABS,
  LAST_COMPUTED,
  UNMATCHED_BLURB,
  auditStanding,
  milestoneStanding,
  programUnder,
  unmatchedAgainst,
  type AuditGroup,
} from "@/data/audit"

/* Explain Progress — the audit with its working shown.
 *
 * It is the Progress screen, unchanged: same profile, same cards, same tree,
 * the same components the what-if reads. What is added is one question the
 * audit could not answer before — why does this row say what it says — asked
 * two ways.
 *
 * Point at a requirement and it offers **rules**, which open underneath it in
 * the catalogue's own words, and **explain**, which opens the panel beside the
 * tree and measures the student against them: every constraint marked, and
 * every course on the record told whether it is counting, not counting and on
 * which rule, or was never considered at all.
 *
 * Both hold their space until the row is pointed at, so nothing on the page
 * moves as the pointer travels down it. */

/** Which average a row carries. The programme states its own — every
 *  programme has one — and a requirement carries one only where a constraint
 *  asked for it to be computed. One function, so the badge on the row and the
 *  sum in the panel cannot come from two different places. */
const gpaOn = (group: AuditGroup): Gpa | undefined =>
  group.level === "program" ? group.pgpa : computesGpa(group) ? GENERAL_EDUCATION_GPA : undefined

export function ExplainProgress() {
  const [view, setView] = useState("official")
  /* What is open beside the tree. Two panels answer two different questions
     about the same row — why it says what it says, and how its average was
     arrived at — so only one is open at a time and the row says which. */
  const [beside, setBeside] = useState<{ kind: "explain" | "gpa"; group: AuditGroup } | null>(null)
  const explaining = beside?.kind === "explain" ? beside.group : null
  /* The row and the average it named, since the panel has to show the sum the
     badge was a rounding of and not some other one. */
  const calculating =
    beside?.kind === "gpa" ? { name: beside.group.name, gpa: gpaOn(beside.group) } : null

  const unmatched = unmatchedAgainst([EXPLAIN_AUDIT])

  return (
    <AppShell
      section="progress"
      /* The assistant's pill scopes itself to whatever is being explained,
         which is the one thing it can usefully know here. */
      assistLabel="Ask about this requirement"
      panel={
        explaining ? (
          <ExplainPanel
            group={explaining}
            record={EXPLAIN_RECORD}
            onClose={() => setBeside(null)}
          />
        ) : calculating?.gpa ? (
          <GpaPanel
            title={calculating.name}
            gpa={calculating.gpa}
            onClose={() => setBeside(null)}
          />
        ) : undefined
      }
    >
      <main className="@container min-w-0 flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto flex w-full max-w-[1518px] flex-col gap-4">
          {/* Read off the tree this page draws rather than the shared one.
              The bar and the requirement under it are the same audit, and this
              prototype's General Education holds six courses where the others
              hold five — a header that went on reporting the others would be
              contradicting the rows directly beneath it. */}
          <ProfileCard
            programs={[AUDIT_STUDENT.program]}
            progress={{
              courses: auditStanding(EXPLAIN_AUDIT),
              milestones: milestoneStanding(EXPLAIN_AUDIT),
            }}
          />
          {/* Its own transcript, and its own cumulative average off it. */}
          <NetworkRow cgpa={EXPLAIN_CGPA.value} />
          <TermStrip />

          <AuditControls
            tabs={AUDIT_TABS}
            active="progress"
            live={["progress"]}
            views={EXPLAIN_VIEWS}
            view={view}
            onSelectView={setView}
            scopes={AUDIT_SCOPES}
            scope={AUDIT_SCOPES[0]}
            lastComputed={LAST_COMPUTED}
          />

          <section className="flex flex-col gap-10 overflow-x-auto rounded-md bg-card p-6 shadow-card">
            <AuditTree
              audit={EXPLAIN_AUDIT}
              explain={{
                /* The credential row explains the programme under it rather
                   than itself: the rules are the programme's, and somebody
                   aiming for one row and hitting the other should still get
                   the answer they came for. */
                onExplain: (group) => setBeside({ kind: "explain", group: programUnder(group) }),
                constraints: (group) => (
                  <ConstraintsCard
                    group={group}
                    onExplain={() => setBeside({ kind: "explain", group })}
                  />
                ),
                count: (group) => constraintsFor(group).length,
                /* A requirement wears an average only where it was asked to
                   compute one — the constraint is what puts the badge there,
                   so the badge is read off the constraint. The programme
                   publishes its own, and both open the same panel. */
                gpa: gpaOn,
                onGpa: (group) => setBeside({ kind: "gpa", group }),
              }}
            />
            <UnmatchedSection
              count={unmatched.length}
              blurb={UNMATCHED_BLURB}
              courses={unmatched}
            />
          </section>
        </div>
      </main>
    </AppShell>
  )
}
