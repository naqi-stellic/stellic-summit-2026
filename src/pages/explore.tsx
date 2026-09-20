import { useEffect, useRef, useState } from "react"

import { Icon } from "@/components/icon"
import { useScript } from "@/lib/typing"
import { Button } from "@/components/ui/button"
import { ExploreShell } from "@/components/stellic/explore-shell"
import {
  CardHeading,
  ChoiceCard,
  ChoiceRow,
  ExploreCard,
  ExploreCardBody,
  InlineLink,
  ReadingSpinner,
  SearchField,
  SectionLabel,
  TranscriptAlert,
} from "@/components/stellic/transfer-wizard"
import { TransferQuestions, type Answers } from "@/components/stellic/transfer-questions"
import {
  DiscoverCard,
  ProgramsCard,
  VerdictCard,
  VisitorRail,
} from "@/components/stellic/transfer-results"
import {
  CREDIT_KINDS,
  EXAM_BOARD,
  INSTITUTIONS,
  PROCESSING_MS,
  UPLOADED_FILE,
  type CreditKind,
  type Transcript,
} from "@/data/transfer"

/* Explore Transfer Credits.
 *
 * A prospective transfer student, before there is any such thing as a student
 * record: they arrive with a transcript and leave with a number. The flow is
 * four questions long and every one of them is the same card changing what it
 * asks — which kind of credit, from where, how you want to hand it over, and
 * then the three that shape the recommendation.
 *
 * The screen the prototype exists to show is the fifth state, where the
 * transcript is being read and the questions are answerable anyway. A minute
 * of OCR is a minute of nothing to look at, so the design spends it: the
 * questions appear the moment the file is handed over, the primary button
 * waits on the read rather than on the answers, and a visitor who skips every
 * question still gets their credits. That is the difference between a progress
 * bar and a wait that was worth having.
 *
 * State lives here rather than in the pieces because every piece needs the
 * same two facts — what has been handed over, and how far through reading it
 * we are. A transcript at 100 is a transcript that is ready; there is no
 * second flag to disagree with it. */

type Step = "kind" | "transcript" | "questions" | "results"

/** A transcript and how far through reading it we are. */
type Entry = Transcript & { progress: number }

/** Reading runs on one interval for every entry at once, because the design
 *  lets a second transcript be added while the first is still going. */
const TICK_MS = 80

let nextId = 0

