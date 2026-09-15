import { Icon } from "@/components/icon"

/* The way in. Each prototype is a page of its own, so this is a page of links
 * rather than a router: the two open in their own tabs and neither can be
 * navigated out of by accident. */

const PROTOTYPES = [
  {
    href: "/generator.html",
    name: "Plan Generator",
    blurb:
      "Generate the four-year plan, a term, or a term's schedule; weigh the options against " +
      "each other and apply one. Registration and plan review are in here too.",
  },
  {
    href: "/planner.html",
    name: "Planner",
    blurb:
      "The same planner on a plan already made, with nothing on offer to generate: read a " +
      "term, register for one, ask for a review.",
  },
]

export function Landing() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-10 bg-background p-6">
      <div className="flex w-full max-w-[860px] flex-col items-center gap-3 text-center">
        <img src="/brand/stellic-wordmark.svg" alt="Stellic" className="h-8 w-[139.156px]" />
        <h1 className="text-h400 font-semibold text-gray-100">Summit 2026 prototypes</h1>
        <p className="text-body-md text-gray-80">
          Two prototypes over one plan. Each opens in its own tab.
        </p>
      </div>

      <div className="grid w-full max-w-[860px] gap-4 @container md:grid-cols-2">
        {PROTOTYPES.map((prototype) => (
          <a
            key={prototype.href}
            href={prototype.href}
            target="_blank"
            rel="noreferrer"
            className="group flex min-h-[220px] flex-col justify-between gap-6 rounded-md border border-gray-40 bg-card p-6 shadow-sm transition-colors hover:border-primary-50 hover:bg-gray-0"
          >
            <span className="flex flex-col gap-2">
              <span className="text-h300 font-semibold text-gray-100">{prototype.name}</span>
              <span className="text-body-md text-gray-80">{prototype.blurb}</span>
            </span>
            <span className="flex items-center gap-1 text-body-md font-semibold text-primary-50">
              Open
              <Icon name="chevron-right" size={16} />
            </span>
          </a>
        ))}
      </div>
    </main>
  )
}
