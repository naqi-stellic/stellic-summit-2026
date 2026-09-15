import { cn } from "cn"

import { Icon, type IconName } from "@/components/icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DEGREE } from "@/data/plan"

/* The top of every plan screen: which plan, what it is for, and which years
 * are in view. The planner and a term share it — only the actions and the
 * selected year differ. */

export type PlanAction = {
  label: string
  icon: IconName
  toggles?: boolean
  /** Given, the action opens a menu of details to show on or hide from the
   *  course cards, rather than acting on its own. */
  fields?: { id: string; label: string; shown: boolean }[]
}

/** A term as the year filter offers it: its own state, not its year's. */
export type TabTerm = {
  id: string
  label: string
  icon: IconName
  tone: string
}

export type YearTab = {
  label: string
  icon?: IconName
  tone?: string
  selected?: boolean
  onSelect?: () => void
  /** Given, the tab opens onto the year's terms rather than acting on its own. */
  terms?: TabTerm[]
  onSelectTerm?: (termId: string) => void
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
  onToggleField,
}: {
  actions: PlanAction[]
  tabs: YearTab[]
  /** Whether the toggling action is currently showing its panel. */
  pressed?: boolean
  onAction?: (action: PlanAction) => void
  onToggleField?: (id: string) => void
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 className="flex items-center gap-1 text-h400 font-semibold text-gray-100">
          Primary Plan
          <Icon name="expand-more" size={16} />
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {actions.map((action) => {
            const button = (
              <Button
                aria-pressed={action.toggles ? pressed : undefined}
                onClick={() => onAction?.(action)}
                className="data-[state=open]:bg-gray-5"
              >
                <Icon name={action.icon} size={16} />
                {action.label}
              </Button>
            )

            if (!action.fields) return <span key={action.label}>{button}</span>

            return (
              <DropdownMenu key={action.label}>
                <DropdownMenuTrigger asChild>{button}</DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  {action.fields.map((field) => (
                    <DropdownMenuItem
                      key={field.id}
                      /* Switching one detail on is rarely the only one you
                         want, so the menu stays open to take the next. */
                      onSelect={(event) => {
                        event.preventDefault()
                        onToggleField?.(field.id)
                      }}
                      className="gap-2 py-1.5 pr-2 pl-8 text-body-md"
                    >
                      <Icon
                        name={field.shown ? "remove-red-eye" : "visibility-off"}
                        size={16}
                        className={cn(
                          "absolute left-2 shrink-0",
                          field.shown ? "text-gray-100" : "text-gray-40"
                        )}
                      />
                      {field.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          })}
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
        {tabs.map((tab) => {
          const button = (
            <Button
              size="sm"
              selected={tab.selected}
              onClick={tab.onSelect}
              /* Open reads as hovered, which is how the design marks the tab
                 whose menu is showing. */
              className="data-[state=open]:bg-gray-5"
            >
              {tab.icon && <Icon name={tab.icon} size={16} className={tab.tone} />}
              {tab.label}
            </Button>
          )

          if (!tab.terms || tab.terms.length === 0) {
            return <span key={tab.label}>{button}</span>
          }

          return (
            <DropdownMenu key={tab.label}>
              <DropdownMenuTrigger asChild>{button}</DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                {tab.terms.map((term) => (
                  <DropdownMenuItem
                    key={term.id}
                    onSelect={() => tab.onSelectTerm?.(term.id)}
                    className="gap-2 py-1.5 pr-2 pl-8 text-body-md"
                  >
                    {/* In the checkmark's place, so the labels line up whether
                        or not a term carries a mark. */}
                    <Icon
                      name={term.icon}
                      size={16}
                      className={cn("absolute left-2 shrink-0", term.tone)}
                    />
                    {term.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        })}
      </div>
    </section>
  )
}
