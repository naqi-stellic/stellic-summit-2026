import { cn } from "cn"
import { useId, useState, type ReactNode } from "react"

import { Icon, type IconName } from "@/components/icon"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/* The furniture Staff Home is assembled from. Both panels on the page — the
 * queue and the insights — are built out of these, which is what makes them
 * read as one page rather than as two features that happened to ship together. */

/* ============================================================ Section
   A titled band of the page that folds. The controls that belong to what is
   inside it sit on its heading rather than inside the panel, so the panel can
   start with its own tab bar and the eye finds search in the same place on
   every section. */

export function Section({
  title,
  controls,
  children,
}: {
  title: string
  /** Search, sort, "View All" — whatever acts on the whole section. */
  controls?: ReactNode
  children: ReactNode
}) {
  const [open, setOpen] = useState(true)
  const id = useId()

  return (
    <section className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={id}
          className="flex cursor-pointer items-center gap-[7px] text-caption-lg font-semibold text-gray-100 select-none"
        >
          <Icon
            name="expand-more"
            size={14}
            className={cn("text-gray-80 transition-transform", !open && "-rotate-90")}
          />
          {title}
        </button>
        <span className="flex-1" />
        {controls}
      </div>
      {open && <div id={id}>{children}</div>}
    </section>
  )
}

/** The white card both panels sit on, and the card the section's cards sit on
 *  is the same hairline — so nothing on the page is lifted above anything. */
export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-md border border-gray-40 bg-card shadow-xs", className)}>
      {children}
    </div>
  )
}

/* ============================================================ TabBar
   The underline tab bar at the head of a panel. Both panels carry one, with
   the same topics in the same order.

   A tab that has nothing waiting tucks into More rather than sitting there
   with a zero: a quiet queue should not take up the width a busy one needs.
   The bar renders even at a single tab, so a person whose work later grows a
   second one is not surprised by a bar appearing out of nowhere. */

export type Tab = { id: string; label: string; count?: number }

export function TabBar({
  tabs,
  more = [],
  active,
  onSelect,
  live,
}: {
  tabs: Tab[]
  more?: Tab[]
  active: string
  onSelect: (id: string) => void
  /** The tabs that lead somewhere. The rest are drawn exactly as they would be
   *  otherwise — they are part of the record and leaving them out would
   *  misrepresent it — but they do not pretend to open, because there is
   *  nothing behind them to open onto. Omitted, every tab leads somewhere. */
  live?: string[]
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-1 border-b border-gray-40 px-4">
      {tabs.map((tab) => {
        const on = tab.id === active
        const opens = !live || live.includes(tab.id)

        const shape = cn(
          "-mb-px flex items-center gap-[7px] border-b-2 px-3.5 pt-[15px] pb-[13px] text-caption-lg font-semibold whitespace-nowrap transition-colors",
          on ? "border-primary-50 text-primary-50" : "border-transparent text-gray-80",
          /* Not greyed and not disabled — an inert tab is an ordinary tab that
             happens to have nothing behind it. Only the pointer and the hover
             go, because those are the two things that promise otherwise. */
          opens && "cursor-pointer hover:text-gray-100"
        )

        const inside = (
          <>
            {tab.label}
            {!!tab.count && (
              <span
                className={cn(
                  "min-w-[18px] rounded-full px-1.5 text-center text-label-sm font-semibold",
                  on ? "bg-primary-0 text-primary-50" : "bg-gray-5 text-gray-100"
                )}
              >
                {tab.count}
              </span>
            )}
          </>
        )

        return opens ? (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            aria-current={on ? "page" : undefined}
            className={shape}
          >
            {inside}
          </button>
        ) : (
          <span key={tab.id} className={shape}>
            {inside}
          </span>
        )
      })}

      {more.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger className="-mb-px flex cursor-pointer items-center gap-1.5 border-b-2 border-transparent px-3.5 pt-[15px] pb-[13px] text-caption-lg font-medium whitespace-nowrap text-gray-80 hover:text-gray-100">
            More
            <Icon name="expand-more" size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[230px]">
            {more.map((tab) => (
              <DropdownMenuItem key={tab.id} onSelect={() => onSelect(tab.id)}>
                <span className="flex-1">{tab.label}</span>
                <span className="text-label-sm text-gray-60">0 open</span>
              </DropdownMenuItem>
            ))}
            <p className="px-2 pt-1 pb-1.5 text-label-sm text-gray-60">
              Quiet right now. These come back as tabs when new requests need you.
            </p>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

/* ============================================================ Controls */

/** The 30px search field that sits on a section heading. Shorter than the
 *  form input because it is furniture rather than a field to fill in. */
export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <label className="relative flex h-[30px] w-[210px] items-center rounded-md border border-input bg-card">
      <Icon name="s-search" size={14} className="absolute left-2.5 text-gray-60" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-full w-full min-w-0 bg-transparent pr-2.5 pl-8 text-label-md text-foreground placeholder:text-gray-60 focus:outline-none"
      />
    </label>
  )
}

/** An icon button that opens a list of one-of choices. A dot on the corner
 *  says a filter is on, because a funnel looks the same either way. */
export function MenuButton<T extends string>({
  icon,
  label,
  heading,
  options,
  value,
  onSelect,
  marked,
}: {
  icon: IconName
  label: string
  heading: string
  options: { id: T; label: string }[]
  value: T
  onSelect: (id: T) => void
  /** Whether the control is doing something to the list right now. */
  marked?: boolean
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={label}
        className="relative flex size-[30px] cursor-pointer items-center justify-center rounded-md border border-input bg-card text-gray-100 transition-colors hover:bg-gray-5"
      >
        <Icon name={icon} size={15} />
        {marked && (
          <span className="absolute -top-[3px] -right-[3px] size-2 rounded-full border-2 border-background bg-primary-50" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[212px]">
        <DropdownMenuLabel className="text-overline text-gray-60 uppercase">
          {heading}
        </DropdownMenuLabel>
        {options.map((option) => (
          <DropdownMenuItem key={option.id} onSelect={() => onSelect(option.id)}>
            <span className={cn("flex-1", option.id === value && "font-semibold")}>
              {option.label}
            </span>
            {option.id === value && <Icon name="check" size={14} className="text-primary-50" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* ============================================================ Empty */

export function EmptyState({
  title,
  detail,
  icon = "inbox",
}: {
  title: string
  detail: string
  icon?: IconName
}) {
  return (
    <div className="flex flex-col items-center gap-1 px-5 pt-13 pb-14 text-center">
      <span className="mb-2.5 flex size-11 items-center justify-center rounded-full bg-gray-5 text-gray-60">
        <Icon name={icon} size={20} />
      </span>
      <p className="text-caption-lg font-semibold text-gray-100">{title}</p>
      <p className="text-label-md text-gray-80">{detail}</p>
    </div>
  )
}

/* ============================================================ Avatar */

export function Face({
  initials,
  color,
  size = 32,
  className,
}: {
  initials: string
  color: string
  size?: number
  className?: string
}) {
  return (
    <span
      style={{ width: size, height: size, background: color, fontSize: size * 0.36 }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        className
      )}
    >
      {initials}
    </span>
  )
}
