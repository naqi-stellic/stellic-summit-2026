import { cn } from "cn"

import { describePace, type PaceState } from "@/components/stellic/generate-plan-pace"
import { DEGREE, PLANNING_RULES, type PlanStanding } from "@/data/plan"

/* The review screen. Every row under "Your choices" reads back an answer the
 * student actually gave in steps 1-3; the rows beneath it are institution
 * settings the generator applies regardless. */

type Row = { label: string; value: string; editable?: boolean }

function Section({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <div className="flex w-full flex-col gap-2 overflow-clip">
      <p className="text-overline font-medium tracking-[0.5px] text-gray-100 uppercase">
        {title}
      </p>
      {rows.map((row, i) => (
        <div
          key={row.label}
          className={cn("flex w-full items-start gap-2 text-body-md", i === 0 && "pt-2")}
        >
          <p className="w-[148px] shrink-0 text-gray-80">{row.label}</p>
          <p className="min-w-0 flex-1 text-gray-100">{row.value}</p>
          {row.editable && (
            <button
              type="button"
              className="shrink-0 cursor-pointer text-gray-80 underline [text-underline-position:from-font]"
            >
              edit
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

export function GeneratePlanSummary({
  standing,
  graduation,
  campus,
  keepPlanned,
  pace,
  notes,
}: {
  standing: PlanStanding
  graduation: string
  campus: string
  keepPlanned: string
  pace: PaceState
  notes: string
}) {
  const choices: Row[] = [
    { label: "Program", value: DEGREE.program, editable: true },
    { label: "Concentration", value: DEGREE.concentration, editable: true },
    { label: "Expected Graduation", value: graduation, editable: true },
    {
      label: "Keeping",
      value: keepPlanned === "yes" ? "Everything planned" : "Choosing what to keep",
      editable: true,
    },
    { label: "Pacing", value: describePace(pace), editable: true },
    { label: "Anything else", value: notes.trim() || "Nothing added", editable: true },
  ]

  const rules: Row[] = [
    { label: "Requirement priority", value: PLANNING_RULES.requirementPriority, editable: true },
    { label: "Campus", value: campus, editable: true },
    {
      label: "Existing credit",
      value: `${standing.completed.reqs} courses, ${standing.completed.credits} credits`,
    },
    { label: "Prerequisites, co-reqs, anti-reqs", value: PLANNING_RULES.prerequisites },
    { label: "Term offerings", value: `through ${PLANNING_RULES.offeringsThrough}` },
    {
      label: "Credit load limits",
      value: `max ${PLANNING_RULES.maxCreditsPerTerm} per term`,
    },
    { label: "Double counting rules", value: PLANNING_RULES.doubleCounting },
  ]

  return (
    <>
      <div className="flex w-full flex-col gap-2">
        <h3 className="text-h400 font-semibold text-black">
          Here's what plans will be based on
        </h3>
        <p className="text-body-md text-gray-80">
          Change anything that doesn't look right, then generate.
        </p>
      </div>

      <div className="flex w-full flex-col gap-2 rounded-md border border-gray-40 bg-gray-0 p-[15px]">
        <Section title="Your choices" rows={choices} />
        <Section title="Also accounting for" rows={rules} />
      </div>
    </>
  )
}
