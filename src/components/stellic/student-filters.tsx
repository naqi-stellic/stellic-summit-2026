import { cn } from "cn"
import { useEffect, useRef, useState, type ReactNode } from "react"

import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { QUERY, type Applied } from "@/data/students"

/* The two filters that do something.
 *
 * Eighteen of the twenty are named and inert, because how many ways in there
 * are is the information on this screen. These two are the question the
 * compliance screen leaves you with — Scott is short on the year-two check, so
 * who else is? — and they are the ones worth being able to ask.
 *
 * They fill themselves in. Clicking into the first field types the answer out
 * and then goes on to the next one, which is a stage affordance and not a
 * product behaviour: a query with four parts is four dropdowns to drive on a
 * projector, and nobody wants to watch that. What it is doing is honest —
 * every field ends up holding what somebody would have typed. */

const CHAR_MS = 38
const BEAT = 420

const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms))

/** A sequence that stops if the popover goes away mid-run. */
function useScript() {
  const alive = useRef(true)
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  const type = async (text: string, set: (value: string) => void) => {
    for (let i = 1; i <= text.length; i += 1) {
      if (!alive.current) return false
      set(text.slice(0, i))
      await sleep(CHAR_MS)
    }
    return alive.current
  }

  const wait = async (ms = BEAT) => {
    await sleep(ms)
    return alive.current
  }

  return { type, wait }
}

/* ---------------------------------------------------------------- pieces */

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-body-md text-gray-100">{label}</span>
    {children}
  </label>
)

/** A search field. The Input carries the box; the glyph sits in its padding
 *  rather than beside it, so a field you search and a field you type read as
 *  the same field. */
function SearchBox({
  value,
  placeholder,
  muted,
  readOnly,
  onFocus,
  onClick,
}: {
  value?: string
  placeholder: string
  /** Nothing can be typed here yet — it is waiting on another answer. */
  muted?: boolean
  readOnly?: boolean
  onFocus?: () => void
  onClick?: () => void
}) {
  return (
    <span className="relative flex items-center">
      <Icon name="s-search" size={14} className="pointer-events-none absolute left-3 text-gray-60" />
      <Input
        value={value ?? ""}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={muted}
        onFocus={onFocus}
        onClick={onClick}
        onChange={() => {}}
        className={cn("pl-9 text-body-md", muted && "bg-gray-5 opacity-100")}
      />
    </span>
  )
}

/** A search field that has been answered: the answer sits in it as a value with
 *  a way to take it out again. */
function Chosen({ value, onClear }: { value: string; onClear: () => void }) {
  return (
    <span className="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-card px-3 text-body-md shadow-xs">
      <span className="min-w-0 truncate text-foreground">{value}</span>
      <button
        type="button"
        onClick={onClear}
        aria-label={`Clear ${value}`}
        className="shrink-0 cursor-pointer text-gray-80 hover:text-gray-100"
      >
        <Icon name="close" size={12} />
      </button>
    </span>
  )
}

/** What the typing is matching against, while it is still typing. */
function Suggestion({ value }: { value: string }) {
  return (
    <div className="absolute inset-x-0 top-full z-10 mt-1 rounded-md border border-gray-40 bg-card p-1 shadow-secondary">
      <span className="flex items-center justify-between gap-2 rounded-md bg-gray-5 px-2 py-1.5 text-body-md text-foreground">
        {value}
        <Icon name="check" size={14} className="text-primary-50" />
      </span>
    </div>
  )
}

/** One of a fixed set. Same box as the fields above it, because choosing and
 *  typing are the same gesture as far as the form is concerned. */
