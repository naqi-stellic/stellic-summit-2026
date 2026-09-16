import { cn } from "cn"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { jobsFor, type JobKey, type Persona } from "@/data/staff-home"

/* Customize your home page.
 *
 * Organised by the job, not by the section it lands in: a person turning
 * Appointments on is asking for their appointments, not for "a tab and a card
 * row". So the row says what the job brings in the words of the person turning
 * it on, and turning it on brings all of it.
 *
 * Only the jobs this person's permissions allow are listed. Offering a topic
 * nobody can act in would be a promise the page cannot keep.
 *
 * This is not an onboarding screen and nothing opens it on arrival. A new staff
 * member does not yet know what these words mean; what they arrive with is an
 * admin setting, and teaching them the page is its own piece of work. */

export function Customize({
  open,
  onOpenChange,
  persona,
  jobs,
  without,
  onToggle,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  persona: Persona
  jobs: Record<string, boolean>
  /** Jobs this prototype does not carry, so it does not offer them either. */
  without?: JobKey[]
  onToggle: (key: string, on: boolean) => void
}) {
  const available = jobsFor(persona.perms, without)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-md sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Customize your home page</DialogTitle>
          <DialogDescription className="text-body-md text-gray-80">
            Turn on the topics you work on. Home shows the open items waiting on you and the
            insights for each one. Anything you turn off stays available elsewhere in Stellic.
          </DialogDescription>
        </DialogHeader>

        <div className="-mx-1 flex max-h-[60vh] flex-col gap-2.5 overflow-y-auto px-1 py-1">
          {available.map((job) => {
            const on = !!jobs[job.key]

            return (
              <div
                key={job.key}
                className={cn(
                  "flex items-start gap-3.5 rounded-md border p-[13px] transition-colors",
                  on ? "border-primary-5 bg-primary-0/30" : "border-gray-40"
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-body-md font-semibold text-foreground">{job.name}</p>
                  <p className="mt-px text-label-md text-gray-80">{job.detail}</p>
                </div>
                <Switch
                  checked={on}
                  onCheckedChange={(next) => onToggle(job.key, next)}
                  aria-label={job.name}
                  className="mt-0.5"
                />
              </div>
            )
          })}
        </div>

        <DialogFooter>
          <Button variant="primary" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
