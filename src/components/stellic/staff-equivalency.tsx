import { useState } from "react"

import { Icon } from "@/components/icon"
import { AddSlot } from "@/components/stellic/primitives"
import { Panel } from "@/components/stellic/staff-chrome"
import { CourseDetails } from "@/components/stellic/staff-course-details"
import { useToast } from "@/components/stellic/staff-toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  ARTICULATION_STATUS,
  RULE_DEFAULTS,
  type Articulation,
  type ArticulationStatus,
  type Course,
  type Suggestion,
} from "@/data/staff-insights"

/* Create new equivalency.
 *
 * What the Transfers insight was pointing at. The insight says a course keeps
 * being articulated by hand; this is the rule that stops it, and the form is
 * the argument for why Stellic should be trusted to draft it.
 *
 * So the page is not an empty form. The incoming course is already on the left,
 * and the right-hand column arrives holding Stellic's proposals — each one a
 * dashed card with an Add, a Hide, and, behind the badge, the evidence it was
 * proposed from. Adding one turns it into an ordinary course on the rule.
 * Nothing is decided until it is, which is the whole difference between a
 * suggestion and a default. */

const HOME = "Stellic University"

/* ---------------------------------------------------------------- cards */

/** A course that is on the rule. Solid, like anything else that has been
 *  decided, and removable. */
