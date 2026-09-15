import { cn } from "cn"
import { useState } from "react"

import { Icon } from "@/components/icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/* The playground: while a generated draft is on the canvas the whole planner is
 * ringed in warning orange and topped with a bar that can only do two things —
 * take the draft or leave it. */

export function DraftBar({
  added,
  removed,
  showRemoved,
  terms,
  pending,
  leaving,
  onExit,
  onAccept,
}: {
  added: number
  removed: number
  /** Whether this draft takes anything out at all. The count itself climbs
   *  from zero as the plan lands, so it cannot answer that on its own. */
  showRemoved: boolean
  /** How many terms the draft touches, for the confirmation. */
  terms: number
  /** The frame is up but the plan has not arrived yet: the bar is there to be
   *  filled, and there is nothing to apply or leave until it is. */
  pending?: boolean
  /** The draft is being accepted: the bar waits for the plan to settle, then
   *  sees itself out. */
  leaving?: boolean
  onExit: () => void
  onAccept: () => void
}) {
  /* Applying rewrites the plan, so it asks once — with the count, which is the
   * thing worth checking before saying yes. */
  const [confirming, setConfirming] = useState(false)

  return (
    <div
      /* Border sits inside, so the bottom padding gives it back its pixel. */
      /* The tab hangs into this bar, so on a narrow screen the controls start
         below it rather than underneath it. */
      className={cn(
        "flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-gray-40 bg-warning-5 px-4 pt-3 pb-[11px] max-md:pt-10",
        /* An animation rather than a transition: these elements came in on one
           that is still filling forwards, and a filled animation outranks any
           transition on the same property. The half-second wait is in the
           keyframe shorthand, so the plan settles before the frame goes. */
        leaving ? "animate-dissolve pointer-events-none" : "animate-settle"
      )}
    >
      <Button disabled={leaving || pending} onClick={onExit}>
        <Icon name="keyboard-backspace" size={16} />
        Exit
      </Button>

      <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
        <div className="flex items-center gap-1">
          <Badge variant="success">+{added} added</Badge>
          {showRemoved && <Badge variant="danger">-{removed} removed</Badge>}
        </div>
        <Button variant="primary" disabled={leaving || pending} onClick={() => setConfirming(true)}>
          Apply plan
        </Button>
      </div>

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Apply this plan?</DialogTitle>
            <DialogDescription>
              Adds {added} course{added === 1 ? "" : "s"}
              {removed > 0 && ` and removes ${removed}`}, across {terms} term
              {terms === 1 ? "" : "s"}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setConfirming(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                setConfirming(false)
                onAccept()
              }}
            >
              Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/** The ring around the canvas and the tab hanging from its top edge. Drawn over
 *  the planner rather than around it, so nothing below it shifts when a draft
 *  appears. */
export function DraftOutline({ leaving, pending }: { leaving?: boolean; pending?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        /* Above the plan's own sticky toolbar, which holds at z-20: the frame
           is drawn around everything, and a header sliding over its edge would
           break the one thing the frame is for. */
        "pointer-events-none absolute inset-0 z-30",
        leaving ? "animate-dissolve" : "animate-fade"
      )}
    >
      <div className="absolute inset-0 border-[3px] border-warning-50" />
      <Badge
        variant="secondary"
        className="absolute top-[3px] left-1/2 -translate-x-1/2 rounded-t-none bg-warning-50 text-white"
      >
        <Icon name="design-services" size={12} />
        <span className="text-body-md font-semibold">
          {pending ? "Generating plan" : "Generated plan"}
        </span>
      </Badge>
    </div>
  )
}
