import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { AdvancedWhatIf } from "@/pages/advanced-what-if"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AdvancedWhatIf />
  </StrictMode>
)
