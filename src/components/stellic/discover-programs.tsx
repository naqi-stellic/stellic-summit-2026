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
      /* Wider than the Alert's padding: it is a banner the width of the audit
         rather than a notice inside a card, and 32 is what holds the two lines
         off its edges. Both numbers are the design's, less the border it draws
         inside.

         The rule is primary-5 rather than the info banner's primary-100. A
         plan's banner is telling you something; this one is offering, and a
         dark edge round an offer reads as a warning. */
      className="flex w-full items-center gap-8 rounded-md border border-primary-5 bg-primary-0 px-[31px] py-[19px] text-left transition-colors hover:bg-primary-5"
    >
      <Icon name="s-search" size={16} className="shrink-0 text-primary-50" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-body-md font-semibold text-gray-100">Discover other programs</span>
        <span className="text-body-md text-gray-80">
          Looking to add a minor, explore adding another major or just looking around. Click to
          find out your progress towards other programs
        </span>
      </span>
      <Icon name="chevron-right" size={20} className="shrink-0 text-gray-100" />
    </button>
  )
}
