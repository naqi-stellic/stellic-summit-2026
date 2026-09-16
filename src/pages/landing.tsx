import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"

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
    prototypes: [
      { href: "/advanced-what-if.html", name: "Advanced What-If" },
      { href: "/compliance.html", name: "Proactive Compliance" },
      { href: "/explain.html", name: "Explain Progress" },
    ],
  },
]

const REPO = "https://github.com/naqi-stellic/stellic-summit-2026"

export function Landing() {
  return (
    /* The links sit in the middle of the page and the repo sits at the foot of
       it, so the column holds the height rather than the content doing it. */
    <div className="flex min-h-screen w-full flex-col bg-background">
      <main className="flex flex-1 flex-col items-center justify-center gap-10 p-6">
        <div className="flex w-full max-w-[860px] flex-col items-center gap-3 text-center">
          <img src="/brand/stellic-wordmark.svg" alt="Stellic" className="h-8 w-[139.156px]" />
          <h1 className="text-h400 font-semibold text-gray-100">Summit 2026</h1>
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
                    /* A name and the way in, centred: with nothing under the
                       name to read, a card tall enough to hold a paragraph
                       would be mostly empty. */
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

      {/* Where the prototypes came from. A hairline rather than a block, so it
          reads as the edge of the page and not as a fifth thing to open. */}
      <footer className="flex shrink-0 items-center justify-center border-t border-gray-40 px-6 py-6">
        <Button asChild>
          <a href={REPO} target="_blank" rel="noreferrer">
            <Icon name="github" size={16} />
            naqi-stellic/stellic-summit-2026
          </a>
        </Button>
      </footer>
    </div>
  )
}
