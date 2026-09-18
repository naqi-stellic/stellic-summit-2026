import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { Students } from "@/pages/students"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Students />
  </StrictMode>
)
