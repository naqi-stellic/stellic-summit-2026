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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

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
      <div className="flex w-full flex-col gap-1 rounded-md border border-gray-40 bg-card p-[7px]">
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            {selected.map((term) => (
              <Tag
                key={term}
                label={term}
                onRemove={() => onChange(selected.filter((t) => t !== term))}
              />
            ))}
            <PopoverTrigger asChild>
              <input
                readOnly
                placeholder={selected.length === 0 ? placeholder : ""}
                onFocus={() => setOpen(true)}
                onClick={() => setOpen(true)}
                className={cn(
                  "h-7 min-w-24 flex-1 cursor-pointer bg-transparent px-1 text-body-md",
                  "text-foreground placeholder:text-gray-60 focus:outline-none"
                )}
              />
            </PopoverTrigger>
          </div>
          {selected.length > 0 && (
            <button
              type="button"
              aria-label="Clear all terms"
              onClick={() => onChange([])}
              className="shrink-0 cursor-pointer text-gray-100"
            >
              <Icon name="close" size={16} />
            </button>
          )}
        </div>
      </div>

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