export function Explore() {
  const [step, setStep] = useState<Step>("kind")
  /* The transcript being added, before it has a file. Null between additions. */
  const [draft, setDraft] = useState<{ kind: CreditKind; name: string } | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  /* The inline chooser on the questions screen, which is the same two tiles as
     the first step rather than a second way of asking the same thing. */
  const [adding, setAdding] = useState(false)

  const [answers, setAnswers] = useState<Answers>({})
  const [interests, setInterests] = useState<string[]>([])
  const [query, setQuery] = useState("")
  const [institution, setInstitution] = useState("")

  const fileInput = useRef<HTMLInputElement>(null)

  /* One timer for every unread transcript. It stops itself once they are all
     at 100, so a finished page is not still ticking behind the results. */
  const reading = entries.some((entry) => entry.progress < 100)
  useEffect(() => {
    if (!reading) return
    const increment = (100 * TICK_MS) / PROCESSING_MS
    const timer = setInterval(() => {
      setEntries((current) =>
        current.map((entry) =>
          entry.progress < 100
            ? { ...entry, progress: Math.min(100, entry.progress + increment) }
            : entry
        )
      )
    }, TICK_MS)
    return () => clearInterval(timer)
  }, [reading])

  const ready = entries.length > 0 && !reading

  function startKind(kind: CreditKind) {
    setDraft({ kind, name: kind === "exam" ? EXAM_BOARD : "" })
    setInstitution("")
    setAdding(false)
    setStep("transcript")
  }

  /** The upload tile opens the real file dialog, because the artboard between
   *  "Provide credit details" and "Reading your transcript" is a screenshot of
   *  exactly that — the OS picker, which is not ours to draw. */
  function pickFile() {
    fileInput.current?.click()
  }

  function acceptFile(file?: File) {
    if (!draft) return
    const name = draft.kind === "exam" ? EXAM_BOARD : institution
    setEntries((current) => [
      ...current,
      {
        id: `t${nextId++}`,
        kind: draft.kind,
        name,
        file: file?.name ?? UPLOADED_FILE,
        progress: 0,
      },
    ])
    setDraft(null)
    setStep("questions")
  }

  /** Edit and Back are the same move: the transcript comes off the list and
   *  the flow reopens on the step that made it. One way back, not two. */
  function editEntry(entry: Entry) {
    setEntries((current) => current.filter((item) => item.id !== entry.id))
    setDraft({ kind: entry.kind, name: entry.name })
    setInstitution(entry.kind === "college" ? entry.name : "")
    setAdding(false)
    setStep("transcript")
  }

  function deleteEntry(id: string) {
    const left = entries.filter((entry) => entry.id !== id)
    setEntries(left)
    if (left.length === 0) {
      setDraft(null)
      setStep("kind")
    }
  }

  if (step === "results") {
    return (
      <ExploreShell>
        <main className="@container min-h-0 min-w-0 flex-1 overflow-y-auto">
          {/* One scroller, at the window's edge, rather than one per column:
              a scrollbar belonging to the middle column runs down the middle
              of the page and sits on top of the cards. The page scrolls, and
              the rail stays where it is by sticking rather than by being in a
              box of its own. */}
          <div className="mx-auto flex w-full max-w-[1349px] flex-col gap-4 px-6 py-12 @7xl:flex-row @7xl:items-start">
            {/* The rail leads on a narrow screen and sits beside the answer on
                a wide one: on a phone the thing worth pressing should not be
                three cards down. Stuck at the padding it starts on, so it does
                not travel at all — what you gave us, and Start application,
                stay put while the answer moves. */}
            <VisitorRail
              className="shrink-0 @7xl:sticky @7xl:top-12 @7xl:order-last"
              transcripts={entries}
              answers={answers}
              interests={interests}
              onEditTranscripts={() => setStep("questions")}
              onEditProfile={() => setStep("questions")}
            />
            <div className="flex w-full min-w-0 flex-col gap-4">
              <VerdictCard />
              <ProgramsCard />
              <DiscoverCard />
            </div>
          </div>
        </main>
      </ExploreShell>
    )
  }

  return (
    <ExploreShell>
      <main className="@container min-h-0 min-w-0 flex-1 overflow-y-auto px-6 py-12">
        <div className="mx-auto w-full max-w-[973px]">
          <ExploreCard>
            <ExploreCardBody>
              {step === "kind" && (
                <>
                  <CardHeading
                    title="Add your transcript"
                    description="Select the type of credit you have."
                  />
                  <ChoiceRow>
                    {CREDIT_KINDS.map((option) => (
                      <ChoiceCard
                        key={option.kind}
                        icon={option.icon}
                        title={option.title}
                        description={option.description}
                        onClick={() => startKind(option.kind)}
                      />
                    ))}
                  </ChoiceRow>
                </>
              )}

              {step === "transcript" && draft && (
                <TranscriptStep
                  kind={draft.kind}
                  institution={institution}
                  onInstitution={setInstitution}
                  onUpload={pickFile}
                  onCancel={() => {
                    setDraft(null)
                    setStep(entries.length > 0 ? "questions" : "kind")
                  }}
                />
              )}

              {step === "questions" && (
                <>
                  <CardHeading
                    title="Add your transcript"
                    description="Include every school and exam you've earned credit from."
                  />

                  <div className="flex w-full flex-col gap-4">
                    {entries.map((entry) => (
                      <TranscriptState
                        key={entry.id}
                        entry={entry}
                        onEdit={() => editEntry(entry)}
                        onDelete={() => deleteEntry(entry.id)}
                      />
                    ))}

                    {adding ? (
                      /* The same two tiles as the first step, opened in place
                         under the transcripts they are being added to. */
                      <div className="flex w-full flex-col gap-4">
                        <div className="flex items-start justify-between gap-4">
                          <SectionLabel>Add Transcript</SectionLabel>
                          <button
                            type="button"
                            aria-label="Cancel adding a transcript"
                            onClick={() => setAdding(false)}
                            className="shrink-0 text-gray-80 hover:text-gray-100"
                          >
                            <Icon name="close" size={16} />
                          </button>
                        </div>
                        <ChoiceRow>
                          {CREDIT_KINDS.map((option) => (
                            <ChoiceCard
                              key={option.kind}
                              icon={option.icon}
                              title={option.title}
                              description={option.description}
                              onClick={() => startKind(option.kind)}
                            />
                          ))}
                        </ChoiceRow>
                      </div>
                    ) : (
                      <InlineLink className="self-start" onClick={() => setAdding(true)}>
                        + Add another transcript
                      </InlineLink>
                    )}
                  </div>

                  <TransferQuestions
                    answers={answers}
                    onAnswer={(id, value) =>
                      setAnswers((current) => ({
                        ...current,
                        [id]: current[id] === value ? undefined : value,
                      }))
                    }
                    interests={interests}
                    onToggleInterest={(interest) =>
                      setInterests((current) =>
                        current.includes(interest)
                          ? current.filter((item) => item !== interest)
                          : [...current, interest]
                      )
                    }
                    query={query}
                    onQuery={setQuery}
                    footer={
                      <div className="flex items-start gap-2">
                        <Button onClick={() => entries[0] && editEntry(entries[entries.length - 1])}>
                          Back
                        </Button>
                        {/* Waits on the transcript, never on the answers. */}
                        <Button
                          variant="primary"
                          disabled={!ready}
                          onClick={() => setStep("results")}
                        >
                          See my results
                        </Button>
                      </div>
                    }
                  />
                </>
              )}
            </ExploreCardBody>
          </ExploreCard>
        </div>

        <input
          ref={fileInput}
          type="file"
          accept="application/pdf,image/*"
          className="hidden"
          onChange={(event) => acceptFile(event.target.files?.[0])}
        />
      </main>
    </ExploreShell>
  )
}

