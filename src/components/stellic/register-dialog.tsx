import { useEffect, useState } from "react"

import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { registrableCourses, type PlannedCourse, type Term } from "@/data/plan"

/* Putting a term's classes through registration: what is about to go, the wait
 * while it does, and what came back. One dialog in three states, because it is
 * one action — closing it halfway through would leave the question of whether
 * it happened. */

/** How long the request appears to take. Long enough to read, short enough
 *  that nobody on stage is waiting on it. */
const SENDING_MS = 1600

function CourseCard({ course }: { course: PlannedCourse }) {
  return (
    <div className="flex w-full flex-col gap-1 rounded-md border border-gray-40 bg-card p-3">
      <p className="truncate text-body-md text-gray-80">{course.code}</p>
      <p className="text-body-md font-semibold text-gray-100">{course.name}</p>
      {course.section && (
        <p className="flex items-center gap-1 text-body-md text-gray-100">
          <Icon name="calendar-today" size={14} className="shrink-0" />
          {course.section}
        </p>
      )}
    </div>
  )
}

export function RegisterDialog({
  term,
  onClose,
  onRegister,
}: {
  /** The term being registered, or null when the dialog is closed. */
  term: Term | null
  onClose: () => void
  onRegister: (termId: string, courseIds: string[]) => void
}) {
  const [stage, setStage] = useState<"confirm" | "sending" | "done">("confirm")
  /* Held from the moment Confirm is pressed: registering them changes what is
     registrable, and the dialog has to go on showing what it just sent. */
  const [sent, setSent] = useState<PlannedCourse[]>([])

  /* A fresh term is a fresh question — but only a different term. Registering
     rewrites the term this is holding, and starting over on that would throw
     away the answer the moment it arrived. */
  const termId = term?.id
  useEffect(() => {
    if (termId) {
      setStage("confirm")
      setSent([])
    }
  }, [termId])

  useEffect(() => {
    if (stage !== "sending" || !term) return
    const timer = window.setTimeout(() => {
      onRegister(
        term.id,
        sent.map((c) => c.id)
      )
      setStage("done")
    }, SENDING_MS)
    return () => window.clearTimeout(timer)
    /* Deliberately not watching `term`: it changes as a result of this. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, termId])

  if (!term) return null

  const going = stage === "confirm" ? registrableCourses(term) : sent
  const count = going.length

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-4 sm:max-w-[460px]" showCloseButton={false}>
        {/* The design puts the close on its own line above everything, at the
            left — not floating in the top corner, which is where the shadcn
            dialog has it. Nothing to close while the request is in the air. */}
        {stage !== "sending" && (
          <DialogClose className="cursor-pointer justify-self-start rounded-md text-gray-80 transition-colors hover:text-gray-100">
            <Icon name="close" size={24} />
            <span className="sr-only">Close</span>
          </DialogClose>
        )}

        {stage === "done" ? (
          <div className="flex w-full flex-col items-center gap-4 pt-2 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-success-5 text-success-100">
              <Icon name="event-available" size={24} />
            </span>
            <DialogHeader className="items-center gap-1.5 text-center sm:text-center">
              <DialogTitle className="text-h400">
                {count} Course{count === 1 ? "" : "s"} Registered
              </DialogTitle>
              <DialogDescription>
                Your selected courses were successfully registered. You may return to Registration
                to continue to register new courses while the registration window is still open.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="w-full">
              <Button className="w-full" onClick={onClose}>
                Back to {term.name}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            {stage === "sending" ? (
              <div className="flex w-full flex-col items-center gap-1.5 text-center">
                <span className="size-6 animate-spin rounded-full border-2 border-gray-40 border-t-gray-80" />
                <DialogTitle>Registering…</DialogTitle>
                <DialogDescription>
                  Sending request to register the following courses
                </DialogDescription>
              </div>
            ) : (
              <DialogHeader className="gap-1.5">
                <DialogTitle>
                  Register {count} Course{count === 1 ? "" : "s"}
                </DialogTitle>
                <DialogDescription>
                  {count > 0
                    ? "Confirm registration for the following courses:"
                    : "Nothing in this term can be registered yet. A course needs a section before it can go through."}
                </DialogDescription>
              </DialogHeader>
            )}

            <div className="flex w-full flex-col gap-2">
              {going.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {stage === "confirm" && count > 0 && (
              <DialogFooter className="w-full">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    setSent(going)
                    setStage("sending")
                  }}
                >
                  Confirm
                </Button>
              </DialogFooter>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
