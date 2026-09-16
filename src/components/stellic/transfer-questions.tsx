import type { ReactNode } from "react"
import { cn } from "cn"

import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"
import { CardHeading, SearchField, SectionLabel } from "@/components/stellic/transfer-wizard"
import { INTERESTS, PROFILE_QUESTIONS } from "@/data/transfer"

/* The three questions, asked while the transcript is being read.
 *
 * They are on this screen for one reason: the read takes up to a minute, and a
 * minute of a spinner is a minute of nothing. So the wait is where the profile
 * gets built — and none of it is required, because a visitor who only wants
 * the credit count should get the credit count. The primary button waits on
 * the transcript, never on the answers.
 *
 * Everything here is the same chip. A segmented pair, a segmented trio and a
 * wrapping set of ten are one control at three sizes, which is why the answers
 * are one map of question id to value rather than three pieces of state. */

export type Answers = Record<string, string | undefined>

/** The design draws an unanswered group at 80%. Answering one brings it up,
 *  so the card quietly tracks how far down it you are. */
function QuestionGroup({
  label,
  answered,
  gap = "gap-2.5",
  className,
  children,
}: {
  label: string
  answered: boolean
  gap?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col transition-opacity",
        gap,
        answered ? "opacity-100" : "opacity-80",
        className
      )}
    >
      <SectionLabel>{label}</SectionLabel>
      {children}
    </div>
  )
}

export function TransferQuestions({
  answers,
  onAnswer,
  interests,
  onToggleInterest,
  query,
  onQuery,
  footer,
}: {
  answers: Answers
  onAnswer: (id: string, value: string) => void
  interests: string[]
  onToggleInterest: (interest: string) => void
  query: string
  onQuery: (value: string) => void
  footer: ReactNode
}) {
  const needle = query.trim().toLowerCase()
  const matches = INTERESTS.filter((interest) => interest.toLowerCase().includes(needle))

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex w-full flex-col gap-6">
        <CardHeading
          title="These help us match programs to you"
          description="Your answers shape what we recommend."
          className="pb-2"
        />

        {PROFILE_QUESTIONS.map((question) => (
          <QuestionGroup
            key={question.id}
            label={question.label}
            answered={Boolean(answers[question.id])}
          >
            <div className="flex flex-wrap items-start gap-2">
              {question.options.map((option) => (
                <Button
                  key={option}
                  size="sm"
                  aria-pressed={answers[question.id] === option}
                  onClick={() => onAnswer(question.id, option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </QuestionGroup>
        ))}

        <QuestionGroup
          label="What areas interest you?"
          answered={interests.length > 0}
          gap="gap-2"
          className="pb-6"
        >
          <SearchField
            placeholder="Search for interests"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            aria-label="Search for interests"
          />
          <div className="flex flex-wrap items-start gap-2">
            {matches.map((interest) => {
              const picked = interests.includes(interest)
              return (
                <Button
                  key={interest}
                  size="sm"
                  aria-pressed={picked}
                  onClick={() => onToggleInterest(interest)}
                >
                  {/* The glyph says what pressing does next, so a picked chip
                      shows what it already is rather than offering to add it
                      again. */}
                  <Icon name={picked ? "check" : "add"} size={16} />
                  {interest}
                </Button>
              )
            })}
            {matches.length === 0 && (
              <p className="text-body-md text-gray-80">
                Nothing here matches “{query.trim()}”.
              </p>
            )}
          </div>
        </QuestionGroup>
      </div>

      {footer}
    </div>
  )
}