function Choose({
  value,
  onChange,
  options,
  placeholder,
  className,
}: {
  value?: string
  onChange?: (value: string) => void
  options: string[]
  placeholder?: string
  className?: string
}) {
  return (
    <Select value={value} onValueChange={onChange} defaultValue={value ? undefined : options[0]}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/* ---------------------------------------------------------------- remaining */

export function RemainingFilter({
  on,
  onApply,
  onClear,
}: {
  on: boolean
  onApply: () => void
  onClear: () => void
}) {
  const { type, wait } = useScript()
  const [open, setOpen] = useState(false)
  const [program, setProgram] = useState("")
  const [programSet, setProgramSet] = useState(false)
  const [requirement, setRequirement] = useState("")
  const [requirementSet, setRequirementSet] = useState(false)
  const [audit, setAudit] = useState("Official")
  const [running, setRunning] = useState(false)

  /* Clicking into the program field is the whole gesture: it answers itself,
     then answers everything that depended on it. */
  const run = async () => {
    if (running || programSet) return
    setRunning(true)

    if (!(await type(QUERY.program, setProgram))) return
    if (!(await wait())) return
    setProgramSet(true)
    if (!(await wait(300))) return

    if (!(await type(QUERY.requirement, setRequirement))) return
    if (!(await wait())) return
    setRequirementSet(true)
    if (!(await wait(300))) return

    setAudit(QUERY.audit)
    if (!(await wait(500))) return

    onApply()
    setRunning(false)
  }

  const reset = () => {
    setProgram("")
    setProgramSet(false)
    setRequirement("")
    setRequirementSet(false)
    setAudit("Official")
    onClear()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" aria-pressed={on}>
          Remaining
          {on && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear the Remaining filter"
              onClick={(event) => {
                event.stopPropagation()
                reset()
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return
                event.stopPropagation()
                reset()
              }}
              className="cursor-pointer"
            >
              <Icon name="close" size={12} />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[288px] p-4">
        <div className="flex flex-col gap-4">
          <Field label="Number of requirements remaining">
            <span className="flex gap-2">
              <Input placeholder="e.g 3-5 or >3" className="min-w-0 flex-1 text-body-md" />
              <Choose options={["requirements", "credits"]} className="w-[124px]" />
            </span>
          </Field>

          <Field label="Specific courses remaining">
            <SearchBox placeholder="Search Courses" readOnly />
          </Field>

          {/* A requirement belongs to a program, so the program comes first —
              and the program this one is given is a compliance ruleset, which
              is the whole claim: a ruleset is auditable like a program, so it
              is searchable like one. */}
          <Field label="Program">
            {programSet ? (
              <Chosen value={program} onClear={reset} />
            ) : (
              <span className="relative block">
                <SearchBox
                  value={program}
                  placeholder="Search Programs"
                  readOnly
                  onFocus={run}
                  onClick={run}
                />
                {program && <Suggestion value={QUERY.program} />}
              </span>
            )}
          </Field>

          <Field label="Specific requirement">
            {requirementSet ? (
              <Chosen value={requirement} onClear={() => setRequirementSet(false)} />
            ) : (
              <span className="relative block">
                <SearchBox
                  value={requirement}
                  placeholder={programSet ? "Search requirements" : "Pick a Program first"}
                  muted={!programSet}
                  readOnly
                />
                {requirement && <Suggestion value={QUERY.requirement} />}
              </span>
            )}
          </Field>

          <Field label="Audit Version">
            <Choose value={audit} onChange={setAudit} options={["Official", "Planned"]} />
          </Field>

          <Field label="Credential">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bs-business">B.S. Business</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Program level">
            <Choose options={["All program levels", "Undergraduate", "Graduate"]} />
          </Field>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/* ---------------------------------------------------------------- demographics */

export function DemographicsFilter({
  on,
  onApply,
  onClear,
}: {
  on: boolean
  onApply: () => void
  onClear: () => void
}) {
  const { type, wait } = useScript()
  const [open, setOpen] = useState(false)
  const [year, setYear] = useState("")
  const [yearSet, setYearSet] = useState(false)
  const [running, setRunning] = useState(false)

  const run = async () => {
    if (running || yearSet) return
    setRunning(true)
    if (!(await type(String(QUERY.entryYear), setYear))) return
    if (!(await wait())) return
    setYearSet(true)
    if (!(await wait(400))) return
    onApply()
    setRunning(false)
  }

  const reset = () => {
    setYear("")
    setYearSet(false)
    onClear()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" aria-pressed={on}>
          Demographics
          {on && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear the Demographics filter"
              onClick={(event) => {
                event.stopPropagation()
                reset()
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return
                event.stopPropagation()
                reset()
              }}
              className="cursor-pointer"
            >
              <Icon name="close" size={12} />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[288px] p-4">
        <div className="flex flex-col gap-4">
          <Field label="Entry year">
            {yearSet ? (
              <Chosen value={year} onClear={reset} />
            ) : (
              <span className="relative block">
                <SearchBox
                  value={year}
                  placeholder="Search entry years"
                  readOnly
                  onFocus={run}
                  onClick={run}
                />
                {year && <Suggestion value={String(QUERY.entryYear)} />}
              </span>
            )}
          </Field>

          <Field label="Level">
            <Choose options={["All levels", "Undergrad", "Graduate"]} />
          </Field>

          <Field label="Campus">
            <Choose options={["All campuses", "Main campus"]} />
          </Field>

          <Field label="Student tags">
            <SearchBox placeholder="Search tags" readOnly />
          </Field>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/* ---------------------------------------------------------------- applied */

/** What is narrowing the list, said as a sentence apiece, with the two things
 *  you can do about it: undo it, or keep it. "save as report" is how a query
 *  becomes one of the cards above — the screen loops back on itself. */
export function AppliedFilters({
  applied,
  onReset,
  onSave,
}: {
  applied: Applied
  onReset: () => void
  onSave: () => void
}) {
  const pills = [
    applied.requirement &&
      `Remaining ${QUERY.requirement} in ${QUERY.program} · ${QUERY.audit} audit`,
    applied.entryYear && `Entry year ${QUERY.entryYear}`,
  ].filter(Boolean) as string[]

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-gray-40 px-6 py-3.5">
      {pills.map((pill) => (
        <span
          key={pill}
          className="flex items-center gap-2 rounded-full bg-primary-0 px-3.5 py-1.5 text-body-md text-primary-50"
        >
          {pill}
          <button
            type="button"
            onClick={onReset}
            aria-label={`Remove ${pill}`}
            className="cursor-pointer hover:text-primary-100"
          >
            <Icon name="close" size={12} />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onReset}
        className="cursor-pointer rounded-full bg-gray-5 px-3.5 py-1.5 text-body-md text-gray-100 hover:bg-gray-40"
      >
        reset all filters
      </button>
      <button
        type="button"
        onClick={onSave}
        className="cursor-pointer rounded-full bg-gray-5 px-3.5 py-1.5 text-body-md text-gray-100 hover:bg-gray-40"
      >
        save as report
      </button>
    </div>
  )
}
