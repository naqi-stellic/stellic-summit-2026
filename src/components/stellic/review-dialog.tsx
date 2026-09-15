import { useState, type ReactNode } from "react"

import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { STUDENT, termCredits, type Term, type Year } from "@/data/plan"
import {
  NOW,
  REFERENCE_PLANS,
  REVIEW_TYPES,
  reviewableYears,
  type Review,
  type ReviewType,
} from "@/data/review"

/* Asking for a review, in three steps: which terms, what kind of request, and
 * anything to say about it. Opened from a term rather than from the planner,
 * the first step has already been answered — the term is the request — so it
 * opens on the second. */

/** A labelled control with its explanation underneath, which is how every
 *  field in this dialog is built. */
function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <span className="text-body-md font-semibold text-foreground">{label}</span>
      {children}
      {hint && <span className="text-body-md text-gray-80">{hint}</span>}
    </div>
  )
}

/** The select the design uses: a bordered row with the current value and a
 *  chevron, opening onto the alternatives. */
function Picker({
  value,
  options,
  onChange,
  label,
}: {
  value: string
  options: string[]
  onChange: (next: string) => void
  label: string
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-md border border-input bg-card px-[11px] text-body-md text-foreground shadow-xs"
        >
          <span className="min-w-0 flex-1 truncate text-left">{value}</span>
          <Icon name="expand-more" size={16} className="shrink-0" />
        </button>
      </DropdownMenuTrigger>
      {/* As wide as the trigger, so the options line up under the value they
          are replacing. */}
      <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
        {options.map((option) => (
          <DropdownMenuItem
            key={option}
            onSelect={() => onChange(option)}
            className="gap-2 py-1.5 text-body-md"
          >
            {option}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function TermPick({
  term,
  checked,
  onToggle,
}: {
  term: Term
  checked: boolean
  onToggle: () => void
}) {
  return (
    <label className="flex min-w-0 cursor-pointer items-start gap-2">
      <span className="flex items-center py-0.5">
        <Checkbox checked={checked} onCheckedChange={onToggle} />
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-body-md text-foreground">{term.name}</span>
        <span className="text-body-md text-gray-80">
          {term.courses.length} course{term.courses.length === 1 ? "" : "s"},{" "}
          {termCredits(term)} credits
        </span>
      </span>
    </label>
  )
}

export function ReviewDialog({
  open,
  years,
  term,
  onClose,
  onSubmit,
}: {
  open: boolean
  years: Year[]
  /** Opened from a term: that term is the request, and the first step goes. */
  term?: Term | null
  onClose: () => void
  onSubmit: (review: Review) => void
}) {
  const groups = reviewableYears(years)
  const every = groups.flatMap((group) => group.terms.map((t) => t.id))
  /* From a term, the request is about that term. From the planner it starts
     with everything ahead ticked, so the student unticks rather than hunts. */
  const [picked, setPicked] = useState<string[]>(term ? [term.id] : every)
  const [plan, setPlan] = useState(REFERENCE_PLANS[0])
  const [type, setType] = useState<ReviewType>(REVIEW_TYPES[0])
  const [notes, setNotes] = useState("")
  const [step, setStep] = useState(term ? 2 : 1)

  if (!open) return null

  const chosen = groups.flatMap((group) => group.terms).filter((t) => picked.includes(t.id))
  const all = picked.length === every.length ? true : picked.length === 0 ? false : "indeterminate"

  function toggle(id: string) {
    setPicked((current) =>
      current.includes(id) ? current.filter((t) => t !== id) : [...current, id]
    )
  }

  function submit() {
    onSubmit({
      id: `review-${NOW.getTime()}`,
      plan,
      type,
      terms: chosen.map((t) => t.id),
      termNames: chosen.map((t) => t.name),
      notes,
      requestedAt: NOW,
      status: "pending",
      /* Filled in by the plan, which is what it is a signature of. */
      at: {},
    })
  }

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="gap-6 sm:max-w-[460px]" showCloseButton={false}>
        {/* Close on the first step, back on the others — the same place, so
            the corner always answers "not this". */}
        {step === 1 || term ? (
          <DialogClose className="cursor-pointer justify-self-start rounded-md text-gray-80 transition-colors hover:text-gray-100">
            <Icon name="close" size={24} />
            <span className="sr-only">Close</span>
          </DialogClose>
        ) : (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="cursor-pointer justify-self-start rounded-md text-gray-80 transition-colors hover:text-gray-100"
          >
            <Icon name="chevron-left" size={24} />
            <span className="sr-only">Back</span>
          </button>
        )}

        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle className="text-h400">Request Plan Review</DialogTitle>
            </DialogHeader>

            <Field label="Reference Plan" hint="Choose the plan that has the changes you want reviewed.">
              <Picker
                label="Reference plan"
                value={plan}
                options={REFERENCE_PLANS}
                onChange={setPlan}
              />
            </Field>

            <div className="flex w-full flex-col gap-2">
              <span className="text-body-md font-semibold text-foreground">{plan}</span>
              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={all}
                  onCheckedChange={() => setPicked(picked.length === every.length ? [] : every)}
                />
                <span className="text-body-md text-foreground">All terms</span>
              </label>
            </div>

            {/* Past and current terms are not here to be ticked: whatever an
                advisor would say about them, they have already happened. */}
            {groups.map((group) => (
              <div key={group.label} className="flex w-full flex-col gap-2">
                <span className="text-body-md font-semibold text-foreground">{group.label}</span>
                <div className="grid w-full grid-cols-2 gap-x-6 gap-y-2">
                  {group.terms.map((t) => (
                    <TermPick
                      key={t.id}
                      term={t}
                      checked={picked.includes(t.id)}
                      onToggle={() => toggle(t.id)}
                    />
                  ))}
                </div>
              </div>
            ))}

            <Button
              className="w-full"
              disabled={picked.length === 0}
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle className="text-h400">Select request</DialogTitle>
            </DialogHeader>

            <Field label="Review type" hint={type.blurb}>
              <Picker
                label="Review type"
                value={type.label}
                options={REVIEW_TYPES.map((t) => t.label)}
                onChange={(label) =>
                  setType(REVIEW_TYPES.find((t) => t.label === label) ?? REVIEW_TYPES[0])
                }
              />
            </Field>

            <Button className="w-full" onClick={() => setStep(3)}>
              Continue
            </Button>
          </>
        )}

        {step === 3 && (
          <>
            <DialogHeader className="gap-1.5">
              <DialogTitle className="text-h400">Initiate request</DialogTitle>
              <DialogDescription>
                {type.label} request for {STUDENT.username}
              </DialogDescription>
            </DialogHeader>

            <Field
              label="Notes"
              hint={`Goes to ${chosen.length === 1 ? chosen[0].name : `${chosen.length} terms`} with the request.`}
            >
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Anything your advisor should know before they look"
                className="h-[78px] resize-none px-3 py-2 text-body-md"
              />
            </Field>

            <Button variant="primary" className="w-full" onClick={submit}>
              Submit Request
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
