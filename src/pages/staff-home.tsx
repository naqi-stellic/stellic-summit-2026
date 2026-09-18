import { useState } from "react"

import { Icon } from "@/components/icon"
import { AppShell } from "@/components/layout/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Face, Panel, Section } from "@/components/stellic/staff-chrome"
import { Customize } from "@/components/stellic/staff-customize"
import { CreateEquivalency } from "@/components/stellic/staff-equivalency"
import { Insights } from "@/components/stellic/staff-insights"
import { OpenItems } from "@/components/stellic/staff-open-items"
import { ToastProvider, useToast } from "@/components/stellic/staff-toast"
import {
  defaultJobs,
  personaOf,
  type JobKey,
  type PersonaKey,
  type TabKey,
} from "@/data/staff-home"
import { EXCEPTIONS, PUBLISH_REQUESTS, REPORTS, TODAY } from "@/data/staff-queue"
import type { Articulation } from "@/data/staff-insights"

/* Staff Home.
 *
 * One page that has to be several pages. A registrar and a transfer officer
 * open it to do entirely different work, so what is on it is decided twice
 * over: by what the institution granted them, and by what they have said they
 * want to see. Each prototype standing on this file names its person and gets
 * their page — `who` is the only thing that differs between them.
 *
 * Under the greeting it is two panels, and the whole design is the line between
 * them. Open Items is work somebody sent you: it is routed, it is waiting, and
 * it wants a decision. Insights is work nobody sent you: Stellic found it in
 * the audits you can change, and it wants a fix. Both are built out of the same
 * furniture and read in the same three moves, so the page is learned once. */

export function StaffHome({ who, inert, without }: StaffHomeProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <ToastProvider>
        <Home who={who} inert={inert} without={without} />
      </ToastProvider>
    </TooltipProvider>
  )
}

type StaffHomeProps = {
  who: PersonaKey
  /** Queue tabs this prototype draws but does not open — named, counted, and
   *  going nowhere, because nothing behind them has been built. */
  inert?: TabKey[]
  /** Jobs this prototype leaves out altogether: off the page and off the
   *  Customize list, rather than switched off and waiting to be found. */
  without?: JobKey[]
}

