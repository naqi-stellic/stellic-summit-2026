import type { ReactNode } from "react"

import { Icon } from "@/components/icon"
import { useMediaQuery } from "@/lib/use-media-query"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { Button } from "@/components/ui/button"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

/* The shell owns the viewport: it never scrolls, so the sidebar and top bar
 * stay put and each content column scrolls on its own. That is also what makes
 * the resizable split work — the panel group needs a bounded height. */

export function AppShell({
  title,
  children,
  panel,
  assistLabel = "Generate with Assistant",
}: {
  title: string
  children: ReactNode
  /** When present, the content area splits into a resizable two-column view. */
  panel?: ReactNode
  /** What the pill beside the assistant offers to do next. `null` for a
   *  prototype that does not generate: the assistant keeps its own button. */
  assistLabel?: string | null
}) {
  /* Below the tablet breakpoint there is no room for two columns side by side,
   * so the split turns on its side and the panel sits under the planner. */
  const wide = useMediaQuery("(min-width: 768px)")

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        {/* The nav is 240px of a phone's 390 — it goes away, and the planner
            gets the width. */}
        <div className="max-md:hidden">
          <Sidebar />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar title={title} />

          {/* The panel group is always mounted so `children` keeps its place in
              the tree; swapping the wrapper would remount the whole planner and
              throw away its scroll position and drag state. */}
          <div className="flex min-h-0 flex-1 bg-background">
            <ResizablePanelGroup
              orientation={wide ? "horizontal" : "vertical"}
              className="min-w-0 flex-1"
            >
              {/* Sizes are pixels in react-resizable-panels v4, so these are the
                  design's own numbers: a 434px panel beside the planner. */}
              <ResizablePanel minSize={wide ? 520 : 200} className="flex">
                {children}
              </ResizablePanel>
              {panel && (
                <>
                  {/* The 4px rail between planner and panel is the divider in
                      the design, so the drag handle is that rail rather than an
                      extra line. `after` widens the grab target, not the rail. */}
                  <ResizableHandle className="bg-gray-40 transition-colors hover:bg-primary-50 data-[resize-handle-state=drag]:bg-primary-50 max-md:h-1 max-md:after:h-3 md:w-1 md:after:w-3" />
                  <ResizablePanel
                    defaultSize={wide ? 520 : 420}
                    minSize={wide ? 340 : 200}
                    maxSize={wide ? 760 : undefined}
                    className="flex"
                  >
                    {panel}
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
            {/* Same rail, decorative, when there is nothing to divide. */}
            {!panel && wide && <div aria-hidden="true" className="w-1 shrink-0 bg-gray-40" />}
          </div>
        </div>
      </div>

      <div className="fixed right-10 bottom-10 flex max-w-[calc(100vw-3rem)] items-center gap-[10px] max-md:right-4 max-md:bottom-4">
        {panel && assistLabel && (
          /* A pill in the design, not the usual 4px button radius. On a phone
             it would sit on top of the panel it refers to, so only the
             assistant itself floats. */
          <Button size="sm" className="rounded-full max-md:hidden">
            {assistLabel}
          </Button>
        )}
        <button
          type="button"
          aria-label="Ask Stellic AI"
          className="flex size-[58px] shrink-0 items-center justify-center rounded-full bg-gray-100 text-white shadow-2xl"
        >
          <Icon name="auto-awesome" size={20} />
        </button>
      </div>
    </>
  )
}
