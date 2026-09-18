import { cn } from "cn"
import { useEffect, useRef, useState } from "react"

import { AppShell } from "@/components/layout/app-shell"
import { AuditTree, UnmatchedSection } from "@/components/stellic/audit-tree"
import { DiscoverPanel } from "@/components/stellic/discover-panel"
import { DiscoverPrograms } from "@/components/stellic/discover-programs"
import { Spinner } from "@/components/ui/spinner"
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
  auditStanding,
  milestoneStanding,
  UNMATCHED_BLURB,
  unmatchedAgainst,
} from "@/data/audit"

/* Advanced What-If — the first screen: a student's progress against the degree
 * they are on. Nothing is hypothetical yet. This is the audit as it stands, and
 * it is here first because a what-if is only legible against it: every question
 * the prototype goes on to ask is "what would this tree look like instead".
 *
 * The page is a column of cards on grey rather than the planner's two resizable
 * panes — there is no second thing to look at, and the audit wants the width. */

export function AdvancedWhatIf() {
  const [view, setView] = useState("planned")
  /* The what-if opens beside the audit rather than over it: the question is
     "what would this tree look like instead", so the tree has to stay in
     sight while it is being asked. */
  const [discovering, setDiscovering] = useState(false)
  /* What the what-if did to the record. `add` puts a second program under the
     degree; `change` puts one in place of it. Nothing is saved anywhere — this
     is the prototype's whole memory of the run. */
  const [applied, setApplied] = useState<{ program: Program; mode: "add" | "change" } | null>(null)
  /* The beat between asking and being answered. Nothing is computed — the tree
     is a pure function of the record and the program, and it is ready before
     the click finishes — but an audit that changes the instant you choose does
     not read as having been recomputed against anything. It is on the audit
     card alone: the profile, the terms and the controls above it did not
     change, and greying them out would say they had. */
  const [recomputing, setRecomputing] = useState(false)
  const beat = useRef<number | undefined>(undefined)
  /* Where to look when the audit comes back. Changing a major rewrites the
     tree at the top; adding a programme hangs a second one underneath, forty
     rows down, and an answer you have to go looking for does not read as an
     answer. */
  const auditRef = useRef<HTMLElement>(null)
  const addedRef = useRef<HTMLDivElement>(null)
  /* Held on the thing that changed for a moment after it arrives. A scroll on
     a page of trees that look alike can be missed entirely; a ring that fades
     says which one of them is the answer. */
  const [landed, setLanded] = useState(false)

  useEffect(() => () => window.clearTimeout(beat.current), [])

  /* The anchor. An effect rather than a callback on the timer, because the
     tree has to be in the document before anything can scroll to it — React
     has committed by the time this runs, and a `requestAnimationFrame` inside
     the timeout had not. */
  useEffect(() => {
    if (recomputing || !applied) return

    /* Changing a major rewrites the tree at the top of the card; adding a
       programme hangs a second one underneath, forty rows down. Either way,
       land on the one that changed rather than on the card that holds it. */
    const landing = applied.mode === "add" ? addedRef.current : auditRef.current
    landing?.scrollIntoView({ behavior: "smooth", block: "start" })

    setLanded(true)
    const fade = window.setTimeout(() => setLanded(false), 1600)
    return () => window.clearTimeout(fade)
  }, [recomputing, applied])

  const second = applied?.mode === "add" ? auditProgram(applied.program, true) : null
  const primary =
    applied?.mode === "change"
      ? auditProgram(applied.program, false)
      : /* Double counting is a fact about a course rather than about one tree,
           so the degree's own copies say so too. */
        second
        ? markDoubleCounting(AUDIT, countedBy(applied!.program))
        : AUDIT

  /* Asked again of whatever is on screen: a program that takes up a course
     the degree ignored has matched it, and one that drops a course the degree
     wanted has unmatched it. */
  const trees = second ? [primary, second] : [primary]
  const unmatched = unmatchedAgainst(trees)

  /* And the bars at the top are read off the same trees. They had been the
     record's own standing, fixed — so switching a major left the header
     saying ten taken of forty while the tree underneath it said two of forty,
     and adding a minor added six requirements the bar never heard about. A
     what-if that does not reach the top of the page is only half a what-if. */
  const progress = {
    courses: trees
      .map(auditStanding)
      .reduce((all, one) => ({
        taken: all.taken + one.taken,
        inProgress: all.inProgress + one.inProgress,
        remaining: all.remaining + one.remaining,
        claimed: all.claimed + one.claimed,
      })),
    milestones: trees
      .map(milestoneStanding)
      .reduce((all, one) => ({ done: all.done + one.done, total: all.total + one.total })),
  }

  /* The profile says what the student is on, so it has to say this as well. */
  const programs =
    applied?.mode === "change"
      ? [`${applied.program.name}`]
      : applied
        ? [AUDIT_STUDENT.program, `${applied.program.name} (${applied.program.kind})`]
        : [AUDIT_STUDENT.program]

  return (
    <AppShell
      section="progress"
      /* Nothing to generate from here — the what-if is asked in the panel, not
         drafted by the assistant — so the pill stays away and the button
         does not. */
      assistLabel={null}
      panel={
        discovering ? (
          <DiscoverPanel
            onApply={(program, mode) => {
              /* The panel goes as the answer arrives — it asked its question
                 and the audit is where the answer is. */
              setDiscovering(false)
              setRecomputing(true)
              setApplied({ program, mode })
              window.clearTimeout(beat.current)
              beat.current = window.setTimeout(() => setRecomputing(false), 900)
            }}
            onClose={() => setDiscovering(false)}
          />
        ) : undefined
      }
    >
      {/* The pane scrolls, not the shell. `@container` so the cards reflow
          against the width they actually have rather than the window's. */}
      <main className="@container min-w-0 flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto flex w-full max-w-[1518px] flex-col gap-4">
          <ProfileCard
            programs={programs}
            progress={progress}
            /* The record's own label is "Official Progress", and this is not
               the record once something has been applied to it. */
            progressLabel={applied ? "Planned Progress" : undefined}
          />
          <NetworkRow />
          <TermStrip />

          <AuditControls
            tabs={AUDIT_TABS}
            active="progress"
            live={["progress"]}
            views={AUDIT_VIEWS}
            view={view}
            onSelectView={setView}
            scopes={AUDIT_SCOPES}
            scope={AUDIT_SCOPES[0]}
            lastComputed={LAST_COMPUTED}
          />

          {/* Only Progress has a design; the other four tabs are named and
              nothing more, which is what the frame shows of them. */}
          <section
            ref={auditRef}
            /* 40 between the tree, the unmatched list and the banner: three
               separate things in one card, and at 24 they read as one list
               that changes its mind twice. */
            className={cn(
              "scroll-mt-4 flex flex-col gap-10 overflow-x-auto rounded-md bg-card p-6 shadow-card",
              "ring-primary-50 transition-shadow duration-500",
              landed && applied?.mode === "change" && "ring-2"
            )}
          >
            {recomputing ? (
              /* The old tree goes rather than sitting there greyed: it is the
                 answer to a question nobody is asking any more. Same spinner
                 the rest of the prototypes wait on. */
              <div className="flex min-h-[320px] flex-col items-center justify-center gap-3">
                <Spinner className="size-9" />
                <p className="text-body-md text-gray-80">Recalculating audit</p>
              </div>
            ) : (
              <>
            <AuditTree audit={primary} />
            {/* A second program sits under the degree and above the courses
                nothing has claimed, which is where it would fall on the
                record: another thing the transcript is being read against. */}
            {second && (
              <div
                ref={addedRef}
                className={cn(
                  "scroll-mt-4 rounded-md ring-primary-50 transition-shadow duration-500",
                  /* The ring needs room to sit outside the rows it is around. */
                  landed && "ring-2 ring-offset-8 ring-offset-card"
                )}
              >
                <AuditTree audit={second} />
              </div>
            )}
            <UnmatchedSection
              count={unmatched.length}
              blurb={UNMATCHED_BLURB}
              courses={unmatched}
            />
            {/* The foot of the audit, and the way into the what-if. It
                stands on the card's own padding, as the tree and the
                unmatched list do — one edge down each side, whatever is
                against it. */}
            <DiscoverPrograms onOpen={() => setDiscovering(true)} />
              </>
            )}
          </section>
        </div>
      </main>
    </AppShell>
  )
}
