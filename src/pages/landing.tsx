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
      { href: "/planner.html", name: "New Planner" },
      { href: "/generator.html", name: "Plan Generator" },
    ],
  },
  {
    name: "Team Progress",
    prototypes: [
      { href: "/advanced-what-if.html", name: "Advanced What-If" },
      {
        name: "Proactive Compliance",
        /* Two ways in, because the prototype is a walk rather than a screen.
           Straight to the record is the compliance question asked of one
           student; the search is the same question asked of the institution,
           and the answer is a list you click a name out of. Landing on one of
           them and never finding the other would be missing half of it. */
        entries: [
          { href: "/compliance.html", name: "Student record" },
          { href: "/students.html", name: "Student search" },
        ],
      },
      { href: "/explain.html", name: "Explain Progress" },
      { href: "/staff-home.html", name: "Staff Home" },
    ],
  },
  {
    name: "Team Explore",
    prototypes: [
      { href: "/explore.html", name: "Prospective Student Lite" },
      { href: "/transfer-insights.html", name: "Transfer Insights" },
    ],
  },
]

const REPO = "https://github.com/naqi-stellic/stellic-summit-2026"

type Entry = { href: string; name: string }

/** One way into a prototype: the card is the link, and the chevron is a
 *  signpost rather than a second thing to hit. */
function Way({ href, name }: Entry) {
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

/** A prototype with more than one door. The card stops being the link — it
 *  cannot be two of them — so it keeps the name and the ways in sit under it,
 *  named for where you start rather than for what you will see. */
function Ways({ name, entries }: { name: string; entries: Entry[] }) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-gray-40 bg-card p-[19px] shadow-sm">
      <span className="text-h300 font-semibold text-gray-100">{name}</span>
      <div className="flex flex-wrap gap-2">
        {entries.map((entry) => (
          <a
            key={entry.href}
            href={entry.href}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-1.5 rounded-md border border-gray-40 bg-card px-[11px] py-[7px] text-body-md text-gray-100 transition-colors hover:border-primary-50 hover:bg-gray-0"
          >
            {entry.name}
            <Icon
              name="chevron-right"
              size={14}
              className="shrink-0 text-gray-60 transition-all group-hover:translate-x-0.5 group-hover:text-primary-50"
            />
          </a>
        ))}
      </div>
    </div>
  )
}

function Prototype({ href, name, entries }: { href?: string; name: string; entries?: Entry[] }) {
  if (entries) return <Ways name={name} entries={entries} />
  return <Way href={href!} name={name} />
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
                  <Prototype key={prototype.name} {...prototype} />
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