function CourseCard({ course, onRemove }: { course: Course; onRemove: () => void }) {
  const toast = useToast()

  return (
    <div className="flex items-start gap-3 rounded-md border border-gray-40 bg-card p-[15px]">
      <div className="min-w-0 flex-1">
        <p className="text-body-md text-foreground">{course.code}</p>
        <p className="mt-0.5 text-body-md text-gray-80">{course.name}</p>
        <button
          type="button"
          onClick={() => toast("Opens the advanced options for this course. (Exists in the real app)")}
          className="mt-2 flex cursor-pointer items-center gap-1 text-body-md text-gray-80 hover:text-gray-100"
        >
          Advanced
          <Icon name="chevron-right" size={12} />
        </button>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${course.code}`}
        className="shrink-0 cursor-pointer text-gray-80 hover:text-gray-100"
      >
        <Icon name="close" size={14} />
      </button>
    </div>
  )
}

/** A course Stellic is proposing. Dashed, because nothing about it is settled,
 *  and the badge carries the reason rather than asking you to take it on
 *  faith — a suggestion that cannot say why is just an instruction. */
function SuggestionCard({
  suggestion,
  onAdd,
  onHide,
}: {
  suggestion: Suggestion
  onAdd: () => void
  onHide: () => void
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-dashed border-gray-40 bg-gray-0 p-[15px]">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 text-body-md text-foreground">{suggestion.code}</p>
        <Tooltip>
          <TooltipTrigger className="flex shrink-0 cursor-help items-center gap-1.5 rounded-md bg-primary-0 px-2 py-0.5 text-label-md font-medium text-primary-50">
            <Icon name="auto-awesome" size={12} />
            Suggestion
          </TooltipTrigger>
          <TooltipContent className="max-w-[280px]">{suggestion.because}</TooltipContent>
        </Tooltip>
      </div>
      <p className="text-body-md text-gray-80">{suggestion.name}</p>
      <div className="flex items-center gap-2 pt-1">
        <Button size="sm" onClick={onAdd}>
          Add
        </Button>
        <Button size="sm" onClick={onHide}>
          Hide
        </Button>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- impact */

/** Nothing has happened yet. A rule is not one decision about one student, it
 *  is one decision about everybody the rule catches — so the count comes before
 *  the button, and the list of who they are is one click away. */
function ImpactDialog({
  open,
  onOpenChange,
  row,
  home,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: Articulation
  /** The home courses on the rule as it stands. */
  home: Course[]
  onCreate: (status: ArticulationStatus) => void
}) {
  const toast = useToast()
  const [status, setStatus] = useState<ArticulationStatus>("pending")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="rounded-md sm:max-w-[460px]"
        /* Opening on the download link put a focus ring around it. The content
           itself takes the focus instead, which still announces the dialog. */
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Create equivalency rule</DialogTitle>
          <DialogDescription className="text-body-md text-gray-80">
            Review the impact before this rule goes live.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-body-md font-semibold text-foreground">{row.institution}</p>
            <p className="mt-1 text-body-md text-foreground">{row.from.code}</p>
            <p className="text-body-md text-gray-80">{row.from.name}</p>
          </div>
          <Icon name="east" size={16} className="mt-7 shrink-0 text-gray-80" />
          <div className="min-w-0 flex-1">
            <p className="text-body-md font-semibold text-foreground">{HOME}</p>
            {home.length ? (
              home.map((course) => (
                <div key={course.code} className="mt-1">
                  <p className="text-body-md text-foreground">{course.code}</p>
                  <p className="text-body-md text-gray-80">{course.name}</p>
                </div>
              ))
            ) : (
              <p className="mt-1 text-body-md text-gray-80">Nothing yet</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-md bg-gray-5 p-3">
          <p className="text-body-md font-semibold text-foreground">Students</p>
          <p className="pl-4 text-body-md text-foreground">
            · <span className="font-semibold">{row.pending} students</span> will have articulations
            created by this rule
          </p>
          <button
            type="button"
            onClick={() => toast("Downloads the affected usernames. (Exists in the real app)")}
            className="flex cursor-pointer items-center gap-2 text-body-md text-foreground underline [text-underline-position:from-font]"
          >
            <Icon name="file-upload" size={14} className="rotate-180" />
            Download affected student usernames
          </button>
        </div>

        <div className="border-t border-gray-40 pt-4">
          <p className="text-body-md font-semibold text-foreground">Set articulation status</p>
          <RadioGroup
            value={status}
            onValueChange={(value) => setStatus(value as ArticulationStatus)}
            className="mt-3 gap-3"
          >
            {ARTICULATION_STATUS.map((option) => (
              <label key={option.id} className="flex cursor-pointer items-start gap-2.5">
                <RadioGroupItem value={option.id} className="mt-0.5" />
                <span className="min-w-0 flex-1">
                  <span className="block text-body-md text-foreground">{option.label}</span>
                  <span className="block text-body-md text-gray-80">{option.detail}</span>
                </span>
              </label>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter className="sm:justify-start">
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="primary" className="flex-1" onClick={() => onCreate(status)}>
            Create rule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ---------------------------------------------------------------- the page */

export function CreateEquivalency({
  row,
  onCancel,
  onCreate,
}: {
  row: Articulation
  onCancel: () => void
  /** The rule is written. Say how many articulations it swept up and in what
   *  state, so the toast can be specific about what just changed. */
  onCreate: (count: number, status: ArticulationStatus) => void
}) {
  const toast = useToast()
  /* The rule opens with nothing accepted — every home course on it is one
     Stellic has proposed and nobody has agreed to yet. */
  const [added, setAdded] = useState<Course[]>([])
  const [dropped, setDropped] = useState(false)
  const [source, setSource] = useState([row.from])
  const [reviewing, setReviewing] = useState(false)
  const [looking, setLooking] = useState(false)
  /* Bumped on every open so the lookup mounts fresh and runs again, rather
     than reopening onto the last answer. */
  const [run, setRun] = useState(0)

  /* One suggestion, the one the insight row named. It is offered until it is
     taken or put away, and then the column is whatever is on the rule. */
  const offered = dropped || added.length ? null : row.suggestion

  const elsewhere = (what: string) => toast(`${what} (Exists in the real app)`)

  return (
    <main className="@container min-w-0 flex-1 overflow-y-auto px-6 pt-8 pb-24">
      <div className="mx-auto flex w-full max-w-[1024px] flex-col gap-4">
        <Panel className="flex flex-wrap items-start justify-between gap-4 p-6">
          <div className="min-w-0">
            <h2 className="text-h300 font-semibold text-gray-100">Create new equivalency</h2>
            <p className="mt-1 text-body-md text-gray-80">
              Create equivalency rules to help students transfer credits from their source
              institution to your school.{" "}
              <button
                type="button"
                onClick={() => elsewhere("Opens the equivalency documentation.")}
                className="cursor-pointer underline [text-underline-position:from-font]"
              >
                Learn more
              </button>
            </p>
          </div>
          <Button variant="primary" onClick={() => setReviewing(true)}>
            Save
          </Button>
        </Panel>

        <Panel className="grid grid-cols-1 gap-6 p-6 @3xl:grid-cols-[1fr_auto_1fr]">
          {/* ------------------------------------------------ source */}
          <div className="flex min-w-0 flex-col gap-2">
            <p className="text-body-md font-semibold text-foreground">Source Institution</p>
            <Input value={row.institution} readOnly aria-label="Source institution" />
            <div className="mt-2 flex flex-col gap-2">
              {source.map((course) => (
                <CourseCard
                  key={course.code}
                  course={course}
                  onRemove={() => setSource((all) => all.filter((other) => other !== course))}
                />
              ))}
              <AddSlot onClick={() => elsewhere("Opens the course picker.")}>
                <span className="flex items-center gap-1.5 text-body-md text-gray-80">
                  <Icon name="add" size={12} />
                  <span className="underline [text-underline-position:from-font]">Add Course</span>
                </span>
              </AddSlot>
              {/* The slow half of the job: what this course actually was at
                  the other institution. The answer opens where the button is,
                  beneath the course it is about. */}
              {looking ? (
                <CourseDetails
                  key={run}
                  institution={row.institution}
                  code={row.from.code}
                  match={row.details}
                  onClose={() => setLooking(false)}
                />
              ) : (
                <Button
                  onClick={() => {
                    setRun((n) => n + 1)
                    setLooking(true)
                  }}
                >
                  <Icon name="auto-awesome" size={14} />
                  View course details
                </Button>
              )}
            </div>
          </div>

          {/* The direction of the claim: what they took, then what it counts
              for here. It reads against both columns rather than against the
              first card in them, so it sits at the middle of the block however
              tall either side grows. */}
          <Icon
            name="east"
            size={16}
            className="shrink-0 self-center text-gray-80 @max-3xl:hidden"
          />

          {/* ------------------------------------------------ home */}
          <div className="flex min-w-0 flex-col gap-2">
            <p className="flex items-center gap-2 text-body-md font-semibold text-foreground">
              <Icon name="s-home" size={14} />
              Home Institution
            </p>
            {/* Not a choice: a rule written here is written for here. */}
            <Input value={HOME} readOnly disabled aria-label="Home institution" />
            <div className="mt-2 flex flex-col gap-2">
              {added.map((course) => (
                <CourseCard
                  key={course.code}
                  course={course}
                  onRemove={() => {
                    setAdded((all) => all.filter((other) => other.code !== course.code))
                    setDropped(true)
                  }}
                />
              ))}
              {offered && (
                <SuggestionCard
                  suggestion={offered}
                  onAdd={() => setAdded([{ code: offered.code, name: offered.name }])}
                  onHide={() => setDropped(true)}
                />
              )}
              <AddSlot>
                <span className="flex flex-wrap items-center justify-center gap-1.5 text-body-md text-gray-80">
                  <Icon name="add" size={12} />
                  <button
                    type="button"
                    onClick={() => elsewhere("Opens the course picker.")}
                    className="cursor-pointer underline [text-underline-position:from-font]"
                  >
                    Add Course
                  </button>
                  or
                  <button
                    type="button"
                    onClick={() => elsewhere("Opens the requirement waiver picker.")}
                    className="cursor-pointer underline [text-underline-position:from-font]"
                  >
                    Waive Requirements
                  </button>
                </span>
              </AddSlot>
              <button
                type="button"
                onClick={() => elsewhere("Opens the student tag picker.")}
                className="flex cursor-pointer items-center gap-1.5 self-start pt-1 text-body-md text-gray-80"
              >
                <Icon name="add" size={12} />
                <span className="underline [text-underline-position:from-font]">
                  Add student tags
                </span>
              </button>
            </div>
          </div>
        </Panel>

        {/* The institution's own defaults, stated rather than asked. A form
            that asked four questions everybody answers the same way would be
            four questions long for no reason. */}
        <Panel className="flex flex-col gap-2 p-6">
          <p className="text-body-md font-semibold text-foreground">More about this rule</p>
          {RULE_DEFAULTS.map(([label, value]) => (
            <p key={label} className="text-body-md text-gray-80">
              <span className="font-semibold text-foreground">{label}:</span> {value}
            </p>
          ))}
          <button
            type="button"
            onClick={() => elsewhere("Opens the rule's advanced settings.")}
            className="mt-1 cursor-pointer self-start text-body-md text-gray-80 underline [text-underline-position:from-font]"
          >
            Customize
          </button>
        </Panel>

        <Panel className="flex flex-col gap-5 p-6">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="articulated-note"
              className="text-body-md font-semibold text-foreground"
            >
              Default notes when articulated (optional)
            </label>
            <Textarea
              id="articulated-note"
              rows={4}
              placeholder="Leave a note that travels with every articulation this rule creates"
            />
            <p className="text-body-md text-gray-80">
              This note is visible to all users who can view this equivalency
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="private-note" className="text-body-md font-semibold text-foreground">
              Private Notes (optional)
            </label>
            <Textarea
              id="private-note"
              rows={4}
              placeholder="Leave notes for this new equivalency"
            />
            <p className="text-body-md text-gray-80">
              This note is visible only to users with edit access to this rule
            </p>
          </div>
        </Panel>

        <div className="flex items-center justify-center gap-2 pt-2">
          <Button onClick={onCancel}>Cancel</Button>
          <Button variant="primary" onClick={() => setReviewing(true)}>
            Save
          </Button>
        </div>
      </div>

      <ImpactDialog
        open={reviewing}
        onOpenChange={setReviewing}
        row={row}
        home={added}
        onCreate={(status) => {
          setReviewing(false)
          onCreate(row.pending, status)
        }}
      />
    </main>
  )
}
