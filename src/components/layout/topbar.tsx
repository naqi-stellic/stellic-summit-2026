import { Icon } from "@/components/icon"

export function Topbar({ title }: { title: string }) {
  return (
    <header className="flex h-18 shrink-0 items-center justify-between border-b border-gray-40 bg-card px-6">
      {/* Pinned to a 24px top inset rather than optically centred, as designed. */}
      <h1 className="self-stretch pt-6 text-caption-lg font-semibold text-gray-100">{title}</h1>

      <div className="flex h-10 items-center gap-4">
        <div className="relative h-9 w-[312px] shrink-0 rounded-md border border-input bg-card">
          <div className="absolute top-[5px] right-[11px] left-[11px] h-6 overflow-hidden">
            <Icon
              name="s-search"
              size={20}
              className="absolute top-0.5 left-0 text-gray-60"
            />
            <p className="absolute top-0 right-1 left-7 text-field text-gray-80">Search</p>
          </div>
        </div>

        <button type="button" aria-label="Help" className="text-gray-100">
          <Icon name="s-help" size={24} />
        </button>
        <button type="button" aria-label="Notifications" className="text-gray-100">
          <Icon name="s-notification" size={24} />
        </button>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-40 text-field text-gray-0">
          CN
        </span>
      </div>
    </header>
  )
}
