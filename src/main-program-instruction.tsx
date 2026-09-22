import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { ProgramInstruction } from "@/pages/program-instruction"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ProgramInstruction />
  </StrictMode>
)
