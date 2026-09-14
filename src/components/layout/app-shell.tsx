import type { ReactNode } from "react"

import { Icon } from "@/components/icon"
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
}: {
  title: string
  children: ReactNode
  /** When present, the content area splits into a resizable two-column view. */
  panel?: ReactNode
}) {
  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar title={title} />

          {/* The panel group is always mounted so `children` keeps its place in
              the tree; swapping the wrapper would remount the whole planner and
              throw away its scroll position and drag state. */}
          <div className="flex min-h-0 flex-1 bg-background">
            <ResizablePanelGroup orientation="horizontal" className="min-w-0 flex-1">
              {/* Sizes are pixels in react-resizable-panels v4, so these are the
                  design's own numbers: a 434px panel beside the planner. */}
              <ResizablePanel minSize={520} className="flex">
                {children}
              </ResizablePanel>
              {panel && (
                <>
                  {/* The 4px rail between planner and panel is the divider in
                      the design, so the drag handle is that rail rather than an
                      extra line. `after` widens the grab target, not the rail. */}
                  <ResizableHandle className="w-1 bg-gray-40 transition-colors after:w-3 hover:bg-primary-50 data-[resize-handle-state=drag]:bg-primary-50" />
                  <ResizablePanel defaultSize={520} minSize={340} maxSize={760} className="flex">
                    {panel}
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
            {/* Same rail, decorative, when there is nothing to divide. */}
            {!panel && <div aria-hidden="true" className="w-1 shrink-0 bg-gray-40" />}
          </div>
        </div>
      </div>

      <div className="fixed right-10 bottom-10 flex items-center gap-[10px]">
        {panel && (
          /* A pill in the design, not the usual 4px button radius. */
          <Button size="sm" className="rounded-full">
            Generate with Assistant
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
