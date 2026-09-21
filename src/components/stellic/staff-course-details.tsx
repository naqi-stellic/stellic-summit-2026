import { cn } from "cn"
import { useEffect, useMemo, useState, type ReactNode } from "react"

import { Icon } from "@/components/icon"
import { useToast } from "@/components/stellic/staff-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { lookupSteps, type CatalogMatch } from "@/data/staff-insights"

/* Course Description.
 *
 * Writing an equivalency means knowing what the incoming course actually was,
 * and nobody here has Berkshire's catalogue. The slow half of the job is opening a
 * tab, finding a college's site and reading a paragraph — so the assistant goes
 * and reads it.
 *
 * It opens where the button was, in the column the course is in, rather than
 * over the page: what it says is about that course and is read against it, and
 * a dialog would cover the very thing it describes.
 *
 * Two things make it honest rather than magical. It says what it is doing while
 * it does it, naming the institution and the code rather than turning a
 * spinner; and it says where it read, so the answer can be checked instead of
 * trusted. The line at the foot is not boilerplate — it is the same point, and
 * the thumbs beside it are how a wrong answer gets reported. */

/** The lookup takes as long as it takes, but never longer than this. Five
 *  steps, one a second: long enough to watch, short enough to sit through. */
const STEP_MS = 1000

/** How fast the answer arrives once it has been found. Per word, so a long
 *  description takes longer than a short one, as writing does. */
const WORD_MS = 26

/* ---------------------------------------------------------------- streaming
   The card fills rather than appearing, which is the difference between "here
   is a paragraph" and "this is being written for you now". Everything the card
   will show is flattened into one queue and revealed in order, so it grows
   downward at a steady rate whatever is in it. */

type Piece =
  | { kind: "title" | "school" | "summary" | "source"; text: string }
  | { kind: "more" | "footer" }

const words = (text: string) => text.split(" ")

function queueOf(match: CatalogMatch): Piece[] {
  return [
    ...words(match.title).map((text) => ({ kind: "title" as const, text })),
    ...words(match.school).map((text) => ({ kind: "school" as const, text })),
    ...words(match.summary).map((text) => ({ kind: "summary" as const, text })),
    { kind: "more" as const },
    ...match.sources.map((text) => ({ kind: "source" as const, text })),
    { kind: "footer" as const },
  ]
}

/** A word arriving. Each one fades in on its own, so the paragraph reads as
 *  something being written rather than something revealed. */
const Word = ({ children }: { children: ReactNode }) => (
  <span className="animate-fade">{children} </span>
)

/* ---------------------------------------------------------------- footer */

function Feedback() {
  const toast = useToast()
  const [vote, setVote] = useState<"up" | "down" | null>(null)
  const [sent, setSent] = useState(false)
  const [note, setNote] = useState("")

  const thumb = (which: "up" | "down") => (
    <button
      type="button"
      onClick={() => setVote(which)}
      aria-label={which === "up" ? "Good descriptions" : "Poor descriptions"}
      aria-pressed={vote === which}
      className={cn(
        "flex cursor-pointer pt-0.5 transition-colors",
        vote === which ? "text-primary-50" : "text-gray-80 hover:text-gray-100"
      )}
    >
      <Icon name={which === "up" ? "thumb-up" : "thumb-down"} size={14} />
    </button>
  )

  return (
    <div className="flex animate-fade flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="flex shrink-0 items-start gap-1.5">
          {thumb("up")}
          {thumb("down")}
        </div>
        <p className="min-w-0 flex-1 text-label-md text-gray-60">
          Details may contain errors, verify with the source links. Provide feedback on the quality
          of the course descriptions.
        </p>
      </div>

      {/* Only a complaint is asked to explain itself — a thumbs up is already
          the whole message. */}
      {vote === "down" &&
        (sent ? (
          <p className="text-label-md text-gray-80">
            Feedback sent. Thanks for helping improve results.
          </p>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault()
              setSent(true)
              toast("Feedback sent. (Exists in the real app)")
            }}
            className="flex gap-2"
          >
            <Input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Provide feedback"
              aria-label="Feedback on the course description"
            />
            <Button type="submit" variant="primary">
              Submit
            </Button>
          </form>
        ))}
    </div>
  )
}

/* ---------------------------------------------------------------- the card */

