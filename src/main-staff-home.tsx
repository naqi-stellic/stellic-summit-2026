import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { StaffHome } from "@/pages/staff-home"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StaffHome />
  </StrictMode>
)
