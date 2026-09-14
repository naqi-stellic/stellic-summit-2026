import { cn } from "cn"
import { useState } from "react"

import { Icon } from "@/components/icon"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"

/* A search field that opens its options on focus and collects the chosen ones
 * as removable tags, in the "Multi-input" shape the design uses. */

function Tag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex h-7 shrink-0 items-center gap-1 overflow-clip rounded-md border border-gray-40 bg-card px-[9px] text-body-md text-gray-100 shadow-xs">
      {label}
      <button
        type="button"
        aria-label={`Remove ${label}`}
        onClick={onRemove}
        className="cursor-pointer text-gray-100"
      >
        <Icon name="close" size={12} />
      </button>
    </span>
  )
}

export function TermMultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Search terms",
}: {
  options: string[]
  selected: string[]
  onChange: (next: string[]) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const available = options.filter((option) => !selected.includes(option))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* Anchored rather than triggered: PopoverTrigger stamps type="button"
          onto whatever it wraps, and an input of type button ignores its
          placeholder. */}
      <PopoverAnchor asChild>
        <div className="flex w-full flex-col gap-1 rounded-md border border-gray-40 bg-card p-[7px]">
        <div className="flex w-full items-start justify-between gap-2">
          {/* Leading glyph and a placeholder that stays put once tags are
              added, so the field still reads as a search box. */}
          <Icon name="s-search" size={16} className="mt-1.5 shrink-0 text-gray-60" />
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            {selected.map((term) => (
              <Tag
                key={term}
                label={term}
                onRemove={() => onChange(selected.filter((t) => t !== term))}
              />
            ))}
            <input
              type="text"
              readOnly
              placeholder={placeholder}
              onFocus={() => setOpen(true)}
              onClick={() => setOpen(true)}
              className={cn(
                "h-7 min-w-32 flex-1 cursor-pointer bg-transparent text-body-md",
                "text-foreground placeholder:text-gray-80 focus:outline-none"
              )}
            />
          </div>
          {selected.length > 0 && (
            <button
              type="button"
              aria-label="Clear all terms"
              onClick={() => onChange([])}
              className="mt-1.5 shrink-0 cursor-pointer text-gray-100"
            >
              <Icon name="close" size={16} />
            </button>
          )}
          </div>
        </div>
      </PopoverAnchor>

      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-56 p-0"
        /* Keep focus in the field so the list reads as an extension of it. */
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <Command>
          <CommandInput placeholder={placeholder} className="text-body-md" />
          <CommandList>
            <CommandEmpty className="p-3 text-body-md text-gray-80">No terms left.</CommandEmpty>
            <CommandGroup>
              {available.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => onChange([...selected, option])}
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
  )
}