function Home({ who, inert, without }: StaffHomeProps) {
  const toast = useToast()
  const persona = personaOf(who)

  const [jobs, setJobs] = useState(() => defaultJobs(persona.perms, without))
  /* A dismissal is a reading decision rather than a resolution, so it is this
     person's alone — it never leaves anybody else's list. */
  const [hidden, setHidden] = useState(() => new Set<string>())
  const [publishes, setPublishes] = useState(PUBLISH_REQUESTS)
  const [exceptions, setExceptions] = useState(EXCEPTIONS)
  const [cleared, setCleared] = useState(45)
  const [customizing, setCustomizing] = useState(false)
  /* The equivalency form takes the whole page when it is open: it is where the
     Transfers insight was pointing, not a panel beside it. */
  const [writing, setWriting] = useState<Articulation | null>(null)
  /* Articulations a rule has been written for. Gone rather than hidden — the
     work is done, not put off. */
  const [resolved, setResolved] = useState(() => new Set<string>())

  const elsewhere = (what: string) => toast(`${what} (Exists in the real app)`)

  return (
    <AppShell
      section="staff"
      /* The form belongs to Transfer, so the nav says so while it is open. */
      navCurrent={writing ? "Transfer" : "Home"}
      title={writing ? "Transfer" : "Home"}
      account={
        <Face photo={persona.photo} initials={persona.initials} color="#6f7782" size={40} />
      }
    >
      {writing ? (
        <CreateEquivalency
          row={writing}
          onCancel={() => setWriting(null)}
          onCreate={(count, status) => {
            setResolved((all) => new Set([...all, writing.id]))
            setWriting(null)
            setCleared((n) => n + 1)
            toast(
              `Rule created. ${count} articulations queued as ${status === "completed" ? "Completed" : status === "new" ? "New" : "Pending"}.`,
              { ok: true }
            )
          }}
        />
      ) : (
      <main className="@container min-w-0 flex-1 overflow-y-auto px-6 pt-8 pb-24">
        <div className="mx-auto flex w-full max-w-[1024px] flex-col gap-6">
          {/* Who you are and how the week is going. The tally is the page's
              own loop: every row cleared and every insight put away adds to
              it, which is the only reward a queue can offer. */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-h400 font-semibold text-gray-100">Welcome, {persona.name}!</h2>
              <p className="mt-1 text-body-md text-gray-80">
                Keep it up! You've cleared{" "}
                <span className="font-semibold text-gray-100">{cleared}</span> items this week 🙌
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                aria-label="Customize Home"
                onClick={() => setCustomizing(true)}
              >
                <Icon name="tune" size={16} />
              </Button>
              {/* Quick Actions is a note action, so it arrives with Notes. */}
              {jobs.notes && (
                <Button
                  variant="primary"
                  onClick={() =>
                    elsewhere("Quick Actions: add a note, book an appointment, run a report.")
                  }
                >
                  Quick Actions
                  <Icon name="expand-more" size={12} />
                </Button>
              )}
            </div>
          </div>

          {jobs.reports && (
            <Section
              title="Reports"
              controls={
                <>
                  <button
                    type="button"
                    onClick={() => elsewhere("Opens Analytics, the full reports list.")}
                    className="cursor-pointer text-label-md text-gray-80 underline [text-underline-position:from-font]"
                  >
                    View All
                  </button>
                  <Pager onNext={() => elsewhere("More pinned reports.")} />
                </>
              }
            >
              <Cards>
                {REPORTS.map((report) => (
                  <Card key={report.title}>
                    <CardHead title={report.title} sub={report.count} />
                    <div className="mt-auto flex flex-wrap items-center gap-2 pt-3 text-label-md text-gray-80">
                      {report.tracked && (
                        <span className="flex items-center gap-1.5">
                          <Icon name="s-notification" size={13} />
                          Tracked
                        </span>
                      )}
                      {report.tag && <Badge variant="secondary">{report.tag}</Badge>}
                      <span className="flex-1" />
                      {report.up !== undefined && <span>▲ {report.up}</span>}
                      {report.down !== undefined && <span>▼ {report.down}</span>}
                    </div>
                  </Card>
                ))}
              </Cards>
            </Section>
          )}

          {/* Today's schedule rides with the Appointments job rather than
              standing on its own: it is the same work, read two ways. */}
          {jobs.appts && (
            <Section
              title="Today's Appointments"
              controls={
                <>
                  <Button size="sm" onClick={() => elsewhere("Opens the scheduling flow.")}>
                    Schedule
                  </Button>
                  <Pager onNext={() => elsewhere("Later appointments.")} />
                </>
              }
            >
              <Cards>
                {TODAY.map((appt, i) => (
                  <Card key={`${appt.title}-${i}`}>
                    <div className="mb-2.5 flex items-center justify-between gap-2">
                      <span className="flex items-center">
                        {appt.who.map((face, index) => (
                          <Face
                            key={face.initials}
                            initials={face.initials}
                            color={face.color}
                            photo={face.photo}
                            size={26}
                            className={index > 0 ? "-ml-[7px] border-2 border-white" : ""}
                          />
                        ))}
                      </span>
                      {appt.starts && (
                        <span className="text-label-md text-gray-80">{appt.starts}</span>
                      )}
                    </div>
                    <p className="text-body-md font-semibold text-foreground">{appt.title}</p>
                    <p className="mt-0.5 text-label-md text-gray-80">{appt.when}</p>
                  </Card>
                ))}
              </Cards>
            </Section>
          )}

          <OpenItems
            persona={persona}
            jobs={jobs}
            inert={inert}
            publishes={publishes}
            exceptions={exceptions}
            onResolve={(kind, id) =>
              kind === "publish"
                ? setPublishes((all) => all.filter((row) => row.id !== id))
                : setExceptions((all) => all.filter((row) => row.id !== id))
            }
            onCleared={() => setCleared((n) => n + 1)}
          />

          <Insights
            persona={persona}
            jobs={jobs}
            hidden={hidden}
            resolved={resolved}
            onCreateRule={setWriting}
            onHide={(ids) => setHidden((all) => new Set([...all, ...ids]))}
            onRestore={(ids) =>
              setHidden((all) => {
                const next = new Set(all)
                ids.forEach((id) => next.delete(id))
                return next
              })
            }
            onCleared={(n) => setCleared((total) => total + n)}
          />
        </div>
      </main>
      )}

      <Customize
        open={customizing}
        onOpenChange={setCustomizing}
        persona={persona}
        jobs={jobs}
        without={without}
        onToggle={(job, on) => setJobs((all) => ({ ...all, [job]: on }))}
      />
    </AppShell>
  )
}

/* ---------------------------------------------------------------- pieces */

const Cards = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 gap-3.5 @2xl:grid-cols-2 @5xl:grid-cols-4">{children}</div>
)

const Card = ({ children }: { children: React.ReactNode }) => (
  <Panel className="flex min-h-[118px] flex-col px-3.5 pt-3.5 pb-3">{children}</Panel>
)

function CardHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-body-md font-semibold text-foreground">{title}</p>
        <p className="mt-[3px] text-label-md text-gray-80">{sub}</p>
      </div>
      <Icon name="more-horiz" size={16} className="shrink-0 text-gray-60" />
    </div>
  )
}

/** There is more of this than fits, and it is a row rather than a list, so it
 *  pages sideways. The back arrow is spent on arrival. */
function Pager({ onNext }: { onNext: () => void }) {
  const shape =
    "flex size-[26px] items-center justify-center rounded-md border border-input bg-card text-gray-80 disabled:opacity-45"

  return (
    <span className="flex gap-1.5">
      <button type="button" disabled aria-label="Previous" className={shape}>
        <Icon name="chevron-left" size={12} />
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Next"
        className={`${shape} cursor-pointer hover:bg-gray-5`}
      >
        <Icon name="chevron-right" size={12} />
      </button>
    </span>
  )
}
