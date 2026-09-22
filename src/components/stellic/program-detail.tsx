import { cn } from "cn"
import { useRef, useState, type ReactNode } from "react"

import { Icon } from "@/components/icon"
import { Panel, RecordTabs } from "@/components/stellic/staff-chrome"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CREDITS_PER_COURSE } from "@/data/plan"
import {
  PLANNING_BLURB,
  PLANNING_INSTRUCTION,
  PLANNING_PLACEHOLDER,
  appliesTo,
  currentVersion,
  entryYears,
  pathwaysFor,
  versionLabel,
  type CatalogProgram,
  type CatalogRequirement,
  type Pathway,
} from "@/data/program-instruction"

/* One catalogue entry, opened.
 *
 * The list says what state a program is in; this says what the program is. It
 * is the registrar's side of the audit the students' prototypes read: the same
 * requirements, in the same order, with the student taken out — what the degree
 * asks for rather than how far one person has got through it.
 *
 * Three tabs, because the entry is three things to the person maintaining it:
 * what it asks for, which versions of that exist, and whether anybody has laid
 * it out term by term. */

const TABS = [
  { id: "about", label: "About" },
  { id: "audits", label: "Audits" },
  { id: "planning", label: "Planning" },
]

/** The two rules every audit in the catalogue is built under. They are the
 *  audit's own terms rather than this program's, which is why they are written
 *  here and not beside the requirements they govern. */
const RULES = [
  "Fulfill all of the following requirements",
  "Courses may double count without any limit with other programs unless specified otherwise",
]

/* ------------------------------------------------------------ the header */

function Head({ entry }: { entry: CatalogProgram }) {
  return (
    <Panel className="flex flex-col gap-1 p-6">
      <p className="text-overline font-medium tracking-[0.5px] text-gray-80 uppercase">
        {entry.kind}
      </p>
      <p className="text-h400 font-semibold text-gray-100">{entry.name}</p>
      {/* What the SIS files it under, in the order a catalogue lists it. */}
      <p className="text-body-md text-gray-80">{entry.department}</p>
      <p className="text-body-md text-gray-80">{entry.school}</p>
      <p className="text-body-md text-gray-80">{entry.level}</p>
    </Panel>
  )
}

/* ------------------------------------------------------ the requirements */

/** The audit's own tags, said the way the product says them. A tag is a
 *  shorthand written to sit beside a name; opened, there is room for the
 *  sentence it is short for. */
function rulesOf(requirement: CatalogRequirement): string[] {
  return requirement.tags
    .flatMap((tag) => tag.split(" · "))
    .map((rule) => {
      if (rule === "fulfill all") return "Fulfill all of the following requirements"
      if (rule === "fulfill any") return "Fulfill any of the following requirements"
      if (rule === "taken last") return "Taken in the final term"
      if (rule === "Additional Check")
        return "An additional check: its courses are counted under another requirement"
      return rule.charAt(0).toUpperCase() + rule.slice(1)
    })
}

/** A course the requirement asks for, on a card of its own.
 *
 *  Nested the way the audit nests, minus the lines: the courses sit beside the
 *  requirement rather than inside it, indented under the row that wants them.
 *  What that buys is a requirement you can still read the name of with forty
 *  courses open underneath it. */
function Course({ course }: { course: { code: string; name: string } }) {
  return (
    <div className="ml-10 flex items-baseline gap-3 rounded-md border border-gray-40 bg-card px-4 py-2.5">
      {/* A row with no code is something to do rather than something to take. */}
      {course.code && (
        <span className="shrink-0 text-body-md text-gray-100">{course.code}</span>
      )}
      <span className="min-w-0 text-body-md text-gray-80">{course.name}</span>
    </div>
  )
}

