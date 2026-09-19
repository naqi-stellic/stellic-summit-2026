import { cn } from "cn"

import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"
import { GPA_SETUP, type Gpa } from "@/data/gpa"

/* How a grade point average was arrived at.
 *
 * The audit gives a number; this gives the sum. Every course that contributed,
 * the weight its grade carries, the credits it carried and the points those
 * two make — then the totals, and the division. Somebody can check it with a
 * calculator, which is the only honest way to answer "why is it 3.50".
 *
 * And underneath, the settings the sum was done under. Two institutions with
 * the same transcript can publish different averages, so the arithmetic on its
 * own is only half an answer: the other half is which rounding and which
 * attempts. It is the same move the constraints make on Explain — here is the
 * working, and here are the rules the working followed. */

/** A column header that says the same thing in less room. The panel is a
 *  sidebar and a sidebar can be dragged narrow, at which point "Grade &
 *  Weight" is no longer a label but a reason the numbers beside it have
 *  nowhere to sit. */
function Column({ long, short }: { long: string; short: string }) {
  return (
    <>
      <span className="@max-md:hidden">{long}</span>
      <span className="@md:hidden">{short}</span>
    </>
  )
}

export function GpaPanel({
  title,
  gpa,
  onClose,
}: {
  /** Whose average it is: the requirement's name, or the programme's. */
  title: string
  gpa: Gpa
  onClose: () => void
}) {
  return (
    <aside className="@container flex h-full w-full flex-col overflow-x-clip overflow-y-auto bg-card">
      <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-2 border-b border-gray-40 bg-card px-4 py-3 @md:px-6">
        <h2 className="text-caption-lg font-semibold text-foreground">GPA Calculation</h2>
        <Button variant="ghost" size="icon" aria-label="Close GPA Calculation" onClick={onClose}>
          <Icon name="s-close" size={16} />
        </Button>
      </header>

      <div className="flex flex-1 flex-col gap-6 px-4 py-6 pb-28 @md:px-6">
        <h3 className="text-h300 font-semibold text-foreground">{title}</h3>

        <table className="w-full border-collapse text-body-md">
          <thead>
            <tr className="text-label-md text-gray-80">
              {/* The course column takes whatever room the numbers do not, so
                  the three that have to stay legible are the three that get
                  their width first. */}
              <th scope="col" className="w-full pb-2 text-left font-medium">
                Course
              </th>
              {/* Grade and weight are one column: the letter and what it is
                  worth are the same fact said twice, and splitting them put a
                  header over a number nobody reads on its own. */}
              <th scope="col" className="pb-2 text-right font-medium whitespace-nowrap">
                <Column long="Grade & Weight" short="Grade" />
              </th>
              <th scope="col" className="pb-2 pl-3 text-right font-medium whitespace-nowrap">
                <Column long="Credits" short="Cr" />
              </th>
              <th scope="col" className="pb-2 pl-3 text-right font-medium whitespace-nowrap">
                <Column long="Points" short="Pts" />
              </th>
            </tr>
          </thead>
          <tbody>
            {gpa.rows.map((row) => (
              <tr key={row.code} className="border-t border-gray-5">
                <td className="py-2.5 pr-3">
                  <span className="font-semibold whitespace-nowrap text-foreground">{row.code}</span>
                  {/* The name goes when there is no room for it — the code is
                      what the row is, and the name is what it is called. */}
                  <span className="ml-2 text-gray-80 @max-md:hidden">{row.name}</span>
                </td>
                <td className="py-2.5 text-right whitespace-nowrap text-foreground">
                  {/* The letter keeps a column of its own: grades are one and
                      two characters long, and right-aligning the pair left the
                      A's and the B's stepping in and out down the panel. */}
                  <span className="inline-block w-5 text-left text-gray-80">{row.grade}</span>
                  <span className="tabular-nums">{row.weight.toFixed(1)}</span>
                </td>
                <td className="py-2.5 pl-3 text-right tabular-nums text-foreground">
                  {row.credits}
                </td>
                <td className="py-2.5 pl-3 text-right tabular-nums text-foreground">
                  {row.points.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            {/* The answer, on the same columns it was made from: read down
                Credits and down Points and the division is in front of you. */}
            <tr className="border-t border-gray-40">
              <td className="pt-4">
                <span className="text-body-md font-semibold text-foreground">GPA</span>
                <span
                  className={cn(
                    "ml-2 rounded-full bg-primary-0 px-2.5 py-0.5",
                    "text-body-md font-semibold text-primary-50 tabular-nums"
                  )}
                >
                  {gpa.value}
                </span>
              </td>
              <td />
              <td className="pt-4 pl-3 text-right font-semibold tabular-nums text-foreground">
                {gpa.credits}
              </td>
              <td className="pt-4 pl-3 text-right font-semibold tabular-nums text-foreground">
                {gpa.points.toFixed(1)}
              </td>
            </tr>
          </tfoot>
        </table>

        <div className="flex gap-3 rounded-md bg-gray-0 p-[15px]">
          <Icon name="table-view" size={16} className="mt-0.5 shrink-0 text-gray-80" />
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-body-md font-semibold text-foreground">Setup by your institution</p>
            <ul className="flex list-disc flex-col gap-1 pl-4 text-body-md text-gray-80">
              {GPA_SETUP.map(([label, value]) => (
                <li key={label}>
                  {label}: {value}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </aside>
  )
}
