import { AppShell } from "@/components/layout/app-shell"
import { ProgramCatalog } from "@/components/stellic/program-list"
import { TooltipProvider } from "@/components/ui/tooltip"

/* Program Instruction.
 *
 * The third Team Plan prototype, and the first of them standing on the staff
 * side: New Planner and Plan Generator are a student arranging their own terms,
 * and this is the desk the programme those terms are arranged against is
 * written at.
 *
 * A page of its own rather than a tab hung off Staff Home, because Programs is
 * its own row in the staff nav — a prototype should be reachable the way the
 * real thing is, and the row you are standing on is half of what tells you
 * where you are.
 *
 * What is on it is the catalogue the rest of the suite already runs on, read
 * from the other side: the same twenty-four programs Advanced What-If offers a
 * student, listed by what state each one's audit is in. */

export function ProgramInstruction() {
  return (
    <AppShell section="staff" navCurrent="Programs" title="Programs">
      <TooltipProvider>
        <main className="@container min-w-0 flex-1 overflow-y-auto px-6 py-8">
          {/* The width the other staff screens hold to, so this one starts
              where Students and the audit already start. */}
          <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
            <ProgramCatalog />
          </div>
        </main>
      </TooltipProvider>
    </AppShell>
  )
}
