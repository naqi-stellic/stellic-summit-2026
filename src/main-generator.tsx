import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { GENERATOR_YEARS } from "@/data/generator-plan"
import { PlanYourPath } from "@/pages/plan-your-path"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PlanYourPath initialYears={GENERATOR_YEARS} />
  </StrictMode>
)
