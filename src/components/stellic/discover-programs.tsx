import { Icon } from "@/components/icon"

/* The way into the what-if. It sits at the foot of the audit, under the
 * courses the degree had no use for, which is where the question occurs to
 * you: this degree is accounted for, so what would another one make of the
 * same transcript.
 *
 * Drawn as the info banner the plan surfaces use — primary-0 on a primary rule
 * — but it is a control rather than a notice, so it is a button and not an
 * `Alert`: `role="alert"` would have a screen reader announce it on arrival,
 * and nothing here has happened. */

export function DiscoverPrograms({ onOpen }: { onOpen?: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      /* White, on the same hairline every card on the page carries. It had been
         a blue banner, which made it the loudest thing in the audit — it is an
         offer at the foot of a long read, not an announcement. The blue is down
         to the disc behind the glyph, and to the hover, which takes the disc's
         own primary-0 rather than the grey an inert card takes.
         px-[19px] py-[15px]: the design's 20 and 16, less the border. */
      className="flex w-full items-center gap-5 rounded-md border border-gray-40 bg-card px-[19px] py-[15px] text-left transition-colors hover:border-primary-50 hover:bg-primary-0"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-0 text-primary-50">
        <Icon name="s-search" size={16} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-body-md font-semibold text-gray-100">Discover other programs</span>
        <span className="text-body-md text-gray-80">
          Looking to add a minor, explore adding another major or just looking around. Click to
          find out your progress towards other programs
        </span>
      </span>
      <Icon name="chevron-right" size={20} className="shrink-0 text-gray-60" />
    </button>
  )
}
