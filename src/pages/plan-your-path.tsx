import { Icon } from "@/components/icon"
import { AppShell } from "@/components/layout/app-shell"
import { AddSlot } from "@/components/stellic/primitives"
import { TimelineRail, YearSection } from "@/components/stellic/planner"
import {
  Alert,
  AlertBody,
  AlertDescription,
  AlertHeader,
  AlertTitle,
} from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { IconName } from "@/components/icon"
import { FALL_2027, FUTURE_YEARS, SPRING_2028 } from "@/data/plan"

type YearTab = { label: string; icon?: IconName; tone?: string; selected?: boolean }

const YEAR_TABS: YearTab[] = [
  { label: "All Years", icon: "grid-view", selected: true },
  { label: "2026-2027", icon: "check-circle", tone: "text-success-100" },
  { label: "2027-2028", icon: "timelapse", tone: "text-warning-50" },
  { label: "2028-2029" },
  { label: "2029-2030" },
]

const PLAN_ACTIONS = [
  { label: "Request review", icon: "assignment" },
  { label: "Generate plan", icon: "design-services" },
  { label: "Plan details", icon: "remove-red-eye" },
] as const

function RegistrationAlert() {
  return (
    <Alert className="h-[92px]">
      <AlertBody>
        <AlertHeader>
          <AlertTitle>
            <Icon name="shopping-cart" size={16} className="mt-0.5 text-primary-100" />
            Registration is now open!
          </AlertTitle>
          <AlertDescription>Closes: Mon Jan 18, 2026 • 11:59pm EST</AlertDescription>
        </AlertHeader>
        <Button variant="primary" size="sm">
          Register Now
        </Button>
      </AlertBody>
    </Alert>
  )
}

function PlanFacet({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-body-md font-semibold text-foreground">{label}</span>
      <Badge variant="secondary">
        {value}
        <Icon name="close" size={12} />
      </Badge>
      <a href="#" className="text-body-md text-gray-80 underline [text-underline-position:from-font]">
        + add another
      </a>
    </div>
  )
}

export function PlanYourPath() {
  return (
    <AppShell title="Plan Your Path">
      <main className="flex min-w-0 flex-1 flex-col gap-6 p-6">
        {/* ---------------------------------- Plan header */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1 text-h400 font-semibold text-gray-100">
              Primary Plan
              <Icon name="expand-more" size={16} />
            </h2>
            <div className="flex items-center gap-2">
              {PLAN_ACTIONS.map((action) => (
                <Button key={action.label}>
                  <Icon name={action.icon} size={16} />
                  {action.label}
                </Button>
              ))}
              <Button size="icon" aria-label="Toggle sidebar">
                <Icon name="view-sidebar" size={16} />
              </Button>
              <Button size="icon" aria-label="More options">
                <Icon name="more-horiz" size={16} />
              </Button>
            </div>
          </div>

          <PlanFacet label="Programs:" value="BSc in Business Administration (concentration: Finance)" />
          <PlanFacet label="Pathway:" value="Biology: Fall Start 2026 [BSc]" />

          <div className="flex items-center gap-2 pt-2">
            {YEAR_TABS.map((tab) => (
              <Button key={tab.label} size="sm" selected={tab.selected}>
                {tab.icon && <Icon name={tab.icon} size={16} className={tab.tone} />}
                {tab.label}
              </Button>
            ))}
          </div>
        </section>

        {/* ---------------------------------- 2026-2027, collapsed */}
        <section className="flex items-start gap-4">
          <TimelineRail phase="complete" nodes={1} />
          <div className="flex min-w-0 flex-1 items-center justify-between pb-4">
            <h3 className="flex items-center gap-1 text-h300 font-semibold text-gray-100">
              2026-2027
              <Icon name="unfold-more" size={16} />
            </h3>
            <p className="text-label-md text-gray-100">
              8 courses, 20 credits complete, 21 credits earned
            </p>
          </div>
        </section>

        {/* ---------------------------------- 2027-2028, expanded */}
        <YearSection
          label="2027-2028"
          phase="active"
          terms={[FALL_2027, { ...SPRING_2028, alert: <RegistrationAlert /> }]}
        />

        {FUTURE_YEARS.map((year) => (
          <YearSection key={year.label} label={year.label} phase={year.phase} terms={year.terms} />
        ))}

        {/* ---------------------------------- Add year */}
        <section className="flex items-start gap-4">
          <div className="flex w-6 shrink-0 flex-col items-center justify-center self-stretch">
            <Icon name="fiber-manual-record" size={24} className="text-gray-40" />
          </div>
          <AddSlot tone="year">+ Add Year 5</AddSlot>
        </section>
      </main>
    </AppShell>
  )
}
