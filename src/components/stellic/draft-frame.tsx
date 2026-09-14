import { Icon } from "@/components/icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

/* The playground: while a generated draft is on the canvas the whole planner is
 * ringed in warning orange and topped with a bar that can only do two things —
 * take the draft or leave it. */

export function DraftBar({
  added,
  removed,
  onExit,
  onAccept,
}: {
  added: number
  removed: number
  onExit: () => void
  onAccept: () => void
}) {
  return (
    <div
      /* Border sits inside, so the bottom padding gives it back its pixel. */
      /* The tab hangs into this bar, so on a narrow screen the controls start
         below it rather than underneath it. */
      className="animate-settle flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-gray-40 bg-warning-5 px-4 pt-3 pb-[11px] max-md:pt-10"
    >
      <Button onClick={onExit}>
        <Icon name="keyboard-backspace" size={16} />
        Exit
      </Button>

      <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
        <div className="flex items-center gap-1">
          <Badge variant="success">+{added} added</Badge>
          {removed > 0 && <Badge variant="danger">-{removed} removed</Badge>}
        </div>
        <Button variant="primary" onClick={onAccept}>
          Accept draft
        </Button>
      </div>
    </div>
  )
}

/** The ring around the canvas and the tab hanging from its top edge. Drawn over
 *  the planner rather than around it, so nothing below it shifts when a draft
 *  appears. */
export function DraftOutline() {
  return (
    <div aria-hidden="true" className="animate-fade pointer-events-none absolute inset-0 z-10">
      <div className="absolute inset-0 border-[3px] border-warning-50" />
      <Badge
        variant="secondary"
        className="absolute top-[3px] left-1/2 -translate-x-1/2 rounded-t-none bg-warning-50 text-white"
      >
        <Icon name="design-services" size={12} />
        <span className="text-body-md font-semibold">Generated plan</span>
      </Badge>
    </div>
  )
}
