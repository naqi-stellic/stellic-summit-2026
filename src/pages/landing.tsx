import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"

/* The way in. Each prototype is a page of its own, so this is a page of links
 * rather than a router: they open in their own tabs and none can be navigated
 * out of by accident.
 *
 * Grouped by the product a prototype belongs to. Two names under one heading
 * would read as two versions of one thing; under their own headings they read
 * as what they are — different surfaces that happen to share a shell.
 *
 * Each now carries a line saying what it is. With two prototypes the names
 * were enough, and a card tall enough to hold a sentence sat mostly empty;
 * with five they are not — Explain Progress and Proactive Compliance are the
 * same screen until someone says how they differ. */

const SECTIONS = [
  {
    name: "Team Plan",
    prototypes: [
      {
        href: "/planner.html",
        name: "Planner",
        blurb: "A degree laid out term by term: the plan, registration, and advisor review.",
      },
      {
        href: "/generator.html",
        name: "Plan Generator",
        blurb: "The same planner, with the wizard that builds the plan for you.",
      },
    ],
  },
  {
    name: "Team Progress",
    prototypes: [
      {
        href: "/advanced-what-if.html",
        name: "Advanced What-If",
        blurb: "The degree audit, and what another program would make of the same transcript.",
      },
      {
        href: "/compliance.html",
        name: "Proactive Compliance",
        blurb: "The same record read against an eligibility clock rather than against a degree.",
      },
      {
        href: "/explain.html",
        name: "Explain Progress",
        blurb: "The audit with its working shown: the rules, and why a course does or does not count.",
      },
    ],
  },
]

const REPO = "https://github.com/naqi-stellic/stellic-summit-2026"

function Prototype({ href, name, blurb }: { href: string; name: string; blurb: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      /* The whole card is the link, so the chevron is a signpost rather than a
         second thing to hit. It steps right on hover, which is the only motion
         on the page. p-[23px]: 24, less the border drawn inside it. */
      className="group flex items-start gap-4 rounded-md border border-gray-40 bg-card p-[23px] shadow-sm transition-colors hover:border-primary-50 hover:bg-gray-0"
    >
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-h300 font-semibold text-gray-100">{name}</span>
        <span className="text-body-md text-gray-80">{blurb}</span>
      </span>
      <Icon
        name="chevron-right"
        size={20}
        className="mt-1 shrink-0 text-gray-60 transition-all group-hover:translate-x-0.5 group-hover:text-primary-50"
      />
    </a>
  )
}

export function Landing() {
  return (
    /* The links sit in the middle of the page and the repo sits at the foot of
       it, so the column holds the height rather than the content doing it. */
    <div className="flex min-h-screen w-full flex-col bg-background">
      <main className="flex flex-1 flex-col items-center justify-center gap-12 px-6 py-16">
        <div className="flex w-full max-w-[720px] flex-col items-center gap-3 text-center">
          <img src="/brand/stellic-wordmark.svg" alt="Stellic" className="h-8 w-[139.156px]" />
          <h1 className="text-h400 font-semibold text-gray-100">Summit 2026</h1>
        </div>

        {/* One column rather than two. A sentence per card wants the width more
            than the page wants to be short, and five cards do not tile evenly
            into two columns anyway. */}
        <div className="flex w-full max-w-[720px] flex-col gap-10">
          {SECTIONS.map((section) => (
            <section key={section.name} className="flex flex-col gap-3">
              <div className="flex items-baseline gap-2">
                <h2 className="text-overline font-medium tracking-[0.5px] text-gray-80 uppercase">
                  {section.name}
                </h2>
                <span className="text-overline text-gray-60">{section.prototypes.length}</span>
              </div>
              <div className="flex flex-col gap-3">
                {section.prototypes.map((prototype) => (
                  <Prototype key={prototype.href} {...prototype} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Where the prototypes came from. A hairline rather than a block, so it
          reads as the edge of the page and not as a sixth thing to open. */}
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
