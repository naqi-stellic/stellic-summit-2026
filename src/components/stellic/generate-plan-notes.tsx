import { useRef } from "react"

import { Textarea } from "@/components/ui/textarea"
import { useScript } from "@/lib/typing"

/* Step 3: free-text context for the generator. */

const PLACEHOLDER =
  "e.g. I work 20 hours a week — keep spring terms light and finish the finance core early."

/** What the box fills itself in with. The generator answers it — the spring it
 *  names comes back a course lighter — so it is written here, beside the box
 *  that asks for it, rather than somewhere the answer cannot see. */
export const PLAN_INSTRUCTION =
  "I have a part-time job through the end of the year, so let's make this spring lighter if it " +
  "won't affect graduation timing"

/** Faster than a person, because this one is long: a hundred and twenty
 *  characters at somebody's real typing rate is twelve seconds of a room
 *  watching a cursor. The rhythm is the same rhythm, only closer together. */
const PACE = 0.4

export function GeneratePlanNotes({
  value,
  onChange,
}: {
  value: string
  onChange: (next: string) => void
}) {
  const script = useScript()
  const filled = useRef(false)

  /* Clicking into the empty box writes the instruction the walkthrough turns
     on. Once only, and never over anything already in it — a box somebody has
     started typing in is theirs. */
  const autofill = () => {
    if (filled.current || value.trim()) return
    filled.current = true
    void script.type(PLAN_INSTRUCTION, onChange, PACE)
  }

  return (
    <>
      <div className="flex w-full flex-col gap-2">
        <h3 className="text-h400 font-semibold text-black">Anything we should know?</h3>
        <p className="text-body-md text-gray-80">
          Optional, but the more you share, the better your course picks.
        </p>
      </div>

      <div className="flex w-full flex-col gap-2">
        <label htmlFor="plan-instructions" className="text-body-md font-semibold text-foreground">
          Plan instructions
        </label>
        <Textarea
          id="plan-instructions"
          value={value}
          onFocus={autofill}
          onChange={(event) => {
            /* Typing into it hands the field back. */
            script.stop()
            onChange(event.target.value)
          }}
          placeholder={PLACEHOLDER}
          className="h-[214px] resize-none px-3 py-2 text-body-md placeholder:text-gray-80"
        />
      </div>
    </>
  )
}
