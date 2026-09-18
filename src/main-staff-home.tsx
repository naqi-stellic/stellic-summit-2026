import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { StaffHome } from "@/pages/staff-home"
import type { PersonaKey } from "@/data/staff-home"

/* The registrar's Home. Transfer Insights is the same page with a different
 * name in `who`. */
const WHO: PersonaKey = "mark"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StaffHome who={WHO} />
  </StrictMode>
)
