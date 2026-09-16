import type { ReactNode } from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { VISITOR } from "@/data/transfer"

/* The chrome for a screen that is not the product.
 *
 * Everything else in this repo hangs off `AppShell` — sidebar, top bar,
 * assistant — because everything else is someone signed in to Stellic. This
 * one is a prospective student on the university's own site, so there is no
 * nav to stand in: the institution's mark and the name of what they are doing,
 * a way to ask for help, and the page. Stellic is the engine, and says so at
 * the foot of the screens where nobody has signed in yet.
 *
 * Which is why this is a second shell rather than a case inside the first.
 * `AppShell` owns the viewport so its columns can scroll independently; this
 * page is one column and scrolls as a page, and adding a "no nav, no bar, no
 * assistant" mode to the other would have left an AppShell that is only a
 * shell for half of its callers. */

export function ExploreShell({
  children,
  title = "Explore Transfer Credits",
}: {
  children: ReactNode
  title?: string
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-gray-40 bg-card px-6">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <img
            src="/brand/stellic-wordmark.svg"
            alt="Stellic"
            className="h-6 w-[103.7px] shrink-0"
          />
          <p className="min-w-0 flex-1 truncate text-h400 font-semibold text-gray-100">{title}</p>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <Button>Need help?</Button>
          <Avatar size="lg">
            <AvatarFallback className="text-body-md text-foreground">
              {VISITOR.initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {children}
    </div>
  )
}
