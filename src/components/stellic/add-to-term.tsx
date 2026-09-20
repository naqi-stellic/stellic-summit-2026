import { useState } from "react"

import { AddSlot } from "@/components/stellic/primitives"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/icon"
import { Input } from "@/components/ui/input"
import type { CatalogEntry } from "@/data/catalog"

/* What "+ Add to Term" opens: the four ways of putting something into a term.
 * Two of them turn the slot itself into a field — the way in that asks least
 * of you is the one you already know the number of — one opens the search, and
 * one is for the things that are not courses at all. */

type Asking = "course" | "section"

export function AddToTerm({
  options,
  onPick,
  onSearch,
}: {
  /** What the term could take, which is what a typed code is looked up in. */
  options: CatalogEntry[]
  onPick: (entry: CatalogEntry) => void
  /** Opens the course search beside the plan. */
  onSearch?: () => void
}) {
  const [asking, setAsking] = useState<Asking | null>(null)
  const [typed, setTyped] = useState("")

  if (asking) {
    const add = () => {
      /* A course is added when the code is one the term could take; anything
         else closes the field without pretending to have found something. */
      const found = options.find(
        (entry) => entry.code.toLowerCase() === typed.trim().toLowerCase()
      )
      if (found) onPick(found)
      setTyped("")
      setAsking(null)
    }

    return (
      <div className="flex w-full items-center gap-2">
        <Input
          autoFocus
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") add()
            if (event.key === "Escape") setAsking(null)
          }}
          placeholder={asking === "course" ? "Enter course number" : "Enter section number"}
          className="min-w-0 flex-1 text-body-md"
        />
        <Button onClick={add}>Add</Button>
        <button
          type="button"
          aria-label="Cancel"
          onClick={() => {
            setTyped("")
            setAsking(null)
          }}
          className="shrink-0 cursor-pointer rounded-md text-gray-100"
        >
          <Icon name="close" size={20} />
        </button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <AddSlot>+ Add to Term</AddSlot>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
        {/* Drawn, and going nowhere: adding an activity is a flow of its own
            and not one this prototype is about. */}
        <DropdownMenuItem className="py-1.5 text-body-md">Add activity</DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => setAsking("course")}
          className="py-1.5 text-body-md"
        >
          Add by course number
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => setAsking("section")}
          className="py-1.5 text-body-md"
        >
          Add by section number
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSearch?.()} className="py-1.5 text-body-md">
          Search courses
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
