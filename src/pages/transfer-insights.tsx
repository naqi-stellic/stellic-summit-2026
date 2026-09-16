import { StaffHome } from "@/pages/staff-home"

import type { JobKey, PersonaKey, TabKey } from "@/data/staff-home"

/* Transfer Insights.
 *
 * Staff Home with the transfer officer standing in it rather than the registrar.
 * One prop, `who`, and the permission model does the rest: Jessica sees the
 * credit reviews waiting on her decision, and — separately — the incoming
 * courses her team has articulated by hand often enough that a rule would clear
 * the pile. Two panels, and the line between them is the whole point.
 *
 * Everything else is Staff Home's, so a change to either lands in both. */

const WHO: PersonaKey = "jessica"

/* Her appointments are real and the count is hers, so the tab is drawn — but
   this prototype is about transfer credit, and nothing has been built behind
   it. It reads as any other unselected tab and does nothing when pressed. */
const INERT: TabKey[] = ["appts"]

/* Pinned reports are a registrar's habit, not a transfer officer's, and they
   are the one block on Home with nothing to act on. Off the page here, and off
   the Customize list with it. */
const WITHOUT: JobKey[] = ["reports"]

export function TransferInsights() {
  return <StaffHome who={WHO} inert={INERT} without={WITHOUT} />
}