export function CourseDetails({
  institution,
  code,
  match,
  onClose,
}: {
  institution: string
  code: string
  match: CatalogMatch
  onClose: () => void
}) {
  const steps = useMemo(() => lookupSteps(institution, code), [institution, code])
  const queue = useMemo(() => queueOf(match), [match])

  /** -1 while searching; then the number of pieces on screen. */
  const [revealed, setRevealed] = useState(-1)
  const [step, setStep] = useState(0)

  /* Searching, then writing: two different things at two different speeds, so
     two timers. The card is mounted fresh each time it is opened, so there is
     nothing to reset on the way out. */
  useEffect(() => {
    const ticks = steps.map((_, i) => window.setTimeout(() => setStep(i), STEP_MS * i))
    const start = window.setTimeout(() => setRevealed(0), STEP_MS * steps.length)
    return () => {
      ticks.forEach(window.clearTimeout)
      window.clearTimeout(start)
    }
  }, [steps])

  useEffect(() => {
    if (revealed < 0 || revealed >= queue.length) return
    const tick = window.setTimeout(() => setRevealed((n) => n + 1), WORD_MS)
    return () => window.clearTimeout(tick)
  }, [revealed, queue.length])

  const searching = revealed < 0
  const working = searching || revealed < queue.length
  const shown = searching ? [] : queue.slice(0, revealed)
  const of = (kind: Piece["kind"]) => shown.filter((piece) => piece.kind === kind)

  const title = of("title")
  const school = of("school")
  const summary = of("summary")
  const sources = of("source")

  return (
    /* `relative` here rather than in the class: `.ai-glow` cannot set it,
       because the glow also goes on things that are positioned already. */
    <div
      data-working={working}
      className="ai-glow relative rounded-md border border-gray-40 bg-card shadow-[0_-2px_24px_0_rgb(47_167_127_/_0.08),0_4px_24px_0_rgb(0_141_255_/_0.08)]"
    >
      {/* The header and the body carry their own ground. The glow is a
          negative-z pseudo-element, which paints over the card's own background
          but under anything inside it — so the colour is left in the 2px
          outside the edge, where it belongs. */}
      <div className="flex items-center gap-2 rounded-t-md border-b border-gray-40 bg-card py-1.5 pr-2 pl-4">
        <Icon name="auto-awesome" size={16} className="text-gray-100" />
        <p className="flex-1 text-body-md font-semibold text-gray-100">Course Description</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close course description"
          className="flex size-8 cursor-pointer items-center justify-center rounded-md text-gray-100 hover:bg-gray-5"
        >
          <Icon name="close" size={14} />
        </button>
      </div>

      <div className="flex flex-col gap-4 rounded-b-md bg-card p-4">
        {searching ? (
          /* Named, so the wait says what is being waited on. */
          <p className="ai-shimmer text-body-md" aria-live="polite">
            {steps[step]}
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <p className="text-body-md font-semibold text-foreground">
                {title.map((piece, i) => (
                  <Word key={i}>{"text" in piece ? piece.text : null}</Word>
                ))}
              </p>

              {!!school.length && (
                <p className="text-body-md text-foreground">
                  {school.map((piece, i) => (
                    <Word key={i}>{"text" in piece ? piece.text : null}</Word>
                  ))}
                </p>
              )}

              {!!summary.length && (
                <p className="text-body-md text-gray-80">
                  {summary.map((piece, i) => (
                    <Word key={i}>{"text" in piece ? piece.text : null}</Word>
                  ))}
                  {shown.some((piece) => piece.kind === "more") && (
                    <button
                      type="button"
                      className="animate-fade cursor-pointer underline [text-underline-position:from-font]"
                    >
                      view more
                    </button>
                  )}
                </p>
              )}

              {!!sources.length && (
                <div className="flex flex-wrap gap-2">
                  {sources.map((piece, i) => (
                    <span
                      key={i}
                      className="flex animate-fade items-center gap-1 rounded-md bg-gray-5 px-2 py-0.5 text-label-md text-gray-100"
                    >
                      <Icon name="open-in-new" size={12} className="text-gray-80" />
                      {"text" in piece ? piece.text : null}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {shown.some((piece) => piece.kind === "footer") && <Feedback />}
          </>
        )}
      </div>
    </div>
  )
}
