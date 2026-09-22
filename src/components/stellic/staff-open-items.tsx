import { useMemo, useState } from "react"

import { Icon } from "@/components/icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  EmptyState,
  MenuButton,
  Panel,
  SearchField,
  Section,
  TabBar,
  type Tab,
} from "@/components/stellic/staff-chrome"
import {
  Chips,
  Field,
  Headline,
  Quiet,
  Row,
  RowActions,
  RowBody,
  RowSubject,
  StatusLine,
  StepRail,
} from "@/components/stellic/staff-rows"
import { useToast } from "@/components/stellic/staff-toast"
import {
  ALL_TABS,
  JOB_OF_TAB,
  TAB_LABELS,
  tabAllowed,
  type Persona,
  type TabKey,
} from "@/data/staff-home"
import {
  APPTS,
  APPT_VIEWS,
  NOTES,
  NOTE_VIEWS,
  WORKFLOWS,
  faceOf,
  openSteps,
  routedTo,
  yourStep,
  type ApptRow,
  type ExceptionRequest,
  type Note,
  type PublishRequest,
  type WorkflowRow,
} from "@/data/staff-queue"

/* Open Items: everything routed to this person, in one tabbed queue.
 *
 * The tabs are what their permissions and their Customize choices leave, which
 * is why two people's Home look nothing alike. A tab with nothing in it tucks
 * into More rather than standing there with a zero — a quiet queue should not
 * take the width a busy one needs. */

type Sort = "date" | "name" | "program"

const SORTS: Record<string, { id: Sort; label: string }[]> = {
  audits: [
    { id: "date", label: "Date of request" },
    { id: "program", label: "Program name" },
  ],
  exceptions: [
    { id: "date", label: "Date requested" },
    { id: "name", label: "Student name" },
    { id: "program", label: "Program" },
  ],
  default: [
    { id: "date", label: "Newest first" },
    { id: "name", label: "Student name" },
  ],
}

const PLACEHOLDER: Record<TabKey, string> = {
  notes: "Student name, keyword",
  appts: "Student name",
  audits: "Program name, keyword",
  exceptions: "Student name, keyword",
  grad: "Student or workflow",
  reviews: "Student or workflow",
  transfer: "Student or workflow",
}

const hay = (row: unknown) => JSON.stringify(row).toLowerCase()

function arrange<T extends { iso: string; student?: string; program?: string }>(
  rows: T[],
  sort: Sort,
  query: string
) {
  const found = query ? rows.filter((row) => hay(row).includes(query)) : rows
  const by = (pick: (row: T) => string) =>
    [...found].sort((a, b) => pick(a).localeCompare(pick(b)))

  if (sort === "name") return by((row) => row.student ?? "")
  if (sort === "program") return by((row) => row.program ?? "")
  return [...found].sort((a, b) => (a.iso < b.iso ? 1 : -1))
}

