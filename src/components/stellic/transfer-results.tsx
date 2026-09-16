import type { ReactNode } from "react"
import { cn } from "cn"

import { Icon } from "@/components/icon"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExploreCard, ExploreCardBody, SectionLabel } from "@/components/stellic/transfer-wizard"
import {
  DISCOVER,
  PROGRAMS,
  PROFILE_QUESTIONS,
  TOTAL_CREDITS,
  TRANSFER_COURSES,
  UNIVERSITY,
  VERDICT_SECTIONS,
  VISITOR,
  creditsBy,
  type Transcript,
  type TransferCourse,
} from "@/data/transfer"
import type { Answers } from "@/components/stellic/transfer-questions"

/* The answer, in four parts: what transferred, what to study, what else to
 * know, and who is asking.
 *
 * The order is the argument. The number comes first because it is the only
 * thing the visitor came for; programs come second because a credit count is
 * useless without somewhere to spend it; the university's own content comes
 * last because it is the only thing on the page that is not about this person.
 * The rail holds what they gave us and the one thing we want them to do. */

/* ============================================================ Verdict */

/** Said twice: once in a sentence, once as a bar. The bar is not decoration —
 *  it is the only place the three totals are in proportion to each other,
 *  which is the difference between "8 pending" and "8 pending out of 25". */
function VerdictBar() {
  const confirmed = (creditsBy("confirmed") / TOTAL_CREDITS) * 100
  const pending = (creditsBy("pending") / TOTAL_CREDITS) * 100

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-divider">
      <div className="flex h-full">
        <div className="h-full bg-success-50" style={{ width: `${confirmed}%` }} />
        <div className="h-full bg-warning-25" style={{ width: `${pending}%` }} />
      </div>
    </div>
  )
}

/** Your course. The code and the name carry the identity; the term, credits
 *  and grade are what the transcript said about it. */
function CourseTitle({ course }: { course: TransferCourse }) {
  return (
    <p className="truncate text-body-md text-gray-100">
      {course.code} &nbsp;•&nbsp; {course.name}
    </p>
  )
}

function CourseMeta({ children }: { children: ReactNode }) {
  return <p className="truncate text-body-md text-gray-80">{children}</p>
}

/** Confirmed rows are the only ones with two sides, because they are the only
 *  ones with something on the right: an arrow earns its place when there is a
 *  destination, and pending and no-credit rows have none. */
function ConfirmedRow({ course }: { course: TransferCourse }) {
  return (
    <div className="flex items-center gap-6 border border-gray-40 p-[7px] -mt-px first:mt-0 first:rounded-t-md last:rounded-b-md">
      <div className="flex min-w-0 flex-1 flex-col">
        <CourseTitle course={course} />
        <CourseMeta>
          {course.term} • {course.credits} credits • {course.grade}
        </CourseMeta>
      </div>
      <div className="flex h-9 w-6 shrink-0 items-center justify-center">
        <Icon name="east" size={16} className="text-gray-60" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate text-body-md text-gray-100">
          {course.equivalent!.code} &nbsp;•&nbsp; {course.equivalent!.name}
        </p>
        <CourseMeta>
          {course.equivalent!.credits} credits • {course.equivalent!.grade}
        </CourseMeta>
      </div>
    </div>
  )
}

/** One line, because there is one thing to say. A course with no credit is
 *  greyed whole — the row is the verdict, not a row with a verdict on it. */
function SingleRow({ course, muted }: { course: TransferCourse; muted?: boolean }) {
  return (
    <div className="flex items-center border border-gray-40 bg-card px-[11px] py-[7px] -mt-px first:mt-0 first:rounded-t-md last:rounded-b-md">
      <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
        <p className={`truncate text-body-md ${muted ? "text-gray-80" : "text-gray-100"}`}>
          {course.code} &nbsp;•&nbsp; {course.name}
        </p>
        <p className="shrink-0 text-body-md text-gray-80">
          {course.term} • {course.credits} credits • {course.grade}
        </p>
      </div>
    </div>
  )
}

export function VerdictCard() {
  const confirmed = creditsBy("confirmed")

  return (
    <ExploreCard>
      <ExploreCardBody>
        <div className="flex w-full flex-col gap-4">
          <div className="flex w-full flex-col gap-2">
            <p className="text-h400 font-semibold text-gray-100">
              {confirmed} of your {TOTAL_CREDITS} credits transfer to {UNIVERSITY}!
            </p>
            <p className="text-field text-gray-80">
              {creditsBy("pending")} are pending review and {creditsBy("none")} get no credit.
            </p>
          </div>
          <VerdictBar />
        </div>

        {VERDICT_SECTIONS.map((section) => {
          const courses = TRANSFER_COURSES.filter((c) => c.verdict === section.verdict)
          if (courses.length === 0) return null

          return (
            <div key={section.verdict} className="flex w-full flex-col gap-2">
              <SectionLabel>{section.label}</SectionLabel>
              <div className="flex w-full flex-col rounded-md">
                {courses.map((course) =>
                  section.verdict === "confirmed" ? (
                    <ConfirmedRow key={course.code} course={course} />
                  ) : (
                    <SingleRow
                      key={course.code}
                      course={course}
                      muted={section.verdict === "none"}
                    />
                  )
                )}
              </div>
            </div>
          )
        })}
      </ExploreCardBody>
    </ExploreCard>
  )
}

