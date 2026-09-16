import { cn } from "cn"
import { useState } from "react"

import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  FILTER_GROUPS,
  fieldOptions,
  activeFilters,
  type FilterField,
  type FilterGroup,
  type FilterState,
} from "@/data/programs"

/* Step 2: narrowing the catalogue down to the programs worth checking against.
 *
 * Three buttons, each opening onto the questions it asks, and everything
 * chosen collected underneath so the whole filter reads in one line whichever
 * button it came from. A button that is holding something says so — the
 * tertiary Button's `aria-pressed` is already the design's active state. */

/** A field inside a filter's popover: a search box that opens its options and
 *  collects the chosen ones as removable tags. */
function FilterFieldInput({
  field,
  values,
  onChange,
}: {
  field: FilterField
  values: string[]
  onChange: (next: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const available = fieldOptions(field.id).filter((option) => !values.includes(option))

  return (
    <div className="flex flex-col gap-2">
      <p className="text-body-md font-semibold text-foreground">{field.label}</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex w-full cursor-pointer flex-wrap items-center gap-1 rounded-md border border-gray-40 bg-card p-[7px] text-left"
          >
            <Icon name="s-search" size={16} className="mx-1 shrink-0 text-gray-60" />
            {values.length === 0 ? (
              <span className="text-body-md text-gray-80">{field.placeholder}</span>
            ) : (
              values.map((value) => (
                <span
                  key={value}
                  className="flex h-7 items-center gap-1 rounded-md border border-gray-40 bg-card px-[9px] text-body-md text-gray-100 shadow-xs"
                >
                  {value}
                  {/* A span, not a button: this is already inside the trigger,
                      and a button inside a button is not valid markup. */}
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Remove ${value}`}
                    onClick={(event) => {
                      event.stopPropagation()
                      onChange(values.filter((v) => v !== value))
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" && event.key !== " ") return
                      event.preventDefault()
                      event.stopPropagation()
                      onChange(values.filter((v) => v !== value))
                    }}
                  >
                    <Icon name="close" size={12} />
                  </span>
                </span>
              ))
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] min-w-56 p-0"
        >
          <Command>
            <CommandInput placeholder={field.placeholder} className="text-body-md" />
            <CommandList>
              <CommandEmpty className="p-3 text-body-md text-gray-80">
                Nothing left to add.
              </CommandEmpty>
              <CommandGroup>
                {available.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => onChange([...values, option])}
                    className="text-body-md"
                  >
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function FilterButton({
  group,
  filters,
  onChange,
}: {
  group: FilterGroup
  filters: FilterState
  onChange: (next: FilterState) => void
}) {
  const [open, setOpen] = useState(false)
  const held = group.fields.some((field) => (filters[field.id]?.length ?? 0) > 0)

  const clear = () => {
    const next = { ...filters }
    group.fields.forEach((field) => delete next[field.id])
    onChange(next)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button aria-pressed={held} className="data-[state=open]:bg-gray-5">
          {group.label}
          {held && (
            <span
              role="button"
              tabIndex={0}
              aria-label={`Clear ${group.label}`}
              onClick={(event) => {
                event.stopPropagation()
                clear()
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return
                event.preventDefault()
                event.stopPropagation()
                clear()
              }}
            >
              <Icon name="close" size={12} />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="flex w-[320px] flex-col gap-4 p-4">
        {group.fields.map((field) => (
          <FilterFieldInput
            key={field.id}
            field={field}
            values={filters[field.id] ?? []}
            onChange={(next) => onChange({ ...filters, [field.id]: next })}
          />
        ))}
      </PopoverContent>
    </Popover>
  )
}

export function DiscoverFilters({
  filters,
  onChange,
  matches,
}: {
  filters: FilterState
  onChange: (next: FilterState) => void
  /** How many programs the filters leave, which is the only reading of them
   *  that matters before Continue is pressed. */
  matches: number
}) {
  const active = activeFilters(filters)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-body-md font-semibold text-foreground">Find Programs</h3>
        <p className="text-body-md text-gray-80">Use filters to identify the programs</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {FILTER_GROUPS.map((group) => (
            <FilterButton
              key={group.id}
              group={group}
              filters={filters}
              onChange={onChange}
            />
          ))}
        </div>

        {/* Everything chosen, in one line, whichever button it came from. */}
        {active.length > 0 && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              {active.flatMap(({ field, values }) =>
                values.map((value) => (
                  <span
                    key={`${field.id}-${value}`}
                    className="flex h-8 items-center gap-2 rounded-full bg-primary-0 px-3 text-body-md text-primary-50"
                  >
                    {field.label}: {value}
                    <button
                      type="button"
                      aria-label={`Remove ${field.label} ${value}`}
                      onClick={() =>
                        onChange({
                          ...filters,
                          [field.id]: (filters[field.id] ?? []).filter((v) => v !== value),
                        })
                      }
                      className="cursor-pointer"
                    >
                      <Icon name="close" size={12} />
                    </button>
                  </span>
                ))
              )}
              <button
                type="button"
                onClick={() => onChange({})}
                className="flex h-8 cursor-pointer items-center rounded-full bg-gray-5 px-3 text-body-md text-gray-80 transition-colors hover:bg-gray-40"
              >
                Reset all filters
              </button>
            </div>

            <p className={cn("text-body-md", matches === 0 ? "text-alert-100" : "text-gray-80")}>
              {matches} {matches === 1 ? "program" : "programs"} with selected filters
            </p>
          </>
        )}
      </div>
    </div>
  )
}