export function OpenItems({
  persona,
  jobs,
  inert,
  publishes,
  exceptions,
  onResolve,
  onCleared,
}: {
  persona: Persona
  jobs: Record<string, boolean>
  /** Tabs this prototype draws but does not open. Named and nothing more. */
  inert?: TabKey[]
  publishes: PublishRequest[]
  exceptions: ExceptionRequest[]
  /** Take a row off the queue once it has finished animating out. */
  onResolve: (kind: "publish" | "exception", id: string) => void
  onCleared: () => void
}) {
  const toast = useToast()
  /* Null until somebody picks one: where a person lands is a fact about them,
     not a default this component gets to hold. */
  const [tab, setTab] = useState<TabKey | null>(null)
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<Sort>("date")
  const [open, setOpen] = useState<string[]>([])
  const [noteView, setNoteView] = useState<Note["category"]>("concerns")
  const [apptView, setApptView] = useState<(typeof APPT_VIEWS)[number]["id"]>("all")
  /* A big audit publishes in the background: the row stays, saying so, until
     it comes back. */
  const [publishing, setPublishing] = useState<string[]>([])
  /* Between the press and the row actually going, so the list can close up
     rather than snapping shut. */
  const [leaving, setLeaving] = useState<string[]>([])

  const perms = persona.perms
  const mine = useMemo(
    () => ({
      publishes: perms.auditPublish ? routedTo(publishes, persona.key) : [],
      exceptions:
        perms.makeException || perms.wf.includes("exc") ? routedTo(exceptions, persona.key) : [],
      grad: perms.wf.includes("grad") ? routedTo(WORKFLOWS.grad.rows, persona.key) : [],
      reviews: perms.wf.includes("reviews") ? routedTo(WORKFLOWS.reviews.rows, persona.key) : [],
      transfer: perms.wf.includes("transfer") ? routedTo(WORKFLOWS.transfer.rows, persona.key) : [],
      notes: perms.notes ? NOTES : [],
      appts: perms.appts ? APPTS : [],
    }),
    [persona.key, perms, publishes, exceptions]
  )

  /** What is waiting in a tab. Zero for anything this person cannot act in, so
   *  a switched-on tab never shows a count it cannot back up. */
  const countOf = (key: TabKey) => {
    if (!tabAllowed(key, perms)) return 0
    if (key === "notes") return mine.notes.filter((note) => note.category === "concerns").length
    if (key === "appts") return mine.appts.filter((appt) => appt.attended === null).length
    if (key === "audits") return mine.publishes.length
    if (key === "exceptions") return mine.exceptions.length
    return mine[key as "grad" | "reviews" | "transfer"].length
  }

  /* Switching a job off can take the tab you were standing on away, so where
     you are is derived from what is left rather than held in state and
     corrected afterwards. */
  const allowed = ALL_TABS.filter((key) => jobs[JOB_OF_TAB[key]] && tabAllowed(key, perms))
  /* An inert tab is drawn but never stood on, so it is out of the running for
     where the page opens as well as for where a press can take you. */
  const opens = allowed.filter((key) => !inert?.includes(key))
  const lands = persona.landsOn && opens.includes(persona.landsOn) ? persona.landsOn : opens[0]
  const here = tab && opens.includes(tab) ? tab : lands

  const shown: Tab[] = []
  const more: Tab[] = []

  for (const key of allowed) {
    const count = countOf(key)
    const item = { id: key, label: TAB_LABELS[key], count }
    /* A workflow category between cycles has nothing in it and should not cost
       the bar a slot — unless you are standing in it. */
    if (["grad", "reviews", "transfer"].includes(key) && count === 0 && here !== key)
      more.push(item)
    else shown.push(item)
  }

  if (!allowed.length) return null

  const choose = (key: TabKey) => {
    setTab(key)
    setQuery("")
    setSort("date")
  }

  const toggle = (id: string) =>
    setOpen((all) => (all.includes(id) ? all.filter((other) => other !== id) : [...all, id]))

  /** Clear a row: fade it, close the gap, then take it out of the data. */
  const clear = (kind: "publish" | "exception", id: string) => {
    setLeaving((all) => [...all, id])
    window.setTimeout(() => {
      onResolve(kind, id)
      onCleared()
      setLeaving((all) => all.filter((other) => other !== id))
    }, 420)
  }

  const elsewhere = (what: string) => toast(`${what} (Exists in the real app)`)
  const sorts = SORTS[here] ?? SORTS.default

  return (
    <Section
      title="Open Items"
      controls={
        <>
          <SearchField value={query} onChange={setQuery} placeholder={PLACEHOLDER[here]} />
          <MenuButton
            icon="swap-vert"
            label="Sort open items"
            heading="Sort by"
            options={sorts}
            value={sorts.some((option) => option.id === sort) ? sort : sorts[0].id}
            onSelect={setSort}
          />
        </>
      }
    >
      <Panel>
        <TabBar
          tabs={shown}
          more={more}
          active={here}
          live={inert ? opens : undefined}
          onSelect={(id) => choose(id as TabKey)}
        />

        {/* The only thing left inside the panel is the sub-view control on the
            two tabs that have one. Everything else lives on the heading. */}
        {(here === "notes" || here === "appts") && (
          <div className="flex flex-wrap items-center gap-2.5 p-4">
            {here === "notes" ? (
              <Tabs value={noteView} onValueChange={(value) => setNoteView(value as Note["category"])}>
                <TabsList>
                  {NOTE_VIEWS.map((view) => (
                    <TabsTrigger key={view.id} value={view.id} className="gap-2">
                      {view.label}
                      <Badge variant="quiet">{view.count}</Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            ) : (
              <Tabs
                value={apptView}
                onValueChange={(value) => setApptView(value as typeof apptView)}
              >
                <TabsList>
                  {APPT_VIEWS.map((view) => (
                    <TabsTrigger key={view.id} value={view.id} className="gap-2">
                      {view.label}
                      <Badge variant="quiet">{view.count}</Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
          </div>
        )}

        <div className="border-t border-divider">
          {here === "audits" && (
            <Publishes
              rows={arrange(mine.publishes, sort, query)}
              all={mine.publishes.length}
              query={query}
              publishing={publishing}
              leaving={leaving}
              onApprove={(row) => {
                if (row.large) {
                  setPublishing((all) => [...all, row.id])
                  window.setTimeout(() => {
                    setPublishing((all) => all.filter((id) => id !== row.id))
                    clear("publish", row.id)
                    toast(`${row.program}, ${row.version} published.`, { ok: true })
                  }, 2300)
                  return
                }
                clear("publish", row.id)
                toast(`Published. Students see ${row.version} now.`, { ok: true })
              }}
              onReject={(row) => {
                clear("publish", row.id)
                toast(`Back to draft. We let ${row.requestedBy} know.`)
              }}
              onOpen={(row) => elsewhere(`Opens the audit editor: ${row.program}, ${row.version}.`)}
            />
          )}

          {here === "exceptions" && (
            <Exceptions
              rows={arrange(mine.exceptions, sort, query)}
              all={mine.exceptions.length}
              query={query}
              open={open}
              leaving={leaving}
              onToggle={toggle}
              onApprove={(row) => {
                clear("exception", row.id)
                toast(`Exception approved. ${row.student.split(" ")[0]}'s audit is updated.`, {
                  ok: true,
                })
              }}
              onDeny={(row) => {
                clear("exception", row.id)
                toast(`Denied. ${row.student.split(" ")[0]} and ${row.requestedBy.split(" (")[0]} were notified.`)
              }}
              elsewhere={elsewhere}
            />
          )}

          {(here === "grad" || here === "reviews" || here === "transfer") && (
            <Workflows
              category={here}
              rows={arrange(mine[here], sort, query)}
              all={mine[here].length}
              query={query}
              open={open}
              onToggle={toggle}
              elsewhere={elsewhere}
            />
          )}

          {here === "notes" && (
            <Notes
              rows={arrange(
                mine.notes.filter((note) => note.category === noteView),
                sort,
                query
              )}
              all={mine.notes.filter((note) => note.category === noteView).length}
              query={query}
              elsewhere={elsewhere}
            />
          )}

          {here === "appts" && (
            <Appointments
              rows={arrange(
                mine.appts.filter((appt) =>
                  apptView === "all"
                    ? true
                    : apptView === "attendance"
                      ? appt.attended !== null
                      : appt.minutes
                ),
                sort,
                query
              )}
              all={mine.appts.length}
              query={query}
              elsewhere={elsewhere}
            />
          )}
        </div>
      </Panel>
    </Section>
  )
}

/** Nothing to show, and the reason why: an empty queue and a search that found
 *  nothing are different news. */
function Nothing({ all, query, title, detail }: { all: number; query: string; title: string; detail: string }) {
  if (query && all)
    return <EmptyState title={`No matches for “${query}”`} detail="Try a different name or program." />
  return <EmptyState title={title} detail={detail} />
}

/* ---------------------------------------------------------------- audits */

function Publishes({
  rows,
  all,
  query,
  publishing,
  leaving,
  onApprove,
  onReject,
  onOpen,
}: {
  rows: PublishRequest[]
  all: number
  query: string
  publishing: string[]
  leaving: string[]
  onApprove: (row: PublishRequest) => void
  onReject: (row: PublishRequest) => void
  onOpen: (row: PublishRequest) => void
}) {
  if (!rows.length)
    return (
      <Nothing
        all={all}
        query={query}
        title="Nothing waiting to publish."
        detail="New publish requests from your editors land here."
      />
    )

  /* The row does not open. A publish is a yes or a no about a whole version,
     and the change list behind it was unreadable past four or five entries —
     so the decision is here and the reading is in the editor. */
  return (
    <>
      {rows.map((row) => (
        <Row key={row.id} leaving={leaving.includes(row.id)}>
          <RowSubject
            title={row.program}
            sub={
              <>
                Version: <span className="font-semibold">{row.version}</span>
              </>
            }
            subStrong
          />
          <RowBody>
            <Headline>Publish requested by {row.requestedBy}</Headline>
            <Quiet>{row.date}</Quiet>
          </RowBody>
          <RowActions>
            {publishing.includes(row.id) ? (
              <span className="flex items-center gap-2 text-label-md text-gray-80">
                <Icon name="refresh" size={14} className="animate-spin text-primary-50" />
                Publishing in the background, safe to keep working
              </span>
            ) : (
              <>
                <Button variant="primary" size="sm" onClick={() => onApprove(row)}>
                  Approve
                </Button>
                <Button size="sm" onClick={() => onReject(row)}>
                  Reject
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onOpen(row)}>
                  Open in editor
                </Button>
              </>
            )}
          </RowActions>
        </Row>
      ))}
    </>
  )
}

/* ---------------------------------------------------------------- exceptions */

function Exceptions({
  rows,
  all,
  query,
  open,
  leaving,
  onToggle,
  onApprove,
  onDeny,
  elsewhere,
}: {
  rows: ExceptionRequest[]
  all: number
  query: string
  open: string[]
  leaving: string[]
  onToggle: (id: string) => void
  onApprove: (row: ExceptionRequest) => void
  onDeny: (row: ExceptionRequest) => void
  elsewhere: (what: string) => void
}) {
  if (!rows.length)
    return (
      <Nothing
        all={all}
        query={query}
        title="No exception requests waiting on you."
        detail="New requests from students and advisors land here."
      />
    )

  return (
    <>
      {rows.map((row) => {
        /* A direct exception has nothing behind it, so it is decided here in
           one press. One with a workflow has a rail to read first. */
        const staged = row.kind === "wf" && row.workflow

        return (
          <Row
            key={row.id}
            label={`${row.student}'s request`}
            leaving={leaving.includes(row.id)}
            open={open.includes(row.id)}
            onToggle={staged ? () => onToggle(row.id) : undefined}
            detail={
              staged && (
                <StepRail
                  steps={[
                    {
                      state: "done",
                      label: "Request submitted",
                      who: row.requestedBy,
                      when: row.date,
                      fields: row.workflow!.fields,
                    },
                    ...row.workflow!.steps,
                  ]}
                  actions={
                    <>
                      <Button
                        size="sm"
                        onClick={() => elsewhere(`Opens a message to ${row.student}.`)}
                      >
                        Contact {row.student.split(" ")[0]}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          elsewhere(
                            `Starts the “${yourStep(row.workflow!.steps)?.label}” step.`
                          )
                        }
                      >
                        Start
                      </Button>
                    </>
                  }
                  footer={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => elsewhere(`Opens ${row.student}'s profile, Requests tab.`)}
                    >
                      Open student profile
                      <Icon name="open-in-new" size={12} />
                    </Button>
                  }
                />
              )
            }
          >
            <RowSubject
              face={{
                initials: row.initials,
                color: row.color,
                photo: faceOf(row.student),
                seed: row.username,
              }}
              title={row.student}
              sub={row.username}
            />
            <RowBody>
              <Headline>{row.title}</Headline>
              <Field label="Requirement">{row.requirement}</Field>
              <Field label="Justification">{row.justification}</Field>
              <Chips items={[{ label: row.requestedBy, icon: true }, { label: row.program }]} />
              <Quiet>{row.date}</Quiet>
            </RowBody>
            <RowActions>
              {staged ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => elsewhere("Opens this request.")}
                >
                  Open
                </Button>
              ) : (
                <>
                  <Button variant="primary" size="sm" onClick={() => onApprove(row)}>
                    Approve
                  </Button>
                  <Button size="sm" onClick={() => onDeny(row)}>
                    Deny
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => elsewhere(`Opens ${row.student}'s audit.`)}
              >
                View in audit
              </Button>
            </RowActions>
          </Row>
        )
      })}
    </>
  )
}

/* ---------------------------------------------------------------- workflows */

function Workflows({
  category,
  rows,
  all,
  query,
  open,
  onToggle,
  elsewhere,
}: {
  category: "grad" | "reviews" | "transfer"
  rows: WorkflowRow[]
  all: number
  query: string
  open: string[]
  onToggle: (id: string) => void
  elsewhere: (what: string) => void
}) {
  if (!rows.length)
    return (
      <Nothing
        all={all}
        query={query}
        title={`No open ${WORKFLOWS[category].label} requests.`}
        detail="This tab tucks into “More” until new requests need you."
      />
    )

  /* Where the row leads if you would rather read than decide. Transfer keeps
     its own page for that, a plan review is answered by the plan, and
     everything else by the audit. */
  const view = (row: WorkflowRow) =>
    category === "transfer" ? (
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          elsewhere(`Opens ${row.student.split(" ")[0]}'s transfer credit on the Transfers page.`)
        }
      >
        View in transfers
      </Button>
    ) : category === "reviews" ? (
      /* The only thing on the row, so it is a button rather than a ghost: a
         review is not opened and decided from a queue — it is decided on the
         plan, and this is the way to it. */
      <Button size="sm" onClick={() => elsewhere(`Opens ${row.student.split(" ")[0]}'s plan.`)}>
        View plan
      </Button>
    ) : (
      <Button variant="ghost" size="sm" onClick={() => elsewhere(`Opens ${row.student}'s audit.`)}>
        View in audit
      </Button>
    )

  return (
    <>
      {rows.map((row) => (
        <Row
          key={row.id}
          label={`${row.student}'s request`}
          open={open.includes(row.id)}
          onToggle={() => onToggle(row.id)}
          detail={
            <StepRail
              steps={[
                {
                  state: "done",
                  label: row.openedAs ?? "Request submitted",
                  who: `${row.student} (student)`,
                  when: row.date,
                  fields: row.fields,
                },
                ...(row.steps ?? []),
              ]}
              actions={
                <>
                  <Button size="sm" onClick={() => elsewhere(`Opens a message to ${row.student}.`)}>
                    Contact {row.student.split(" ")[0]}
                  </Button>
                  {/* A review is not started, it is finished: the decisions
                      are marked on the plan itself, and this is what sends it
                      back. The step the button belongs to says so — Review,
                      with Complete waiting under it. */}
                  {category === "reviews" ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        elsewhere(`Completes the review and sends ${row.student}'s plan back.`)
                      }
                    >
                      Complete
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => elsewhere(`Starts the “${yourStep(row.steps)?.label}” step.`)}
                    >
                      Start
                    </Button>
                  )}
                </>
              }
              footer={
                <>
                  {/* What a reviewer reaches for before deciding: the plan the
                      request names, and how much of it has moved since. A
                      request nothing has changed under says so rather than
                      offering a list of nothing. */}
                  {category === "reviews" && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          elsewhere(`Opens ${row.student.split(" ")[0]}'s reference plan.`)
                        }
                      >
                        View reference plan
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!row.changes}
                        onClick={() =>
                          elsewhere(`Lists what moved in the plan since the request went out.`)
                        }
                      >
                        {row.changes
                          ? `${row.changes} change${row.changes === 1 ? "" : "s"} during review request`
                          : "No changes during review request"}
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => elsewhere(`Opens ${row.student}'s profile, Requests tab.`)}
                  >
                    Open student profile
                    <Icon name="open-in-new" size={12} />
                  </Button>
                </>
              }
            />
          }
        >
          <RowSubject
            face={{
              initials: row.initials,
              color: row.color,
              photo: faceOf(row.student),
              seed: row.username ?? row.student,
            }}
            title={row.student}
            sub={row.program}
          />
          <RowBody>
            <Headline>{row.name}</Headline>
            {row.status && <StatusLine>{row.status}</StatusLine>}
            <Field label="Step">{openSteps(row.steps).join(", ")}</Field>
            <Quiet>{row.date}</Quiet>
          </RowBody>
          <RowActions>
            {/* Everything else in the queue is a decision you can take from the
                row, so it leads with Open. A plan review is not: the decisions
                are marked on the plan itself, and the rail underneath already
                carries Complete. */}
            {category !== "reviews" && (
              <Button variant="primary" size="sm" onClick={() => elsewhere("Opens this request.")}>
                Open
              </Button>
            )}
            {view(row)}
          </RowActions>
        </Row>
      ))}
    </>
  )
}

