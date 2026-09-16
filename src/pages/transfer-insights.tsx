import { StaffHome } from "@/pages/staff-home"

import type { PersonaKey } from "@/data/staff-home"

/* Transfer Insights.
 *
 * Staff Home with the switcher taken off and one person left standing in it.
 *
 * Read as seven people, Staff Home argues that a permission model can put seven
 * different pages behind one URL. Read as Jessica alone it argues something
 * narrower and more useful to a transfer office: the credit reviews waiting on
 * her decision, and — separately — the incoming courses her team has articulated
 * by hand often enough that a rule would clear the pile. Two panels, and the
 * line between them is the whole point.
 *
 * Everything else is Staff Home's, so a change to either lands in both. */

const WHO: PersonaKey = "jessica"

export function TransferInsights() {
  return <StaffHome only={WHO} />
}
