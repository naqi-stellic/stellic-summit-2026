import { cn } from "cn"

import { Icon, type IconName } from "@/components/icon"
import { Badge } from "@/components/ui/badge"

type NavItem = {
  label: string
  /** 8x8 glyph inside the 16x16 ring; omitted items keep the ring as a spacer. */
  glyph?: IconName
  /** Ring reserved but invisible, so labels stay on one alignment. */
  spacerRing?: boolean
  trailing?: IconName
  strong?: boolean
  sub?: boolean
  active?: boolean
  badge?: string
}

/* Which product the page belongs to. The nav is the same nav either way — what
 * differs is the row you are standing on, and whether Schedule is opened onto
 * its terms, which it is only where a term is what you came to work on. */
export type NavSection = "plan" | "progress" | "staff"

const SCHEDULE: NavItem = {
  label: "Schedule",
  glyph: "calendar-today",
  trailing: "expand-more",
}

const TERMS: NavItem[] = [
  { label: "Fall 2027", spacerRing: true, badge: "In Progress" },
  { label: "Spring 2028", spacerRing: true },
  { label: "Fall 2028", spacerRing: true },
  { label: "Spring 2029", spacerRing: true },
]

const EXPLORE: NavItem[] = [
  { label: "Explore", strong: true, trailing: "s-arrow-down-fill" },
  { label: "Courses", strong: true, sub: true },
  { label: "Pathways", strong: true, sub: true },
  { label: "Programs", strong: true, sub: true },
]

/* The staff side of the product is a different nav altogether: it is a list of
   everything there is, not a path through one student's degree. */
const STAFF: NavItem[] = [
  { label: "Students", glyph: "s-check", strong: true, active: true },
  { label: "Programs", strong: true },
  { label: "Courses", strong: true },
  { label: "Pathways", strong: true },
  { label: "Appointments", strong: true },
  { label: "Transfer", strong: true },
  { label: "Requests", strong: true },
  { label: "Reviews", strong: true },
  { label: "Staff", strong: true },
  { label: "Analytics", strong: true },
]

function nav(section: NavSection): NavItem[] {
  if (section === "staff") return STAFF

  const here = (label: string) => label === (section === "plan" ? "Plan Your Path" : "Track Progress")

  return [
    { label: "Home", glyph: "s-home" },
    { label: "Track Progress", glyph: "s-check", strong: true, active: here("Track Progress") },
    SCHEDULE,
    /* Opened onto its terms on the plan surfaces, where a term is the thing
       you came to work on; closed everywhere else. */
    ...(section === "plan" ? TERMS : []),
    { label: "Plan Your Path", glyph: "s-navigation", strong: true, active: here("Plan Your Path") },
    ...EXPLORE,
  ]
}

const QUICK_LINKS = [
  "Academic Calendar",
  "Appointments",
  "Your Notifications",
  "Manage Settings",
  "Report an issue",
]

function NavRing({ item }: { item: NavItem }) {
  if (!item.glyph && !item.spacerRing) return null

  return (
    <span
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-full border border-white",
        item.spacerRing && "opacity-0"
      )}
    >
      {item.glyph && <Icon name={item.glyph} size={8} />}
    </span>
  )
}

export function Sidebar({ section = "plan" }: { section?: NavSection }) {
  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col gap-4 bg-gray-100 text-white">
      <div className="flex h-18 shrink-0 items-start border-b border-gray-40 bg-parchment p-5">
        <div className="flex min-w-0 flex-1 items-center justify-between">
          <img
            src="/brand/stellic-wordmark.svg"
            alt="Stellic"
            className="h-8 w-[139.156px] shrink-0"
          />
          <Icon name="s-menu-collapse" size={20} className="h-5 w-7 text-gray-100" />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto">
        <nav className="flex shrink-0 flex-col items-start border-b border-gray-60 pb-[15px]">
          {nav(section).map((item) => (
            <a
              key={item.label}
              href="#"
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "flex h-9 w-60 shrink-0 items-center gap-2 px-6 py-2 text-white",
                item.badge && "justify-between",
                item.active && "bg-gray-80"
              )}
            >
              <span className={cn("flex items-center gap-2.5", item.sub && "pl-6")}>
                <NavRing item={item} />
                <span
                  className={cn(
                    "whitespace-nowrap text-body-md",
                    item.strong ? "font-semibold" : "font-medium"
                  )}
                >
                  {item.label}
                </span>
                {item.trailing === "expand-more" && <Icon name="expand-more" size={14} />}
              </span>
              {item.trailing === "s-arrow-down-fill" && (
                <Icon name="s-arrow-down-fill" size={14} />
              )}
              {item.badge && (
                <Badge variant="warning" className="opacity-0">
                  {item.badge}
                </Badge>
              )}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 flex-col items-start gap-4 px-6">
          <p className="text-label-sm font-medium text-gray-80">QUICK LINKS</p>
          {QUICK_LINKS.map((label) => (
            <a key={label} href="#" className="whitespace-nowrap text-body-md">
              {label}
            </a>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-start justify-end gap-4 p-6">
        <div className="flex flex-col items-start gap-3">
          <p className="w-[156px] text-[12px] leading-normal tracking-[-0.1714px]">
            Last refreshed Tue 2:23am
          </p>
          <img
            src="/brand/stellic-logo.svg"
            alt="Stellic"
            className="h-[17.808px] w-[92px]"
          />
        </div>
        <button
          type="button"
          aria-label="Message us"
          className="flex overflow-hidden rounded-full bg-primary-50 p-[10.341px]"
        >
          <img src="/brand/message-us.svg" alt="" className="size-[32.317px]" />
        </button>
      </div>
    </aside>
  )
}
