import { Icon } from "@/components/icon"

/* The way in. Each prototype is a page of its own, so this is a page of links
 * rather than a router: they open in their own tabs and none can be navigated
 * out of by accident.
 *
 * Grouped by the product a prototype belongs to. Two names under one heading
 * would read as two versions of one thing; under their own headings they read
 * as what they are — different surfaces that happen to share a shell. */

const SECTIONS = [
  {
    name: "Team Plan",
    prototypes: [
      { href: "/planner.html", name: "Planner" },
      { href: "/generator.html", name: "Plan Generator" },
    ],
  },
  {
    name: "Team Progress",
    prototypes: [{ href: "/advanced-what-if.html", name: "Advanced What-If" }],
  },
]

export function Landing() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-10 bg-background p-6">
      <div className="flex w-full max-w-[860px] flex-col items-center gap-3 text-center">
        <img src="/brand/stellic-wordmark.svg" alt="Stellic" className="h-8 w-[139.156px]" />
        <h1 className="text-h400 font-semibold text-gray-100">Summit 2026 prototypes</h1>
        <p className="text-body-md text-gray-80">One shell, one design system, a page per surface</p>
      </div>

      <div className="flex w-full max-w-[860px] flex-col gap-8">
        {SECTIONS.map((section) => (
          <section key={section.name} className="flex flex-col gap-3">
            <h2 className="text-overline font-medium tracking-[0.5px] text-gray-80 uppercase">
              {section.name}
            </h2>
            <div className="grid gap-4 @container md:grid-cols-2">
              {section.prototypes.map((prototype) => (
                <a
                  key={prototype.href}
                  href={prototype.href}
                  target="_blank"
                  rel="noreferrer"
                  /* A name and the way in, centred: with nothing under the name
                     to read, a card tall enough to hold a paragraph would be
                     mostly empty. */
                  className="group flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-md border border-gray-40 bg-card p-6 shadow-sm transition-colors hover:border-primary-50 hover:bg-gray-0"
                >
                  <span className="text-h300 font-semibold text-gray-100">{prototype.name}</span>
                  <span className="flex items-center gap-1 text-body-md font-semibold text-primary-50">
                    Open
                    <Icon name="chevron-right" size={16} />
                  </span>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
