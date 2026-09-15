import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { PlanYourPath } from "@/pages/plan-your-path"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PlanYourPath />
  </StrictMode>
)