/* ---------------------------------------------------------------- notes */

function Notes({
  rows,
  all,
  query,
  elsewhere,
}: {
  rows: Note[]
  all: number
  query: string
  elsewhere: (what: string) => void
}) {
  if (!rows.length)
    return (
      <Nothing
        all={all}
        query={query}
        title="No notes here yet."
        detail="Notes your team logs on your advisees show up here."
      />
    )

  return (
    <>
      {rows.map((note) => (
        <Row key={note.id}>
          <RowSubject
            face={{
              initials: note.initials,
              color: note.color,
              photo: faceOf(note.student),
              seed: note.student,
            }}
            title={note.student}
            sub={note.program}
          />
          <RowBody>
            <p className="text-body-md text-foreground">{note.text}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {note.tags.map((tag) => (
                <Badge
                  key={tag.label}
                  variant={tag.tone ?? "secondary"}
                  className="py-0.5 font-medium"
                >
                  {tag.label}
                </Badge>
              ))}
            </div>
            <Quiet>{note.date}</Quiet>
          </RowBody>
          <RowActions>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Open this note"
              onClick={() => elsewhere("Opens this note.")}
            >
              <Icon name="more-horiz" size={16} />
            </Button>
          </RowActions>
        </Row>
      ))}
    </>
  )
}

