import { cn } from "cn"
import type { ReactNode } from "react"

import { Icon, type IconName } from "@/components/icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AUDIT_STUDENT, CURRENT_TERM, OFFICIAL_PROGRESS } from "@/data/audit"

/* The head of the progress screen: who the student is, how far through they
 * are, who is looking after them, and what they are taking right now. Four
 * cards on the page's grey, each one a flat white panel — nothing here is a
 * control surface, so nothing is lifted higher than a card. */

export function ProgressCard({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <section className={cn("rounded-md bg-card p-6 shadow-card", className)}>{children}</section>
  )
}

/** One line of the identity block: a glyph and what it says. */
function Fact({ icon, children }: { icon?: IconName; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-body-md text-gray-80">
      {icon && <Icon name={icon} size={16} className="shrink-0" />}
      {children}
    </div>
  )
}

/** A bar of shares, and the dots that say what each share was. The widths are
 *  the counts rather than the frame's pixels, so the bar moves when the audit
 *  does — which is the point of computing one. */
function ShareBar({
  shares,
  className,
}: {
  shares: { count: number; colour: string; dot?: string }[]
  className?: string
}) {
  const total = shares.reduce((sum, share) => sum + share.count, 0)

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div className="flex h-2 w-full overflow-hidden rounded-full">
        {shares.map((share, i) => (
          <span
            key={i}
            /* A white hairline between shares, as the frame draws it: two
               oranges meeting would otherwise read as one. */
            className={cn(share.colour, i < shares.length - 1 && "border-r border-white")}
            style={{ width: `${(share.count / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex items-center gap-[17px]">
        {shares
          .filter((share) => share.dot)
          .map((share, i) => (
            <span key={i} className="flex items-center gap-2 px-0.5">
              <span className={cn("size-2 shrink-0 rounded-full", share.dot)} />
              <span className="text-body-md text-gray-80">{share.count}</span>
            </span>
          ))}
      </div>
    </div>
  )
}

export function ProfileCard() {
  const { courses, milestones } = OFFICIAL_PROGRESS

  return (
    <ProgressCard className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start gap-4">
        <span className="flex size-[124px] shrink-0 items-center justify-center rounded-full bg-gray-40 text-[40px] leading-none text-white">
          {AUDIT_STUDENT.initials}
        </span>

        <div className="flex min-w-[240px] flex-1 flex-col gap-2">
          <p className="text-h300 font-semibold text-gray-100">{AUDIT_STUDENT.name}</p>
          <div className="flex gap-2 text-body-md text-gray-80">
            <span>{AUDIT_STUDENT.username}</span>
            <a href="#" className="underline [text-underline-position:from-font]">
              {AUDIT_STUDENT.email}
            </a>
          </div>
          <p className="text-body-md text-gray-80">{AUDIT_STUDENT.standing}</p>

          {/* The degree, then the pathway that laid it out — the same two the
              plan header names, and each a way in to its own audit. */}
          <Fact icon="school">
            <a href="#" className="flex items-center">
              {AUDIT_STUDENT.program}
              <Icon name="chevron-right" size={16} className="shrink-0" />
            </a>
          </Fact>
          <Fact icon="class">
            <a href="#" className="flex items-center">
              {AUDIT_STUDENT.pathway}
              <Icon name="chevron-right" size={16} className="shrink-0" />
            </a>
          </Fact>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Fact icon="place">{AUDIT_STUDENT.campus}</Fact>
            <Fact>
              <span className="font-bold">EY</span>
              <span>{AUDIT_STUDENT.entry}</span>
            </Fact>
            <Fact icon="sell">{AUDIT_STUDENT.level}</Fact>
          </div>
        </div>

        <div className="flex shrink-0 items-start gap-2">
          <Button>Request to Review Plan</Button>
          <Button>Actions</Button>
          <Button size="icon" aria-label="History">
            <Icon name="watch-later" size={16} />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <p className="text-body-md font-semibold text-gray-100">Official Progress</p>
          <Icon name="info" size={16} className="text-gray-80" />
        </div>
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex min-w-[240px] flex-1 flex-col gap-2">
            <p className="text-body-md text-gray-100">Courses</p>
            <ShareBar
              shares={[
                { count: courses.taken, colour: "bg-success-50", dot: "bg-success-50" },
                { count: courses.inProgress, colour: "bg-warning-75", dot: "bg-warning-75" },
                { count: courses.remaining, colour: "bg-gray-5", dot: "bg-gray-40" },
              ]}
            />
          </div>
          <div className="flex w-[350px] flex-col gap-2 max-lg:w-full">
            <div className="flex items-center gap-2">
              <Icon name="outlined-flag" size={16} className="text-gray-100" />
              <p className="text-body-md text-gray-100">Milestones</p>
            </div>
            <ShareBar
              shares={[
                { count: milestones.done, colour: "bg-success-50", dot: "bg-success-50" },
                { count: milestones.total - milestones.done, colour: "bg-gray-5" },
              ]}
            />
          </div>
        </div>
      </div>
    </ProgressCard>
  )
}

/** The three cards under the profile: who to ask, how it is going, and what
 *  they care about. */
export function NetworkRow() {
  const { advisor, engage, interests } = AUDIT_STUDENT

  return (
    <div className="flex flex-wrap items-stretch gap-4">
      <ProgressCard className="flex min-w-[280px] flex-1 flex-col gap-4">
        <p className="text-body-md font-semibold text-gray-80">Student Success Network</p>
        <div className="flex items-start gap-4">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-5 text-body-md text-gray-80">
            {advisor.initials}
          </span>
          <div className="flex flex-col gap-2">
            <p className="text-body-md font-semibold text-gray-100">{advisor.name}</p>
            <div className="flex gap-2">
              <Button size="icon" aria-label={`Message ${advisor.name}`}>
                <Icon name="alternate-email" size={16} />
              </Button>
              <Button size="icon" aria-label={`Email ${advisor.name}`}>
                <Icon name="mail" size={16} />
              </Button>
              <Button size="icon" aria-label={`Book time with ${advisor.name}`}>
                <Icon name="calendar-today" size={16} />
              </Button>
            </div>
          </div>
        </div>
        <a
          href="#"
          className="text-body-md text-gray-80 underline [text-underline-position:from-font]"
        >
          show {advisor.others} other advisor
        </a>
      </ProgressCard>

      <ProgressCard className="flex w-[422px] items-start justify-between gap-4 max-lg:w-full">
        <div className="flex flex-col gap-4">
          <p className="text-body-md font-semibold text-gray-80">Stellic Engage</p>
          <div className="flex gap-0.5">
            {Array.from({ length: engage.stars }, (_, i) => (
              <Icon key={i} name="bolt" size={16} className="text-gray-40" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 text-body-md font-semibold text-gray-80">
          <p>{engage.term}</p>
          <p className="text-center text-caption-lg">{engage.termGpa}</p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-1">
            <p className="text-body-md font-semibold text-gray-80">CGPA</p>
            <Icon name="info" size={16} className="text-gray-80" />
          </div>
          {/* Down on the term, which is the one figure here that is a warning
              rather than a fact. */}
          <div className="flex items-center gap-1">
            <p className="text-caption-lg font-semibold text-gray-80">{engage.cgpa}</p>
            <Icon name="arrow-drop-down" size={16} className="text-alert-50" />
          </div>
        </div>
      </ProgressCard>

      <ProgressCard className="flex min-w-[280px] flex-1 flex-col gap-4">
        <p className="text-body-md font-semibold text-gray-80">Interests</p>
        <p className="text-body-md text-gray-80">
          {interests.length ? interests.join(", ") : "No interests added"}
        </p>
      </ProgressCard>
    </div>
  )
}

/** The term under way, and the classes in it. */
export function TermStrip() {
  return (
    <ProgressCard className="flex flex-wrap items-center gap-x-6 gap-y-4">
      <div className="flex shrink-0 flex-col gap-2">
        <p className="text-caption-lg font-semibold text-gray-100">{CURRENT_TERM.name}</p>
        <p className="text-body-md text-gray-80">{CURRENT_TERM.credits} Credits</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {CURRENT_TERM.courses.map((code) => (
          <span
            key={code}
            className="flex h-8 items-center rounded-full bg-gray-0 px-3 text-body-md text-gray-80"
          >
            {code}
          </span>
        ))}
      </div>
    </ProgressCard>
  )
}

/* ============================================================ audit controls
   The strip above the tree: which tab of the student's record you are on,
   which audit you are reading, and how fresh it is. */

export function AuditControls({
  tabs,
  active,
  onSelectTab,
  views,
  view,
  onSelectView,
  scopes,
  scope,
  lastComputed,
}: {
  tabs: { id: string; label: string; count?: number }[]
  active: string
  onSelectTab: (id: string) => void
  views: { id: string; label: string; bar: { taken: number; inProgress: number; planned: number } }[]
  view: string
  onSelectView: (id: string) => void
  scopes: string[]
  scope: string
  lastComputed: string
}) {
  return (
    <section className="flex flex-col gap-6 rounded-md border border-gray-5 bg-card py-6 shadow-card">
      <div className="flex flex-wrap items-end justify-center border-b border-gray-40">
        {tabs.map((tab) => {
          const on = tab.id === active

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              aria-current={on ? "page" : undefined}
              className={cn(
                "flex h-[38px] cursor-pointer flex-col items-center justify-between",
                tab.count === undefined ? "w-[150px]" : "px-4"
              )}
            >
              <span
                className={cn(
                  "flex flex-1 items-center gap-3.5 text-caption-lg font-semibold",
                  on ? "text-primary-50" : "text-gray-100"
                )}
              >
                {tab.label}
                {tab.count !== undefined && <Badge variant="danger">{tab.count}</Badge>}
              </span>
              {/* The indicator sits in the strip's own 1px rule, so an inactive
                  tab reserves it rather than shifting when it lights up. */}
              <span
                className={cn("h-0.5 w-full", on ? "bg-primary-50" : "bg-transparent")}
                aria-hidden="true"
              />
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4 px-6">
        <div className="flex">
          {views.map((option, i) => {
            const on = option.id === view
            const total = option.bar.taken + option.bar.inProgress + option.bar.planned

            return (
              <div key={option.id} className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => onSelectView(option.id)}
                  aria-pressed={on}
                  className={cn(
                    "flex h-9 w-[130px] cursor-pointer items-center justify-center gap-1 border px-[15px] text-body-md",
                    i === 0 ? "rounded-l-md" : "-ml-px rounded-r-md",
                    on
                      ? "z-10 border-primary-50 bg-primary-0 text-primary-50"
                      : "border-gray-40 bg-card text-gray-80"
                  )}
                >
                  {option.label}
                  <Icon name="info-filled" size={16} />
                </button>
                {/* A seven-pixel read of what that audit says, under the button
                    that switches to it. */}
                <div className="w-[121px] px-2">
                  <div className="flex h-[7px] w-full overflow-hidden rounded-full">
                    <span
                      className="border-r border-white bg-success-50"
                      style={{ width: `${(option.bar.taken / 105) * 100}%` }}
                    />
                    <span
                      className="border-r border-white bg-warning-75"
                      style={{ width: `${(option.bar.inProgress / 105) * 100}%` }}
                    />
                    {option.bar.planned > 0 && (
                      <span
                        className="border-r border-white bg-warning-25"
                        style={{ width: `${(option.bar.planned / 105) * 100}%` }}
                      />
                    )}
                    <span className="flex-1 bg-gray-40" />
                    <span className="sr-only">
                      {option.bar.taken + option.bar.inProgress + option.bar.planned} of {total}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-start gap-2">
            <Button size="icon" aria-label="Recompute audit">
              <Icon name="refresh" size={16} />
            </Button>
            <button
              type="button"
              className="flex h-9 w-[200px] cursor-pointer items-center gap-2 rounded-md border border-input bg-card px-[11px] text-body-md shadow-xs"
            >
              <span className="flex-1 truncate text-left">{scope}</span>
              <Icon name="expand-more" size={16} />
              <span className="sr-only">of {scopes.join(", ")}</span>
            </button>
          </div>
          <div className="flex items-center gap-1 text-body-md text-gray-80">
            <Icon name="timer" size={16} />
            {lastComputed}
          </div>
        </div>
      </div>
    </section>
  )
}