function Requirement({
  requirement,
  open,
  onToggle,
}: {
  requirement: CatalogRequirement
  open: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-md border border-gray-40 bg-card px-4 py-2.5">
        {/* Closed, the row is the name and the way in, and nothing else: seven
            rows saying "fulfill all" seven times is a column of noise between
            the names and the chevrons that open them. Opened, there is room for
            what the requirement actually asks. */}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex w-full cursor-pointer items-center gap-2 text-left"
        >
          <span className="text-body-md font-semibold text-gray-100">{requirement.name}</span>
          <Icon
            name="chevron-right"
            size={14}
            className={cn("shrink-0 text-gray-60 transition-transform", open && "rotate-90")}
          />
        </button>

        {open && (
          <div className="flex flex-col gap-1 pt-2">
            <ul className="flex list-disc flex-col gap-0.5 pl-5 text-body-md text-gray-80">
              {rulesOf(requirement).map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
            <p className="flex items-center gap-2 text-body-md text-gray-80">
              Mode average credits: {CREDITS_PER_COURSE}
              <Badge variant="secondary">
                <Icon name="info" size={12} />
                Auto
              </Badge>
            </p>
          </div>
        )}
      </div>

      {open &&
        (requirement.courses.length === 0 ? (
          /* A requirement that names nothing is not an empty requirement — it
             is one the whole catalogue answers. */
          <p className="ml-10 text-body-md text-gray-80">
            Any course in the catalogue counts towards this.
          </p>
        ) : (
          requirement.courses.map((course, i) => (
            <Course key={`${course.code}-${course.name}-${i}`} course={course} />
          ))
        ))}
    </div>
  )
}

/* ---------------------------------------------------------------- about */

/** The version being read. One control, on both tabs, over one piece of state:
 *  changing it on Audits changes what About is showing, because they are two
 *  readings of the same choice. */
function VersionPicker({
  entry,
  version,
  onVersion,
}: {
  entry: CatalogProgram
  version: string
  onVersion: (next: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <label htmlFor="audit-version" className="text-body-md font-semibold text-foreground">
        Audit version
      </label>
      <Select value={version} onValueChange={onVersion}>
        <SelectTrigger id="audit-version" className="w-[280px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {entry.versions.map((one) => (
            <SelectItem key={one.name} value={one.name}>
              {versionLabel(one)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

/** A link that is drawn and does not lead anywhere yet. Underlined, because
 *  what it says is what it would do, and a word that looks like a word is not
 *  offering to do anything. */
function Doing({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      className="cursor-pointer text-body-md text-gray-100 underline [text-underline-position:from-font]"
    >
      {children}
    </button>
  )
}

/** A heading that opens something, with a count where there is one to give. */
function Opens({ label, count }: { label: string; count?: number }) {
  return (
    <button
      type="button"
      className="flex w-fit cursor-pointer items-center gap-2 text-body-md font-semibold text-gray-100"
    >
      {label}
      {count !== undefined && <Badge variant="secondary">{count}</Badge>}
      <Icon name="chevron-right" size={14} className="text-gray-60" />
    </button>
  )
}

/** What the program asks for, and the controls that open it. Both tabs show
 *  it — About as the entry's own requirements, Audits as this version's — so it
 *  is one component and what changes is the heading above it. */
function Requirements({
  entry,
  title,
  subtitle,
  actions,
}: {
  entry: CatalogProgram
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  const [open, setOpen] = useState<string[]>([])

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-h300 font-semibold text-gray-100">{title}</p>
          {subtitle && <p className="text-body-md text-gray-80">{subtitle}</p>}
          <ul className="flex list-disc flex-col gap-0.5 pl-5 text-body-md text-gray-80">
            {RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
          {/* Every course in this catalogue is three credits, so the mode is
              three — worked out rather than typed, which is what the mark
              beside it is claiming. */}
          <p className="mt-1 flex items-center gap-2 text-body-md text-gray-80">
            Mode average credits: {CREDITS_PER_COURSE}
            <Badge variant="secondary">
              <Icon name="info" size={12} />
              Auto
            </Badge>
          </p>
        </div>

        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button onClick={() => setOpen(entry.requirements.map((one) => one.id))}>
          <Icon name="unfold-more" size={14} />
          Expand All
        </Button>
        <Button onClick={() => setOpen([])}>
          <Icon name="close" size={14} />
          Collapse All
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {entry.requirements.map((requirement) => (
          <Requirement
            key={requirement.id}
            requirement={requirement}
            open={open.includes(requirement.id)}
            onToggle={() =>
              setOpen((held) =>
                held.includes(requirement.id)
                  ? held.filter((id) => id !== requirement.id)
                  : [...held, requirement.id]
              )
            }
          />
        ))}
      </div>
    </>
  )
}

function About({ entry, version }: { entry: CatalogProgram; version: string }) {
  return (
    <div className="flex flex-col gap-6 px-6 pb-6">
      <Opens label="Degree Requirements" count={entry.requirements.length} />
      <Requirements
        entry={entry}
        title={entry.name}
        subtitle={`Audit Version: ${version}`}
        actions={
          <>
            <Button>Edit</Button>
            <Button>Try on a student</Button>
          </>
        }
      />
    </div>
  )
}

/* -------------------------------------------------------------- planning */

/** One built pathway: what it is called, which entry year it was written for,
 *  how long it runs — and then, at the foot, what it is a route through. */
function PathwayCard({ pathway }: { pathway: Pathway }) {
  return (
    <div className="flex w-[240px] flex-col gap-2 rounded-md border border-gray-40 bg-card p-4">
      <p className="text-body-md font-semibold text-gray-100">{pathway.name}</p>
      <div className="flex flex-col gap-1">
        <p className="text-body-md text-gray-80">{pathway.entryYear}</p>
        <p className="text-label-md text-gray-80">
          {pathway.terms} terms · {pathway.courses} courses
        </p>
      </div>
      {/* Drawn only where it is true, and true of one pathway per program: two
          that both apply themselves is two plans. */}
      {pathway.autoApply && (
        <Badge variant="warning">
          <Icon name="star" size={12} />
          Auto Apply
        </Badge>
      )}
      {/* What it is a route through, at the foot of the card rather than under
          the last line of it — so the chips line up across a row whether or not
          the card above them says Auto Apply. */}
      <div className="mt-auto flex flex-wrap gap-1.5 pt-6">
        <Badge variant="secondary">{pathway.kind}</Badge>
        <Badge variant="secondary">{pathway.scope}</Badge>
        <Badge variant="secondary">{pathway.start}</Badge>
      </div>
    </div>
  )
}

/** Context written on the program for the Generator to read.
 *
 *  It opens in place rather than in a dialog: what is being written is about
 *  the thing on the page, and a dialog would cover the pathways it is meant to
 *  produce. Clicking into the empty box writes the instruction the walkthrough
 *  turns on, once, and hands the field back the moment somebody types in it. */
function Instructions() {
  const [held, setHeld] = useState("")
  const [writing, setWriting] = useState(false)
  const [draft, setDraft] = useState("")
  /* Whether the saved instruction is open past its first three lines. */
  const [all, setAll] = useState(false)
  const filled = useRef(false)
  const box = useRef<HTMLTextAreaElement>(null)

  /* Whole, not keystroke by keystroke. Every other field in the suite that
     fills itself in is somebody typing a sentence they are composing on the
     spot; this is three paragraphs of course advice that already existed
     somewhere else, so what it simulates is a paste. */
  const autofill = () => {
    if (filled.current || draft.trim()) return
    filled.current = true
    setDraft(PLANNING_INSTRUCTION)
    /* Where a paste leaves you: at the end of what was pasted, with the box
       scrolled to it. After the paint, because the text is not in the field
       until React has put it there. */
    requestAnimationFrame(() => {
      const field = box.current
      if (!field) return
      field.setSelectionRange(field.value.length, field.value.length)
      field.scrollTop = field.scrollHeight
    })
  }

  const open = () => {
    setDraft(held)
    /* Written once already means written: the paste is for the empty box. */
    filled.current = held.length > 0
    setWriting(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-body-md font-semibold text-gray-100">Planning instructions</p>
          <p className="text-body-md text-gray-80">{PLANNING_BLURB}</p>
        </div>
        {!writing && (
          <Button onClick={open}>
            {/* Nothing written yet is something to add; something written is
                something to change, and the word says which. */}
            <Icon name={held ? "edit" : "add"} size={14} />
            {held ? "Edit" : "Add"}
          </Button>
        )}
      </div>

      {writing ? (
        <div className="flex flex-col gap-4">
          <Textarea
            ref={box}
            value={draft}
            onFocus={autofill}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={PLANNING_PLACEHOLDER}
            className="h-[260px] resize-none px-3 py-2 text-body-md placeholder:text-gray-80"
          />
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button onClick={() => setWriting(false)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!draft.trim()}
              onClick={() => {
                setHeld(draft.trim())
                setAll(false)
                setWriting(false)
              }}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        held && (
          <div className="flex flex-col gap-2 self-start">
            {/* Three lines, and a way to the rest. What is written here is a
                reference document — the point of it is that it is long — and a
                page that opened on all of it would be a page about the
                instructions rather than about the program. */}
            <p
              className={cn(
                "text-body-md whitespace-pre-line text-gray-100",
                !all && "line-clamp-3"
              )}
            >
              {held}
            </p>
            <button
              type="button"
              onClick={() => setAll(!all)}
              className="w-fit cursor-pointer text-body-md text-gray-100 underline [text-underline-position:from-font]"
            >
              {all ? "Show less" : "Show more"}
            </button>
          </div>
        )
      )}
    </div>
  )
}

function Planning({ entry }: { entry: CatalogProgram }) {
  const built = pathwaysFor(entry)

  return (
    <div className="flex flex-col gap-8 px-6 pt-6 pb-6">
      <Instructions />

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-body-md font-semibold text-gray-100">
            {built.length} Pathway{built.length === 1 ? "" : "s"}
          </p>
          {/* The tags the cards carry, gathered: what there is to filter these
              by, rather than a second word for the same thing. */}
          <Button size="icon" aria-label="Filter by tag">
            <Icon name="sell" size={16} />
          </Button>
        </div>

        {built.length === 0 ? (
          /* Said plainly. Most programs have none, and a section that pretended
             otherwise would be the only thing on this page that does. */
          <p className="text-body-md text-gray-80">
            Nobody has laid this program out term by term yet.
          </p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {built.map((pathway) => (
              <PathwayCard key={pathway.name} pathway={pathway} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- audits */

/** One version of the audit, and what there is to do to it.
 *
 *  The About tab is the program; this is the version. Same requirements
 *  underneath — a version *is* a set of requirements — with everything that is
 *  true of this one and not of the others above them: who published it and
 *  when, who it audits, and which entry years it takes. */
function Audits({
  entry,
  version,
  onVersion,
}: {
  entry: CatalogProgram
  version: string
  onVersion: (next: string) => void
}) {
  const one = entry.versions.find((held) => held.name === version) ?? entry.versions[0]
  const students = appliesTo(entry, one)

  return (
    <>
      {/* The version stands apart from what it contains: everything above the
          extra space is true of this version, everything below is the audit
          itself. */}
      <div className="flex flex-col items-center gap-6 px-6 pt-6 pb-10">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <VersionPicker entry={entry} version={version} onVersion={onVersion} />
          <Button>Create New Version</Button>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <p className="text-h300 font-semibold text-gray-100">{one.name}</p>
            <Badge variant={one.published ? "success" : "danger"} className="uppercase">
              {one.published ? "Published" : "Draft"}
            </Badge>
            {/* Said in full rather than as a padlock: who can see an audit is
                not a detail somebody should have to hover to find out. */}
            <Badge variant="outline" className="uppercase">
              Visibility: Public
            </Badge>
          </div>

          <p className="text-body-md text-gray-80">
            {one.published ? "Last published" : "Last saved"} on {one.on} by {one.by}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-gray-60">
            <Doing>try on a student</Doing>
            <span>·</span>
            <Doing>delete version</Doing>
            <span>·</span>
            <Doing>{one.published ? "archive version" : "discard draft"}</Doing>
            {one.snapshots > 0 && (
              <>
                <span>·</span>
                <Doing>
                  {one.snapshots} audit snapshot{one.snapshots === 1 ? "" : "s"}
                </Doing>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 px-6 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <p className="flex items-center gap-3 text-body-md font-semibold text-gray-100">
              Applies To
              <Doing>
                {students} student{students === 1 ? "" : "s"}
              </Doing>
            </p>
            <div className="flex flex-col">
              <p className="text-overline font-medium tracking-[0.5px] text-gray-80 uppercase">
                Entry year
              </p>
              <p className="text-body-md text-gray-80">{entryYears(entry, one)}</p>
            </div>
          </div>

          <Button>Edit This Audit</Button>
        </div>

        <Opens label="Degree Requirements" count={entry.requirements.length} />
        <Opens label="Exception Insights" />

        <Requirements entry={entry} title="Program Requirements" />
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ page */

export function ProgramDetail({ entry }: { entry: CatalogProgram }) {
  const [tab, setTab] = useState("about")
  /* The newest published version, which is what students are being read
     against. A draft is the work, not the answer. */
  const [version, setVersion] = useState(currentVersion(entry).name)
  const built = pathwaysFor(entry)

  return (
    <>
      {/* No breadcrumb. The way back is Programs in the nav, which is the row
          this page is standing on and the one somebody reaches for anyway. */}
      <Head entry={entry} />

      <Panel>
        {/* The same strip the student profile carries, with the same room
            above it: two staff record pages, one way of changing tabs. */}
        <div className="pt-6">
          <RecordTabs tabs={TABS} active={tab} onSelect={setTab} />
        </div>

        {tab === "about" && (
          <>
            <div className="flex flex-col items-center gap-6 p-6">
              {/* The mark and the word are one heading, so they sit on one
                  centre line rather than on a shared baseline — the glyph is
                  square and the word is not. */}
              <div className="flex items-center justify-center gap-2.5">
                <Icon name="assignment" size={24} className="shrink-0 text-gray-80" />
                <p className="text-h400 font-semibold text-gray-100">Audit</p>
              </div>

              <VersionPicker entry={entry} version={version} onVersion={setVersion} />
            </div>

            <About entry={entry} version={version} />

            {/* The built pathways, under the audit they are routes through.
                Planning is where they are worked on; here they are one more
                thing that is true of the program. */}
            <div className="flex flex-col gap-6 p-6">
              <div className="flex items-center justify-center gap-2.5">
                <Icon name="lightbulb" size={24} className="shrink-0 text-gray-80" />
                <p className="text-h400 font-semibold text-gray-100">Pathways Available</p>
              </div>
              {built.length === 0 ? (
                <p className="text-body-md text-gray-80">
                  Nobody has laid this program out term by term yet.
                </p>
              ) : (
                <div className="flex flex-wrap justify-center gap-4">
                  {built.map((pathway) => (
                    <PathwayCard key={pathway.name} pathway={pathway} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {tab === "audits" && (
          <Audits entry={entry} version={version} onVersion={setVersion} />
        )}
        {tab === "planning" && <Planning entry={entry} />}
      </Panel>
    </>
  )
}
