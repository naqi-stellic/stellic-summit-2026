import { Textarea } from "@/components/ui/textarea"

/* Step 3: free-text context for the generator. */

const PLACEHOLDER =
  "What do you want to get out of your journey? Any additional comments? " +
  "E.g. Working 20 hours a week, keep Spring light, hoping to study abroad or take a gap year."

export function GeneratePlanNotes({
  value,
  onChange,
}: {
  value: string
  onChange: (next: string) => void
}) {
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
          onChange={(event) => onChange(event.target.value)}
          placeholder={PLACEHOLDER}
          className="h-[214px] resize-none px-3 py-2 text-body-md placeholder:text-gray-80"
        />
      </div>
    </>
  )
}
