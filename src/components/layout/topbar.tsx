import { Icon } from "@/components/icon"

export function Topbar({ title }: { title: string }) {
  /* The shell never scrolls, so this stays put structurally — no sticky. */
  return (
    <header className="flex h-18 shrink-0 items-center justify-between gap-4 border-b border-gray-40 bg-card px-6 max-md:px-4">
      {/* Pinned to a 24px top inset rather than optically centred, as designed. */}
      <h1 className="min-w-0 self-stretch truncate pt-6 text-caption-lg font-semibold text-gray-100">
        {title}
      </h1>

      <div className="flex h-10 min-w-0 items-center gap-4">
        {/* The search field is the first thing to go when the bar runs out of
            room; the account and alerts are what you still need. */}
        <div className="relative h-9 w-[312px] shrink-0 rounded-md border border-input bg-card max-lg:w-[200px] max-md:hidden">
          <div className="absolute top-[5px] right-[11px] left-[11px] h-6 overflow-hidden">
            <Icon
              name="s-search"
              size={20}
              className="absolute top-0.5 left-0 text-gray-60"
            />
            <p className="absolute top-0 right-1 left-7 text-field text-gray-80">Search</p>
          </div>
        </div>

        <button type="button" aria-label="Help" className="shrink-0 text-gray-100 max-sm:hidden">
          <Icon name="s-help" size={24} />
        </button>
        <button type="button" aria-label="Notifications" className="shrink-0 text-gray-100">
          <Icon name="s-notification" size={24} />
        </button>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-40 text-field text-gray-0">
          CN
        </span>
      </div>
    </header>
  )
}
