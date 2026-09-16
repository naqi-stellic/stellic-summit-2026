import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { Compliance } from "@/pages/compliance"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Compliance />
  </StrictMode>
)
