import { createContext, useContext } from "react"

import type { NavSection } from "@/components/layout/sidebar"

/* Which product's nav the page is standing in.
 *
 * The shell already knows — it is what draws the sidebar — and some of what it
 * decides is true further down the page than the sidebar reaches. A student
 * looking at their own record and a staff member looking at the same record
 * are not offered the same things, and the card that offers them sits several
 * components below the shell.
 *
 * A context rather than a prop threaded through every page, so a prototype
 * cannot get it wrong by forgetting to pass it: standing in the staff nav is
 * enough. */

export const SectionContext = createContext<NavSection>("plan")

export function useSection(): NavSection {
  return useContext(SectionContext)
}

/** Whether the page is being read by staff rather than by the student whose
 *  record it is. */
export function useIsStaff(): boolean {
  return useSection() === "staff"
}