/* ---------------------------------------------------------------- appointments */

/** Attendance and minutes are either recorded or they are a button. Recorded,
 *  they are a fact rather than a control, so they lose the button's edges. */
const settled = (good: boolean) =>
  `flex items-center gap-1.5 px-2 text-label-md ${good ? "text-success-100" : "text-alert-100"}`

function Appointments({
  rows,
  all,
  query,
  elsewhere,
}: {
  rows: ApptRow[]
  all: number
  query: string
  elsewhere: (what: string) => void
}) {
  if (!rows.length)
    return (
      <Nothing
        all={all}
        query={query}
        title="No appointments here."
        detail="Attendance and meeting logs show up here."
      />
    )

  return (
    <>
      {rows.map((appt) => (
        <Row key={appt.id}>
          <RowSubject title={appt.title} sub={appt.when} />
          <RowBody>
            <p className="text-body-md text-foreground">{appt.student}</p>
            {appt.program && <Quiet>{appt.program}</Quiet>}
          </RowBody>
          <RowActions>
            {appt.attended === null ? (
              <Button size="sm" onClick={() => elsewhere("Opens attendance recording.")}>
                Record Attendance
              </Button>
            ) : (
              <span className={settled(appt.attended)}>
                <Icon name={appt.attended ? "check" : "close"} size={12} />
                {appt.attended ? "Attended" : "Not Attended"}
              </span>
            )}
            {appt.minutes ? (
              <span className={settled(true)}>
                <Icon name="check" size={12} />
                Minutes
              </span>
            ) : (
              <Button size="sm" onClick={() => elsewhere("Opens meeting minutes.")}>
                Add Minutes
              </Button>
            )}
          </RowActions>
        </Row>
      ))}
    </>
  )
}

