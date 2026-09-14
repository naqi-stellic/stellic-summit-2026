import { Icon, type IconName } from "@/components/icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DEGREE } from "@/data/plan"

/* The top of every plan screen: which plan, what it is for, and which years
 * are in view. The planner and a term share it — only the actions and the
 * selected year differ. */

export type PlanAction = { label: string; icon: IconName; toggles?: boolean }

export type YearTab = {
  label: string
  icon?: IconName
  tone?: string
  selected?: boolean
  onSelect?: () => void
}

function PlanFacet({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-2">
      <span className="text-body-md font-semibold text-foreground">{label}</span>
      <Badge variant="secondary" className="max-w-full">
        <span className="min-w-0 truncate">{value}</span>
        <Icon name="close" size={12} className="shrink-0" />
      </Badge>
      <a
        href="#"
        className="text-body-md text-gray-80 underline [text-underline-position:from-font]"
      >
        + add another
      </a>
    </div>
  )
}

export function PlanHeader({
  actions,
  tabs,
  pressed,
  onAction,
}: {
  actions: PlanAction[]
  tabs: YearTab[]
  /** Whether the toggling action is currently showing its panel. */
  pressed?: boolean
  onAction?: (action: PlanAction) => void
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 className="flex items-center gap-1 text-h400 font-semibold text-gray-100">
          Primary Plan
          <Icon name="expand-more" size={16} />
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {actions.map((action) => (
            <Button
              key={action.label}
              aria-pressed={action.toggles ? pressed : undefined}
              onClick={() => onAction?.(action)}
            >
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

      <PlanFacet
        label="Programs:"
        value={`BSc in ${DEGREE.program.replace(", B.S.", "")} (concentration: ${DEGREE.concentration})`}
      />
      <PlanFacet label="Pathway:" value="Business Administration: Fall Start 2026 [BSc]" />

      <div className="flex flex-wrap items-center gap-2 pt-2">
        {tabs.map((tab) => (
          <Button key={tab.label} size="sm" selected={tab.selected} onClick={tab.onSelect}>
            {tab.icon && <Icon name={tab.icon} size={16} className={tab.tone} />}
            {tab.label}
          </Button>
        ))}
      </div>
    </section>
  )
}
