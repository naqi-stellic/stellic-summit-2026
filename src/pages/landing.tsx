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
 * The names carry it on their own. A line of explanation under each one is a
 * paragraph nobody came here to read, and a count beside the heading is a
 * number you can get by looking. */

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
  {
    name: "Team Explore",
    prototypes: [{ href: "/explore.html", name: "Prospective Student Lite" }],
  },
]

const REPO = "https://github.com/naqi-stellic/stellic-summit-2026"

function Prototype({ href, name }: { href: string; name: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      /* The whole card is the link, so the chevron is a signpost rather than a
         second thing to hit. It steps right on hover, which is the only motion
         on the page. p-[19px]: 20, less the border drawn inside it. */
      className="group flex items-center gap-4 rounded-md border border-gray-40 bg-card p-[19px] shadow-sm transition-colors hover:border-primary-50 hover:bg-gray-0"
    >
      <span className="min-w-0 flex-1 text-h300 font-semibold text-gray-100">{name}</span>
      <Icon
        name="chevron-right"
        size={20}
        className="shrink-0 text-gray-60 transition-all group-hover:translate-x-0.5 group-hover:text-primary-50"
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

        {/* One column. The headings are what the eye is scanning for, and a
            list this short reads faster down than across. */}
        <div className="flex w-full max-w-[720px] flex-col gap-10">
          {SECTIONS.map((section) => (
            <section key={section.name} className="flex flex-col gap-3">
              <h2 className="text-overline font-medium tracking-[0.5px] text-gray-80 uppercase">
                {section.name}
              </h2>
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
