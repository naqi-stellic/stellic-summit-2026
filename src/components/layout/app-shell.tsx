import type { ReactNode } from "react"

import { Icon } from "@/components/icon"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar title={title} />
          <div className="flex min-h-0 flex-1 bg-background">
            {children}
            {/* Decorative scroll track, present in the design. */}
            <div aria-hidden="true" className="w-1 shrink-0 bg-gray-40" />
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label="Ask Stellic AI"
        className="fixed right-10 bottom-10 flex size-[58px] items-center justify-center rounded-full bg-gray-100 text-white shadow-2xl"
      >
        <Icon name="auto-awesome" size={20} />
      </button>
    </>
  )
}
