import { Icon } from "@/components/icon"

/* The way in. Each prototype is a page of its own, so this is a page of links
 * rather than a router: the two open in their own tabs and neither can be
 * navigated out of by accident. */

const PROTOTYPES = [
  { href: "/planner.html", name: "Planner" },
  { href: "/generator.html", name: "Plan Generator" },
]

export function Landing() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-10 bg-background p-6">
      <div className="flex w-full max-w-[860px] flex-col items-center gap-3 text-center">
        <img src="/brand/stellic-wordmark.svg" alt="Stellic" className="h-8 w-[139.156px]" />
        <h1 className="text-h400 font-semibold text-gray-100">Team Plan prototypes</h1>
        <p className="text-body-md text-gray-80">Summit 2026</p>
      </div>

      <div className="grid w-full max-w-[860px] gap-4 @container md:grid-cols-2">
        {PROTOTYPES.map((prototype) => (
          <a
            key={prototype.href}
            href={prototype.href}
            target="_blank"
            rel="noreferrer"
            /* A name and the way in, centred: with nothing under the name to
               read, a card tall enough to hold a paragraph would be mostly
               empty. */
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
    </main>
  )
}
