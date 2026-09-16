import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { Explore } from "@/pages/explore"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Explore />
  </StrictMode>
)