/** What the institution search types for you. The shortest thing that narrows
 *  the list to one, which is what a person would have typed. */
const SEARCH_EXAMPLE = "Berkshire"

/* ============================================================ Transcript step */

/** Where the credits came from, and how you want to hand them over.
 *
 * One step with two halves rather than two steps: the design only shows the
 * second half once the first is answered, and splitting them would have put a
 * screen between choosing a college and saying what you have from it. */
function TranscriptStep({
  kind,
  institution,
  onInstitution,
  onUpload,
  onCancel,
}: {
  kind: CreditKind
  institution: string
  onInstitution: (value: string) => void
  onUpload: () => void
  onCancel: () => void
}) {
  const [query, setQuery] = useState(institution)
  const chosen = kind === "exam" || Boolean(institution)

  /* The field fills itself in the first time it is clicked into: "Berkshire"
     is what somebody would type, the list narrows to one on it, and taking
     that row is what puts the whole name in. Typing all twenty-eight
     characters on a projector is not a demonstration of anything.

     It is the person's field afterwards — the first keystroke calls the
     script off, and it only ever fills once. */
  const script = useScript()
  const filled = useRef(false)

  const autofill = () => {
    if (filled.current || kind === "exam" || institution) return
    filled.current = true
    void (async () => {
      if (!(await script.type(SEARCH_EXAMPLE, setQuery))) return
      if (!(await script.wait())) return
      const found = INSTITUTIONS.find((name) =>
        name.toLowerCase().startsWith(SEARCH_EXAMPLE.toLowerCase())
      )
      if (!found) return
      onInstitution(found)
      setQuery(found)
    })()
  }

  const matches =
    query.trim() && query !== institution
      ? INSTITUTIONS.filter((name) => name.toLowerCase().includes(query.trim().toLowerCase()))
      : []

  return (
    <>
      <CardHeading
        title="Add your transcript"
        description={
          kind === "exam"
            ? "Tell us about your exam credits."
            : chosen
              ? "Tell us about your college credits."
              : "Tell us where you earned your credits."
        }
      />

      <div className="flex w-full flex-col gap-4">
        <div className="flex w-full flex-col gap-2">
          <SectionLabel>
            {kind === "exam"
              ? "Which examination do you have credits from"
              : "Which institution do you have credits from"}
          </SectionLabel>
          <div className="flex w-full items-start gap-4">
            <div className="relative min-w-0 flex-1">
              <SearchField
                placeholder="Search institution"
                value={kind === "exam" ? EXAM_BOARD : query}
                searching={!chosen}
                readOnly={kind === "exam"}
                onFocus={autofill}
                onClick={autofill}
                onChange={(event) => {
                  script.stop()
                  setQuery(event.target.value)
                  onInstitution("")
                }}
                aria-label="Search institution"
              />
              {matches.length > 0 && (
                /* Not in the file — the artboard jumps from an empty field to
                   a filled one — but a field you cannot pick from is not a
                   search. Kept to the plainest list that does the job. */
                <ul className="absolute top-full right-0 left-0 z-20 mt-1 overflow-hidden rounded-md border border-gray-40 bg-card shadow-secondary">
                  {matches.map((name) => (
                    <li key={name}>
                      <button
                        type="button"
                        className="w-full px-[11px] py-2 text-left text-body-md text-gray-100 hover:bg-gray-0"
                        onClick={() => {
                          onInstitution(name)
                          setQuery(name)
                        }}
                      >
                        {name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Button
              size="icon"
              aria-label="Discard this transcript"
              onClick={onCancel}
              className="shrink-0"
            >
              <Icon name="delete" size={16} className="text-gray-80" />
            </Button>
          </div>
        </div>

        {chosen && (
          <div className="flex w-full flex-col gap-2">
            <SectionLabel>Provide credit details</SectionLabel>
            <ChoiceRow>
              <ChoiceCard
                icon="file-upload"
                title="Upload your transcript"
                description="Upload your transcript as a PDF"
                onClick={onUpload}
              />
              {/* The master flow types courses into a table by hand. Out of
                  this prototype's scope, and drawn rather than dropped so the
                  step still reports what the design offers — at full strength,
                  because the flow is real even where this build stops. */}
              <ChoiceCard
                icon="keyboard"
                title="Manually enter your courses"
                description="Enter the courses you've taken and your grades"
                drawn
              />
            </ChoiceRow>
          </div>
        )}
      </div>
    </>
  )
}

/* ============================================================ Alert states */

/** Reading, then ready. One component because it is one banner in the design,
 *  swapping its ground, its glyph and what it offers on the right. */
function TranscriptState({
  entry,
  onEdit,
  onDelete,
}: {
  entry: Entry
  onEdit: () => void
  onDelete: () => void
}) {
  if (entry.progress < 100) {
    return (
      <TranscriptAlert
        tone="reading"
        icon={<ReadingSpinner />}
        title={`Reading your ${entry.name} transcript...`}
        description="This can take up to 60 seconds."
      >
        <span className="text-body-md text-gray-80 tabular-nums">
          {Math.round(entry.progress)}%
        </span>
      </TranscriptAlert>
    )
  }

  return (
    <TranscriptAlert
      tone="ready"
      icon={<Icon name="school" size={16} className="text-success-100" />}
      title={`${entry.name} transcript ready`}
      description={`${entry.file} is ready. Click “See my results” to find courses you can get credit for.`}
    >
      <InlineLink onClick={onEdit}>edit</InlineLink>
      <InlineLink onClick={onDelete}>delete</InlineLink>
    </TranscriptAlert>
  )
}
