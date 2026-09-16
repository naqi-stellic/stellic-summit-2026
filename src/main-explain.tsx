import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { ExplainProgress } from "@/pages/explain-progress"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ExplainProgress />
  </StrictMode>
)