/* ============================================================ Programs */

export function ProgramsCard() {
  return (
    <ExploreCard>
      <ExploreCardBody className="gap-6">
        <div className="flex w-full items-start gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="text-caption-lg font-semibold text-gray-100">Recommended Programs</p>
            <p className="text-field text-gray-80">
              Based on your credits, interests, and field of study
            </p>
          </div>
          <Button className="shrink-0">View Programs</Button>
        </div>

        <div className="grid w-full grid-cols-1 gap-2 @3xl:grid-cols-2">
          {PROGRAMS.map((program) => (
            <div
              key={program.name}
              className="flex flex-col gap-4 rounded-md border border-gray-40 p-[15px] opacity-80 transition-all hover:border-primary-50 hover:opacity-100"
            >
              <p className="text-body-md font-semibold text-gray-100">{program.name}</p>
              {/* The badges are the recommendation's reasoning, said in the
                  fewest words that still distinguish one program from the
                  next. */}
              <div className="flex flex-wrap gap-[7px]">
                {program.reasons.map((reason) => (
                  <Badge key={reason}>{reason}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ExploreCardBody>
    </ExploreCard>
  )
}

/* ============================================================ Discover */

export function DiscoverCard() {
  return (
    <ExploreCard>
      <ExploreCardBody className="gap-6">
        <p className="text-caption-lg font-semibold text-gray-100">Discover {UNIVERSITY}</p>
        <div className="grid w-full grid-cols-2 gap-4 @3xl:grid-cols-4">
          {DISCOVER.map((item) => (
            <a
              key={item.title}
              href="#"
              className="flex flex-col overflow-hidden rounded-md border border-gray-40 opacity-80 transition-all hover:border-primary-50 hover:opacity-100"
            >
              <img
                src={item.image}
                alt=""
                className="aspect-[400/240] w-full border-b border-gray-40 object-cover"
              />
              <span className="flex flex-col gap-1 p-[15px]">
                <span className="text-body-md font-semibold text-gray-100">{item.title}</span>
                <span className="text-body-md text-gray-80">{item.description}</span>
              </span>
            </a>
          ))}
        </div>
      </ExploreCardBody>
    </ExploreCard>
  )
}

/* ============================================================ Rail */

/** What they gave us, and the one thing we want them to do with it.
 *
 * Every line here is editable, because the whole page is an estimate built
 * from five facts — and the fastest way to a better estimate is to correct one
 * of them. `Start application` is the only filled button on the screen. */
export function VisitorRail({
  className,
  transcripts,
  answers,
  interests,
  onEditTranscripts,
  onEditProfile,
}: {
  className?: string
  transcripts: Transcript[]
  answers: Answers
  interests: string[]
  onEditTranscripts: () => void
  onEditProfile: () => void
}) {
  const profile = [
    ...PROFILE_QUESTIONS.map((question) => ({
      label: question.label,
      value: answers[question.id] ?? "—",
    })),
    { label: "What areas interest you?", value: interests.join(", ") || "—" },
  ]

  return (
    <ExploreCard className={cn("w-full @7xl:w-[360px]", className)}>
      <div className="flex flex-col gap-6 px-[31px] py-[23px]">
        <div className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarFallback className="text-field text-foreground">
              {VISITOR.initials}
            </AvatarFallback>
          </Avatar>
          <p className="min-w-0 flex-1 truncate text-sm text-gray-80">{VISITOR.email}</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <SectionLabel>My transcripts</SectionLabel>
            <button
              type="button"
              onClick={onEditTranscripts}
              className="shrink-0 text-body-md text-gray-80 underline underline-offset-2 hover:text-gray-100"
            >
              edit or add
            </button>
          </div>
          {transcripts.map((transcript) => (
            <div key={transcript.id} className="flex items-center gap-2 opacity-80">
              <Icon
                name={transcript.kind === "college" ? "school" : "fact-check"}
                size={16}
                className="text-gray-100"
              />
              <p className="min-w-0 flex-1 truncate text-body-md text-gray-100">
                {transcript.name}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <SectionLabel>My profile</SectionLabel>
            <button
              type="button"
              onClick={onEditProfile}
              className="shrink-0 text-body-md text-gray-80 underline underline-offset-2 hover:text-gray-100"
            >
              edit
            </button>
          </div>
          {profile.map((line) => (
            <div key={line.label} className="flex flex-col gap-1">
              <p className="text-body-md text-gray-100">{line.label}</p>
              <p className="text-label-md text-gray-80">{line.value}</p>
            </div>
          ))}
        </div>

        <Button variant="primary" className="w-full">
          <Icon name="open-in-new" size={16} />
          Start application
        </Button>
      </div>
    </ExploreCard>
  )
}
