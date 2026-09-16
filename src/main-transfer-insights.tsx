import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { TransferInsights } from "@/pages/transfer-insights"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TransferInsights />
  </StrictMode>
)
